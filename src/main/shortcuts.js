const { globalShortcut } = require('electron');

let registeredShortcuts = [];

function registerShortcuts(mainWindow, businessLayer, windowManager) {
  // Ctrl+Shift+S → Toggle timer start/stop
  const timerShortcut = globalShortcut.register('CommandOrControl+Shift+S', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('shortcut:toggleTimer');
    }
  });
  if (timerShortcut) registeredShortcuts.push('CommandOrControl+Shift+S');

  // Ctrl+Shift+M → Toggle mini mode
  const miniShortcut = globalShortcut.register('CommandOrControl+Shift+M', () => {
    const mini = windowManager.getMiniWindow();
    if (mini && !mini.isDestroyed()) {
      windowManager.closeMiniWindow();
    } else {
      windowManager.createMiniWindow();
    }
  });
  if (miniShortcut) registeredShortcuts.push('CommandOrControl+Shift+M');

  // Ctrl+Shift+H → Show/hide main window
  const showShortcut = globalShortcut.register('CommandOrControl+Shift+H', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });
  if (showShortcut) registeredShortcuts.push('CommandOrControl+Shift+H');
}

function unregisterShortcuts() {
  globalShortcut.unregisterAll();
  registeredShortcuts = [];
}

module.exports = { registerShortcuts, unregisterShortcuts };
