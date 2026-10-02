# PyQuest Architecture Specification

**Tagline:** *Learn Python. Complete Quests. Master Code.*  
**System Version:** 1.0.0 (MVP Foundation)  
**Document Status:** Approved Core Architecture

---

## 1. Executive Summary

PyQuest is an interactive, gamified Python education platform combining RPG/adventure progression, interactive curriculum content, real-time Python execution, and tactile game mechanics. Unlike standard learning management systems (LMS), PyQuest presents educational milestones as an interconnected fantasy tech adventure where players travel across themed worlds, unlock level nodes, solve coding trials, and earn rewards (XP, Coins, Badges).

The architecture is built on three fundamental pillars:
1. **Content-Driven Modularity:** Curriculums, lessons, quizzes, and code challenges are decoupled from UI rendering using strictly validated JSON schemas.
2. **Safe Code Execution Isolation:** Client-side Python execution via Pyodide WebAssembly in an isolated worker, with architectural hooks for future sandboxed server-side execution.
3. **Decoupled Game & Application Shell:** A responsive React application shell providing navigation, HUD, editor, and lesson panels, paired with an interactive adventure map canvas.

---

## 2. System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                              CLIENT BROWSER                            │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                      PyQuest Application Shell                 │   │
│   │  (React 18/19 + TypeScript + Tailwind CSS + Lucide Icons)       │   │
│   │                                                                │   │
│   │  ┌───────────────┐ ┌───────────────┐ ┌──────────────────────┐  │   │
│   │  │ Navigation    │ │ Quest HUD     │ │ Notification/Modals  │  │   │
│   │  │ (Home/Map/...)│ │ (XP, Coins)   │ │ (Level Clear, etc.)  │  │   │
│   │  └───────────────┘ └───────────────┘ └──────────────────────┘  │   │
│   │                                                                │   │
│   │  ┌──────────────────────┐   ┌───────────────────────────────┐  │   │
│   │  │ Adventure Map Stage  │   │ Lesson & Challenge Engine     │  │   │
│   │  │ (Canvas / Phaser 3 / │   │ - Theory & Markdown Reader    │  │   │
│   │  │  Interactive Nodes)  │   │ - Multiple Choice Quiz        │  │   │
│   │  └──────────────────────┘   │ - Code Editor (Monaco/CodeM)  │  │   │
│   │                             └──────────────┬────────────────┘  │   │
│   └────────────────────────────────────────────┼───────────────────┘   │
│                                                │                       │
│                        Execution Request       ▼                       │
│                   ┌────────────────────────────────────────┐           │
│                   │        Client Python Sandbox           │           │
│                   │   (Pyodide WASM / WebWorker Layer)     │           │
│                   │   - STDOUT / STDERR capture            │           │
│                   │   - Execution timeout & limits         │           │
│                   │   - Test harness evaluation            │           │
│                   └────────────────────────────────────────┘           │
│                                        ▲                               │
│                                        │ Sync / Fallback               │
│                                        ▼                               │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │              Local State & Storage Cache Engine                │   │
│   │   (Profile, Active Level, Offline Progress Cache)              │   │
│   └────────────────────────────────────┬───────────────────────────┘   │
└────────────────────────────────────────┼───────────────────────────────┘
                                         │ REST API
                                         ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           BACKEND SERVICES                             │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                     FastAPI Application Server                 │   │
│   │                                                                │   │
│   │  /api/health            - System status & diagnostics          │   │
│   │  /api/worlds            - World & Level content catalog        │   │
│   │  /api/challenges        - Challenge validation & test suites   │   │
│   │  /api/progress          - Player progress persistence          │   │
│   │  /api/profile           - Player profile & inventory           │   │
│   └────────────────────────────────────┬───────────────────────────┘   │
│                                        │                               │
│                                        ▼                               │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │                Database Layer (SQLAlchemy 2.0)                 │   │
│   │   - SQLite (MVP local dev) / PostgreSQL (Production)           │   │
│   │   - Tables: Users, Profiles, Progress, Attempts, Badges        │   │
│   └────────────────────────────────────────────────────────────────┘   │
│                                                                        │
│   ┌────────────────────────────────────────────────────────────────┐   │
│   │        [Future Phase] Containerized Isolated Code Runner       │   │
│   │   - gVisor / nsjail / ephemeral Docker runner                  │   │
│   │   - Hard CPU/RAM/pids/network restrictions                     │   │
│   └────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Technology Stack & Decision Matrix

| Layer | Technology | Rationale |
|---|---|---|
| **Frontend Framework** | React + TypeScript + Vite | Blazing fast HMR, type-safety, rich ecosystem, modular UI component tree. |
| **Styling** | Tailwind CSS + Custom Game Tokens | Clean utilities, custom pixel/fantasy color palettes, responsive layouts, maintainable design system. |
| **Interactive Map / Game** | HTML5 Canvas / Phaser 3 modular hook | Enables smooth node rendering, player path travel, particle effects, and interactive level nodes. |
| **Code Editor** | Monaco Editor / CodeMirror 6 | Real IDE capabilities: syntax highlighting, line numbers, autocomplete, tab indentation, dark theme. |
| **Python Execution** | Pyodide (WASM) in WebWorker | Instant in-browser execution with zero backend compute load, complete isolation from host machine, safe input/output piping. |
| **Backend API** | FastAPI (Python 3.10+) | High-performance asynchronous API, automatic OpenAPI/Swagger docs, native Pydantic validation. |
| **ORM & Database** | SQLAlchemy 2.0 + SQLite | Zero-config portable database for development; migration-ready for PostgreSQL in production. |

---

## 4. Repository Directory Structure

```
pyquest/
├── frontend/                     # React + TypeScript + Vite web app
│   ├── public/                   # Static assets, favicon, Pyodide worker
│   │   └── assets/               # Visual art, sprites, tiles, icons
│   ├── src/
│   │   ├── components/           # Reusable UI primitives (Button, Card, Modal, HUD, Badge)
│   │   ├── features/             # Domain features
│   │   │   ├── map/              # Adventure Map components and node renderer
│   │   │   ├── lesson/           # Theory reader & lesson slideshow
│   │   │   ├── challenge/        # Quiz & coding challenge engines
│   │   │   ├── editor/           # Python code editor and terminal output panel
│   │   │   └── profile/          # Player stats, avatar, and achievements
│   │   ├── game/                 # Phaser / Canvas map engine & animations
│   │   ├── hooks/                # Custom React hooks (usePyodide, useProgress, useAudio)
│   │   ├── services/             # API client, Pyodide runner service, storage service
│   │   ├── data/                 # Content catalog fallback & bundled world definitions
│   │   ├── types/                # TypeScript interfaces (World, Level, Challenge, User)
│   │   ├── App.tsx               # Main application container & router
│   │   ├── main.tsx              # React DOM entry point
│   │   └── index.css             # Tailwind directives & design system tokens
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/                      # FastAPI Python backend
│   ├── app/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   │   ├── health.py     # Healthcheck & ping
│   │   │   │   ├── worlds.py     # Worlds & levels query routes
│   │   │   │   ├── progress.py   # User progress save/load
│   │   │   │   └── profile.py    # Player profile management
│   │   │   └── api.py            # API router aggregator
│   │   ├── core/
│   │   │   ├── config.py         # App settings & environment vars
│   │   │   └── security.py       # Auth utilities (future)
│   │   ├── database/
│   │   │   ├── session.py        # SQLAlchemy engine and sessionmaker
│   │   │   └── base.py           # Declarative base
│   │   ├── models/               # SQLAlchemy DB entities
│   │   │   ├── user.py
│   │   │   ├── profile.py
│   │   │   ├── progress.py
│   │   │   └── attempt.py
│   │   ├── schemas/              # Pydantic validation schemas
│   │   │   ├── world.py
│   │   │   ├── progress.py
│   │   │   └── profile.py
│   │   ├── services/             # Business logic services
│   │   └── main.py               # FastAPI application factory & CORS setup
│   └── requirements.txt
│
├── content/                      # Content-driven curriculum definitions
│   ├── worlds/                   # World definitions
│   │   └── python-basics.json    # World 1: Python Basics
│   ├── levels/                   # Level descriptors
│   ├── lessons/                  # Markdown lesson theory
│   └── challenges/               # Quizzes, fill-in-blanks, coding test suites
│
├── assets/                       # Raw source assets & design tokens
│   ├── characters/
│   ├── environments/
│   ├── ui/
│   └── icons/
│
├── docs/                         # Architecture, guides, and plans
│   ├── ARCHITECTURE.md
│   └── DEVELOPMENT_PLAN.md
│
├── README.md
└── .gitignore
```

---

## 5. Content-Driven Curriculum Schema

Every world, level, lesson, and challenge is described via declarative schemas:

### World Descriptor (`WorldSchema`)
- `id`: unique string slug (e.g., `python-basics`)
- `title`: display name (e.g., "Python Basics")
- `tagline`: thematic subtitle
- `description`: curriculum summary
- `order`: sequence index
- `theme`: visual styling (colors, ambient assets, map background)
- `levels`: array of `LevelSchema`

### Level Descriptor (`LevelSchema`)
- `id`: unique string slug (e.g., `level-1-print`)
- `worldId`: parent world reference
- `title`: level title
- `description`: level summary
- `position`: `{ x: number, y: number }` coordinates on the adventure map
- `xpReward`: base XP reward
- `coinReward`: base coin reward
- `lessons`: array of lesson sections (theory + code examples)
- `challenges`: array of challenge tasks (multiple choice, coding, bug fix)

### Challenge Schema
- `id`: unique challenge slug
- `type`: `multiple-choice` | `fill-blank` | `predict-output` | `fix-bug` | `write-code`
- `instructions`: user quest guidance
- `question`: optional quiz question
- `options`: optional choice items
- `starterCode`: Python starter code template
- `solution`: expected answer or test suite
- `testCases`: array of `{ input: string, expectedOutput: string, hidden?: boolean }`
- `hints`: progressive hint strings
- `explanation`: post-challenge educational review

---

## 6. Execution Security & Sandboxing Strategy

### MVP Client-Side Sandboxing (Pyodide WebWorker)
1. **Zero Host Execution Risk:** User code runs inside the browser's WebAssembly sandbox. It has no access to the user's host filesystem, local network, or OS.
2. **Worker Isolation:** The Pyodide runtime runs in a dedicated Web Worker to prevent UI thread freezing during infinite loops or intensive computation.
3. **Execution Timeouts:** A strict execution watchdog (e.g., 5-second hard timeout) terminates the worker if the user executes an infinite `while True:` loop.
4. **Standard I/O Redirection:** `sys.stdout` and `sys.stderr` are captured and streamed to the UI output terminal.

### Future Server-Side Execution Model
For multi-user competitive runs, automated grading servers, or heavy tasks:
- **Never** execute `exec()` or `eval()` directly in the backend process.
- Dedicated runner containers via **Docker/Podman** or lightweight microVMs/sandboxes (**nsjail**, **gVisor**).
- Non-root user, memory capped (128MB), CPU capped (0.5 vCPU), wall-time capped (3s), network disabled (`--net=none`), read-only root filesystem.

---

## 7. State Management & Progression

```
[Level States]
  LOCKED  ──────────>  AVAILABLE  ──────────>  IN_PROGRESS  ──────────>  COMPLETED  ──────────>  MASTERED
 (Default for       (Prerequisite            (Lesson or Quiz           (All challenges       (Perfect score /
  future nodes)      completed)               started)                  passed)               all stars)
```

- **Persistence Layer:** Dual-write pattern:
  1. Instant optimistic write to `localStorage` ensures offline playability and zero lag.
  2. Asynchronous sync to FastAPI backend (`/api/progress`) for persistent player accounts.
- **Player Economy:**
  - Standard Clear: +20 XP, +5 Coins
  - Perfect First Try: +30 XP, +10 Coins

---

## 8. Verification & Quality Gates

1. **Frontend:** `npm run build` & TypeScript checking with `tsc --noEmit`.
2. **Backend:** Python static analysis and FastAPI startup test with Uvicorn.
3. **Integration:** Full loop verification from Home -> Map -> Level -> Code Execution -> Reward.
