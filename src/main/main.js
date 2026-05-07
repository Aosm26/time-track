const { app, BrowserWindow, ipcMain, globalShortcut, nativeImage } = require('electron');
const path = require('path');
const { initDatabase } = require('../data/database');
const { setupIpcHandlers } = require('./ipc-handlers');
const { createTray, updateTrayTooltip } = require('./tray');
const { registerShortcuts, unregisterShortcuts } = require('./shortcuts');
const { StateMachine } = require('../business/state-machine');
const { TimerEngine } = require('../business/timer-engine');
const { AfkDetector } = require('../business/afk-detector');
const { AutoSave } = require('../business/auto-save');
const { TimelogRepository } = require('../data/timelog-repository');

let mainWindow = null;
let miniWindow = null;
let tray = null;
let stateMachine, timerEngine, afkDetector, autoSave;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 780,
    minHeight: 560,
    frame: false,
    titleBarStyle: 'hidden',
    backgroundColor: '#0f0f23',
    icon: path.join(__dirname, '..', 'renderer', 'assets', 'icons', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    show: false
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  return mainWindow;
}

function createMiniWindow() {
  if (miniWindow) {
    miniWindow.show();
    return miniWindow;
  }

  miniWindow = new BrowserWindow({
    width: 300,
    height: 90,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    resizable: false,
    skipTaskbar: true,
    backgroundColor: '#00000000',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  miniWindow.loadFile(path.join(__dirname, '..', 'renderer', 'mini.html'));

  miniWindow.on('closed', () => {
    miniWindow = null;
  });

  return miniWindow;
}

function closeMiniWindow() {
  if (miniWindow) {
    miniWindow.close();
    miniWindow = null;
  }
}

function initBusinessLayer(db) {
  stateMachine = new StateMachine();
  timerEngine = new TimerEngine(stateMachine);
  afkDetector = new AfkDetector(stateMachine, db);
  autoSave = new AutoSave(db);

  // Timer tick → update UI
  timerEngine.on('tick', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('timer:tick', data);
    }
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.webContents.send('timer:tick', data);
    }
    updateTrayTooltip(tray, data);
  });

  // State change → update UI
  stateMachine.on('stateChange', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('state:changed', data);
    }
    if (miniWindow && !miniWindow.isDestroyed()) {
      miniWindow.webContents.send('state:changed', data);
    }
  });

  // AFK detected → show warning
  afkDetector.on('afkDetected', (data) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('afk:detected', data);
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Auto-save tick
  timerEngine.on('tick', (data) => {
    if (data.logId) {
      autoSave.tick(data.logId, data.elapsedSeconds, data.afkSeconds);
    }
  });

  return { stateMachine, timerEngine, afkDetector, autoSave };
}

app.whenReady().then(async () => {
  const db = initDatabase();
  const businessLayer = initBusinessLayer(db);

  createMainWindow();
  tray = createTray(mainWindow, businessLayer);

  setupIpcHandlers(db, businessLayer, {
    getMainWindow: () => mainWindow,
    createMiniWindow,
    closeMiniWindow,
    getMiniWindow: () => miniWindow
  });

  registerShortcuts(mainWindow, businessLayer, {
    createMiniWindow,
    closeMiniWindow,
    getMiniWindow: () => miniWindow
  });

  // Check for draft sessions on startup
  const timelogRepo = new TimelogRepository(db);
  const drafts = timelogRepo.getDrafts();
  if (drafts.length > 0) {
    mainWindow.webContents.once('did-finish-load', () => {
      mainWindow.webContents.send('session:recovery', drafts);
    });
  }

  // Window controls IPC
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());
});

app.on('window-all-closed', () => {
  // Keep running in tray on Windows
});

app.on('activate', () => {
  if (mainWindow === null) {
    createMainWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
  // Save active session before quitting
  if (timerEngine && timerEngine.isRunning()) {
    timerEngine.stop();
  }
  unregisterShortcuts();
});
