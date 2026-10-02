# PyQuest ⚔️🐍

> **Tagline:** Learn Python. Complete Quests. Master Code.

PyQuest is a gamified, interactive Python learning adventure. Journey through enchanted programming realms, tackle interactive theory scrolls, conquer coding trials in a real-time browser sandbox, earn XP and gold, and level up your Python prowess!

---

## 🌟 Features (MVP Slice)

- 🗺️ **Interactive Adventure Map:** Explore World 1 (*The Python Realm / Python Basics*) with interactive level nodes and path progression.
- 📜 **Interactive Theory Scrolls:** Bite-sized interactive lessons with clear explanations, lore notes, and live code examples.
- ⚔️ **Diverse Quest Challenges:** Multiple-choice quizzes, bug fixes, output predictions, and hands-on coding challenges.
- 💻 **In-Browser Python Editor:** Syntax-highlighted code editor with line numbers, code reset, and instant run actions.
- 🛡️ **Safe Client-Side Execution:** Sandboxed WebAssembly Python runtime powered by Pyodide—no server-side security vulnerabilities.
- 🏆 **Progression & Economy:** Earn XP and coins for quest completions, track mastery stars, and unlock new level nodes.
- 💾 **Dual-Layer Persistence:** Optimistic instant local storage with automatic backend REST synchronization.
- 🎨 **Original Visual Identity:** Crafted with fantasy-tech aesthetics, custom dark palettes, and responsive layouts.

---

## 🏗️ Architecture

```
PyQuest Monorepo
├── frontend/        # React + TypeScript + Vite + Tailwind CSS (SPA & Adventure Engine)
├── backend/         # FastAPI + Python 3.10+ + SQLAlchemy 2.0 (REST API & Persistence)
├── content/         # Structured JSON curriculum (Worlds, Levels, Lessons, Challenges)
├── assets/          # Sprites, UI art, icons, audio
└── docs/            # ARCHITECTURE.md & DEVELOPMENT_PLAN.md
```

Detailed architectural blueprints are documented in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/DEVELOPMENT_PLAN.md`](docs/DEVELOPMENT_PLAN.md).

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: v3.10+ (tested on Python 3.14)
- **Git**

---

### 1. Backend Setup (FastAPI)

Navigate to the backend directory:
```bash
cd backend
```

Create and activate a virtual environment:
```powershell
# Windows PowerShell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

Install backend dependencies:
```bash
pip install -r requirements.txt
```

Start the FastAPI development server:
```bash
python -m uvicorn app.main:app --reload --port 8000
```

The backend API will be available at:
- API Root: `http://localhost:8000/api/health`
- Interactive Swagger Docs: `http://localhost:8000/docs`

---

### 2. Frontend Setup (React + Vite + TypeScript)

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install frontend dependencies:
```bash
npm install
```

Start the Vite development server:
```bash
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🗺️ Curriculum: World 1 — Python Basics

| Level | Quest Title | Topics Covered |
|---|---|---|
| **Level 1** | *The Spark of Syntax* | Python syntax, statements, the `print()` function |
| **Level 2** | *The Alchemy of Variables* | Variables, data types (`str`, `int`, `float`, `bool`) |
| **Level 3** | *The Scroll of Interaction* | User input `input()`, type casting, arithmetic expressions |

---

## 🔒 Security Principles

- **No Remote Code Execution on Backend:** The FastAPI backend does not run arbitrary `exec()` or `eval()` on user code.
- **Client-Side Sandbox:** Coding quests execute inside a client-side WebWorker utilizing Pyodide (CPython compiled to WebAssembly), isolating all execution from system resources.

---

## 📜 License

MIT License. Crafted with passion for Python learners everywhere.
