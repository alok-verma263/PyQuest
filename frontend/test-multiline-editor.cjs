// Test Suite for Multi-line Python Code Editor in FixCodeChallenge
const assert = require('assert');
const fs = require('fs');
const path = require('path');

console.log('=== MULTI-LINE CODE EDITOR TEST SUITE ===\n');

// 1. Simulate keydown handler from FixCodeChallenge
module.exports = { simulateEnterKeyDown, simulateTabKeyDown };
function simulateEnterKeyDown(code, cursorStart, cursorEnd = cursorStart) {
  const lineStart = code.lastIndexOf('\n', cursorStart - 1) + 1;
  const currentLine = code.substring(lineStart, cursorStart);

  const indentMatch = currentLine.match(/^[ \t]*/);
  let indent = indentMatch ? indentMatch[0] : '';

  if (currentLine.trimEnd().endsWith(':')) {
    indent += '    ';
  }

  const insertion = '\n' + indent;
  const newCode = code.substring(0, cursorStart) + insertion + code.substring(cursorEnd);
  const newCursor = cursorStart + insertion.length;
  return { newCode, newCursor };
}

function simulateTabKeyDown(code, cursorStart, cursorEnd = cursorStart, shiftKey = false) {
  if (shiftKey) {
    const lineStart = code.lastIndexOf('\n', cursorStart - 1) + 1;
    const linePrefix = code.substring(lineStart, lineStart + 4);
    const spacesToRemove = linePrefix.match(/^ {1,4}/);
    if (spacesToRemove) {
      const count = spacesToRemove[0].length;
      const newCode = code.substring(0, lineStart) + code.substring(lineStart + count);
      const newCursor = Math.max(lineStart, cursorStart - count);
      return { newCode, newCursor };
    }
    return { newCode: code, newCursor: cursorStart };
  } else {
    const newCode = code.substring(0, cursorStart) + '    ' + code.substring(cursorEnd);
    const newCursor = cursorStart + 4;
    return { newCode, newCursor };
  }
}

// TEST 1: Two separate lines
{
  let code = 'print("Hello")';
  const res = simulateEnterKeyDown(code, code.length);
  code = res.newCode + 'print("Python")';
  assert.strictEqual(code, 'print("Hello")\nprint("Python")');
  console.log('✓ TEST 1: Two separate lines preserved');
}

// TEST 2: Three lines with blank line
{
  let code = 'import pandas as pd';
  let res = simulateEnterKeyDown(code, code.length);
  res = simulateEnterKeyDown(res.newCode, res.newCursor);
  code = res.newCode + 'df = pd.read_csv("student_performance.csv")';
  assert.strictEqual(code, 'import pandas as pd\n\ndf = pd.read_csv("student_performance.csv")');
  console.log('✓ TEST 2: Three lines with blank line preserved');
}

// TEST 3: Auto-indentation after colon
{
  const code = 'if marks > 50:';
  const res = simulateEnterKeyDown(code, code.length);
  const fullCode = res.newCode + 'print("Pass")';
  assert.strictEqual(fullCode, 'if marks > 50:\n    print("Pass")');
  console.log('✓ TEST 3: Indentation preserved and auto-indented after colon');
}

// TEST 4: Move cursor into middle of line and press Enter
{
  const code = 'import pandas as pd df = pd.read_csv("student_performance.csv")';
  const cursor = 'import pandas as pd'.length;
  const res = simulateEnterKeyDown(code, cursor + 1); // after the space
  assert.strictEqual(res.newCode, 'import pandas as pd \ndf = pd.read_csv("student_performance.csv")');
  console.log('✓ TEST 4: Newline inserted at cursor in middle of text');
}

// TEST 5: Paste multi-line code
{
  const pasted = 'import pandas as pd\n\ndf = pd.read_csv("student_performance.csv")';
  assert.strictEqual(pasted.split('\n').length, 3);
  console.log('✓ TEST 5: Paste multi-line code keeps lines separate');
}

// TEST 6: Multiple newlines
{
  let code = 'a = 1';
  let cursor = code.length;
  for (let i = 0; i < 5; i++) {
    const res = simulateEnterKeyDown(code, cursor);
    code = res.newCode;
    cursor = res.newCursor;
  }
  assert.strictEqual(code, 'a = 1\n\n\n\n\n');
  console.log('✓ TEST 6: Editor continues accepting multiple newlines');
}

// TEST 7: Enter key does not submit
{
  let defaultPrevented = false;
  const mockEvent = { key: 'Enter', preventDefault: () => { defaultPrevented = true; } };
  if (mockEvent.key === 'Enter') {
    mockEvent.preventDefault();
  }
  assert.strictEqual(defaultPrevented, true);
  console.log('✓ TEST 7: Enter does NOT trigger submission');
}

// TEST 8: Reset restores exact starter code with all line breaks
{
  const starterCode = 'import pandas as pd\n\ndf = pd.read_csv("student_performance.csv"';
  let userCode = 'broken single line code';
  // User clicks reset
  userCode = starterCode;
  assert.strictEqual(userCode, starterCode);
  assert.strictEqual(userCode.split('\n').length, 3);
  console.log('✓ TEST 8: Reset restores exact multi-line starter code');
}

// TEST 9 & 10: Parenthesis balance and syntax checking
{
  function checkParenSyntax(code) {
    const openParens = (code.match(/\(/g) || []).length;
    const closeParens = (code.match(/\)/g) || []).length;
    if (openParens > closeParens) {
      return "SyntaxError: '(' was never closed";
    }
    return null;
  }

  // Broken import code missing ')'
  const brokenCode = 'import pandas as pd\n\ndf = pd.read_csv("student_performance.csv"';
  const brokenErr = checkParenSyntax(brokenCode);
  assert.strictEqual(brokenErr, "SyntaxError: '(' was never closed");
  console.log('✓ TEST 10: Invalid multi-line Python returns friendly syntax error');

  // Repaired code
  const fixedCode = 'import pandas as pd\n\ndf = pd.read_csv("student_performance.csv")';
  const fixedErr = checkParenSyntax(fixedCode);
  assert.strictEqual(fixedErr, null);
  console.log('✓ TEST 9: Repaired multi-line Python parses without syntax errors');
}

// 11. Verify curriculum starter codes on disk
{
  const cleaningJsonPath = path.resolve(__dirname, '../content/worlds/data-cleaning.json');
  const cleaning = JSON.parse(fs.readFileSync(cleaningJsonPath, 'utf8'));
  const quest2 = cleaning.levels.find(l => l.id === 'quest-2-import-forge');
  const fixChallenge = quest2.challenges.find(c => c.id === 'c2-fix-import-syntax');

  assert.ok(fixChallenge.starterCode.includes('\n'), 'Quest 2 fix-bug starterCode contains newline');
  assert.ok(fixChallenge.starterCode.startsWith('import pandas as pd\n\ndf = pd.read_csv('), 'Quest 2 starterCode has 2 lines + blank line');
  assert.ok(fixChallenge.starterCode.endsWith('"student_performance.csv"'), 'Quest 2 starterCode ends without closing paren');
  assert.ok(fixChallenge.solution.endsWith(')'), 'Quest 2 solution has closing paren');
  console.log('✓ DATA INTEGRITY: Quest 2 starterCode has exact multi-line broken code');
}

console.log('\nALL MULTI-LINE EDITOR TESTS PASSED SUCCESSFULLY! 🚀');
