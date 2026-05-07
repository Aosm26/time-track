<div align="center">

# ⏱️ TimeTrack

**A modern desktop time tracking application built for freelancers.**

Track your work hours, manage projects & tasks, detect idle time, and generate professional reports — all from a sleek, minimal interface.

Built with **Electron** · **SQLite** · **Vanilla JS**

---

![License](https://img.shields.io/badge/license-ISC-blue)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey)
![Electron](https://img.shields.io/badge/electron-36-blue)

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| **⏱ Precise Timer** | Start/stop timer with accurate elapsed time tracking |
| **📁 Projects & Tasks** | Organize work into projects with color-coded task hierarchies |
| **🚶 AFK Detection** | Automatically detects idle time via OS-level monitoring and deducts inactive periods |
| **💾 Auto-Save** | Saves active sessions every 60s — recovers data after crashes |
| **📊 Reports & Export** | Filter by date/project, view stats, and export to **CSV** or **Excel** |
| **🖥 System Tray** | Runs quietly in the background with tray icon and context menu |
| **📌 Mini Mode** | Always-on-top floating widget showing current timer |
| **⌨️ Global Shortcuts** | Control the timer from anywhere without switching windows |
| **🌐 Multi-Language** | English and Turkish interface with instant switching |
| **🌙 Dark Theme** | Premium dark UI with glassmorphism effects and smooth animations |

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### Installation

```bash
# Clone the repository
git clone https://github.com/Aosm26/time-track.git
cd time-track

# Install dependencies
npm install

# Start the application
npm start
```

> **Note:** Native modules (`better-sqlite3`) are automatically rebuilt for Electron during `npm install` via the `postinstall` script.

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + S` | Start / Stop timer |
| `Ctrl + Shift + M` | Toggle mini mode |
| `Ctrl + Shift + H` | Show / Hide main window |

## 🏗 Architecture

The application follows a **three-layer architecture** for clean separation of concerns:

```
┌─────────────────────────────────────┐
│         Presentation Layer          │
│   HTML/CSS/JS · Views · Modals      │
├─────────────────────────────────────┤
│         Business Logic Layer        │
│  State Machine · Timer · AFK · i18n │
├─────────────────────────────────────┤
│          Data Access Layer          │
│  SQLite · Repositories · Export     │
└─────────────────────────────────────┘
```

### Project Structure

```
src/
├── main/                    # Electron Main Process
│   ├── main.js              # Window management & lifecycle
│   ├── preload.js           # Secure IPC bridge (contextBridge)
│   ├── ipc-handlers.js      # All IPC channel handlers
│   ├── tray.js              # System tray integration
│   └── shortcuts.js         # Global keyboard shortcuts
│
├── business/                # Business Logic Layer
│   ├── state-machine.js     # 3-state machine (Idle → Running → Suspended)
│   ├── timer-engine.js      # Precise time tracking engine
│   ├── afk-detector.js      # OS-level idle detection (powerMonitor)
│   └── auto-save.js         # Periodic draft saving (crash recovery)
│
├── data/                    # Data Access Layer
│   ├── database.js          # SQLite schema & connection (WAL mode)
│   ├── project-repository.js
│   ├── task-repository.js
│   ├── timelog-repository.js
│   └── export-engine.js     # CSV & Excel report generation
│
└── renderer/                # Presentation Layer
    ├── index.html           # Main application shell
    ├── mini.html            # Mini mode floating widget
    ├── styles/
    │   ├── index.css        # Design system & tokens
    │   ├── components.css   # UI component styles
    │   └── animations.css   # Keyframe animations
    └── js/
        ├── app.js           # Main application controller
        ├── i18n.js          # Internationalization (EN/TR)
        ├── utils.js         # Formatting & helper functions
        ├── modal.js         # Modal dialog manager
        └── views.js         # Page renderers
```

## 📋 Database Schema

TimeTrack uses a local **SQLite** database with the following structure:

| Table | Purpose |
|-------|---------|
| `projects` | Project names, colors, hourly rates |
| `tasks` | Tasks belonging to projects (open/completed) |
| `time_logs` | Individual work sessions with duration & AFK deductions |
| `settings` | User preferences (AFK threshold, language, etc.) |

## 🔧 Tech Stack

| Technology | Purpose |
|------------|---------|
| [Electron](https://www.electronjs.org/) | Cross-platform desktop framework |
| [better-sqlite3](https://github.com/WiseLibs/better-sqlite3) | Fast, synchronous SQLite driver |
| [ExcelJS](https://github.com/exceljs/exceljs) | Excel report generation |
| Vanilla HTML/CSS/JS | Lightweight UI with zero framework overhead |

## 📄 License

This project is licensed under the **ISC License**.
