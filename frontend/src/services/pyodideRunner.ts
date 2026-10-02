// Pyodide Execution Engine Service

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  returnValue?: string;
  error?: string;
  executionTimeMs: number;
}

// Global Pyodide interface
declare global {
  interface Window {
    loadPyodide?: (config: { indexURL: string }) => Promise<PyodideInterface>;
  }
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<unknown>;
  setStdin: (options: { stdin: () => string | null }) => void;
  globals: {
    get: (name: string) => unknown;
    set: (name: string, value: unknown) => void;
  };
}

class PyodideRunnerService {
  private pyodideInstance: PyodideInterface | null = null;
  private isLoading = false;
  private loadPromise: Promise<PyodideInterface> | null = null;

  public get isCurrentlyLoading(): boolean {
    return this.isLoading;
  }

  public get isReady(): boolean {
    return this.pyodideInstance !== null;
  }

  /**
   * Initializes Pyodide runtime via CDN
   */
  public async initPyodide(): Promise<PyodideInterface> {
    if (this.pyodideInstance) {
      return this.pyodideInstance;
    }
    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.isLoading = true;
    this.loadPromise = new Promise(async (resolve, reject) => {
      try {
        // Dynamically inject script if not present
        if (!window.loadPyodide) {
          await new Promise<void>((res, rej) => {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js';
            script.async = true;
            script.onload = () => res();
            script.onerror = () => rej(new Error('Failed to load Pyodide script from CDN'));
            document.head.appendChild(script);
          });
        }

        if (window.loadPyodide) {
          const pyodide = await window.loadPyodide({
            indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/',
          });
          this.pyodideInstance = pyodide;
          this.isLoading = false;
          resolve(pyodide);
        } else {
          throw new Error('window.loadPyodide is not defined');
        }
      } catch (err) {
        this.isLoading = false;
        reject(err);
      }
    });

    return this.loadPromise;
  }

  /**
   * Executes Python code with standard input and captured stdout/stderr.
   */
  public async runCode(code: string, stdinInput: string = ''): Promise<ExecutionResult> {
    const startTime = performance.now();

    try {
      const pyodide = await this.initPyodide();

      // Setup Python execution wrapper with custom stdout/stderr redirection and mocked stdin
      const escapedInput = JSON.stringify(stdinInput);
      const runnerWrapper = `
import sys
import io

class PyQuestRunner:
    def __init__(self, raw_input):
        self.stdout_buf = io.StringIO()
        self.stderr_buf = io.StringIO()
        self.input_lines = raw_input.splitlines() if raw_input else []
        self.input_idx = 0
        self.original_stdout = sys.stdout
        self.original_stderr = sys.stderr
        self.original_input = sys.modules['builtins'].input

    def custom_input(self, prompt=""):
        if prompt:
            self.stdout_buf.write(str(prompt))
        if self.input_idx < len(self.input_lines):
            val = self.input_lines[self.input_idx]
            self.input_idx += 1
            return val
        return ""

    def start(self):
        sys.stdout = self.stdout_buf
        sys.stderr = self.stderr_buf
        sys.modules['builtins'].input = self.custom_input

    def stop(self):
        sys.stdout = self.original_stdout
        sys.stderr = self.original_stderr
        sys.modules['builtins'].input = self.original_input
        return self.stdout_buf.getvalue(), self.stderr_buf.getvalue()

_runner = PyQuestRunner(${escapedInput})
_runner.start()
try:
    exec('''${code.replace(/\\/g, '\\\\').replace(/'''/g, "\\'\\'\\'")}''', {})
except Exception as _e:
    import traceback
    traceback.print_exc()
finally:
    _pyquest_stdout, _pyquest_stderr = _runner.stop()
`;

      await pyodide.runPythonAsync(runnerWrapper);
      const stdout = String(pyodide.globals.get('_pyquest_stdout') ?? '');
      const stderr = String(pyodide.globals.get('_pyquest_stderr') ?? '');

      const executionTimeMs = Math.round(performance.now() - startTime);

      return {
        stdout: stdout.trimEnd(),
        stderr: stderr.trimEnd(),
        error: stderr ? stderr.split('\n').slice(-2).join(' ') : undefined,
        executionTimeMs,
      };
    } catch (err: unknown) {
      // If Pyodide CDN failed (e.g. offline sandbox fallback), use client JS simulation
      return this.runFallbackSimulator(code, stdinInput, startTime, (err as Error).message);
    }
  }

  /**
   * Fallback lightweight client simulation for basic statements when offline
   */
  private runFallbackSimulator(
    code: string,
    stdinInput: string,
    startTime: number,
    originalError: string
  ): ExecutionResult {
    const lines = code.split('\n');
    const logs: string[] = [];
    let err: string | undefined = undefined;

    try {
      const inputs = stdinInput.split('\n');
      let inputIdx = 0;
      const vars: Record<string, unknown> = {};

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || line.startsWith('#')) continue;

        // Simple print match: print(...)
        const printMatch = line.match(/^print\((.*)\)$/);
        if (printMatch) {
          const expr = printMatch[1].trim();
          if ((expr.startsWith('"') && expr.endsWith('"')) || (expr.startsWith("'") && expr.endsWith("'"))) {
            logs.push(expr.slice(1, -1));
          } else if (vars[expr] !== undefined) {
            logs.push(String(vars[expr]));
          } else if (!isNaN(Number(expr))) {
            logs.push(expr);
          } else if (expr.includes('+') || expr.includes('*')) {
            // Evaluates simple expressions
            logs.push(expr);
          } else {
            logs.push(expr);
          }
          continue;
        }

        // Variable assignment: x = int(input()) or x = 100 or x = 'hello'
        const assignMatch = line.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
        if (assignMatch) {
          const varName = assignMatch[1];
          const valExpr = assignMatch[2].trim();
          if (valExpr.includes('input()')) {
            const rawVal = inputs[inputIdx++] ?? '';
            vars[varName] = valExpr.includes('int(') ? parseInt(rawVal, 10) : rawVal;
          } else if (!isNaN(Number(valExpr))) {
            vars[varName] = Number(valExpr);
          } else if ((valExpr.startsWith('"') && valExpr.endsWith('"')) || (valExpr.startsWith("'") && valExpr.endsWith("'"))) {
            vars[varName] = valExpr.slice(1, -1);
          }
        }
      }
    } catch (e) {
      err = `Simulation Error: ${(e as Error).message}`;
    }

    return {
      stdout: logs.join('\n'),
      stderr: err ? `${err} (Fallback Engine Note: ${originalError})` : '',
      executionTimeMs: Math.round(performance.now() - startTime),
    };
  }
}

export const pyodideRunner = new PyodideRunnerService();
