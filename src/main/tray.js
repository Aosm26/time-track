const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

let trayInstance = null;

function createTray(mainWindow, businessLayer) {
  const iconPath = path.join(__dirname, '..', 'renderer', 'assets', 'icons', 'tray-icon.png');
  
  // Create a simple 16x16 tray icon programmatically if file doesn't exist
  let trayIcon;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = createDefaultIcon();
    }
  } catch (e) {
    trayIcon = createDefaultIcon();
  }

  trayIcon = trayIcon.resize({ width: 16, height: 16 });
  trayInstance = new Tray(trayIcon);
  trayInstance.setToolTip('TimeTrack - Idle');

  const contextMenu = buildContextMenu(mainWindow, businessLayer);
  trayInstance.setContextMenu(contextMenu);

  trayInstance.on('click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  return trayInstance;
}

function createDefaultIcon() {
  // Create a 16x16 icon programmatically
  const size = 16;
  const canvas = Buffer.alloc(size * size * 4);
  
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (y * size + x) * 4;
      const cx = x - size / 2;
      const cy = y - size / 2;
      const dist = Math.sqrt(cx * cx + cy * cy);
      
      if (dist < 7) {
        // Purple-blue gradient
        canvas[idx] = 99;     // R
        canvas[idx + 1] = 102; // G
        canvas[idx + 2] = 241; // B
        canvas[idx + 3] = 255; // A
      } else {
        canvas[idx + 3] = 0; // Transparent
      }
    }
  }
  
  return nativeImage.createFromBuffer(canvas, { width: size, height: size });
}

function buildContextMenu(mainWindow, businessLayer) {
  return Menu.buildFromTemplate([
    {
      label: 'Show/Hide',
      click: () => {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Start/Stop',
      click: () => {
        if (mainWindow) {
          mainWindow.webContents.send('shortcut:toggleTimer');
        }
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);
}

function updateTrayTooltip(tray, data) {
  if (!tray || tray.isDestroyed()) return;
  
  if (data && data.projectName) {
    const hours = Math.floor(data.elapsedSeconds / 3600);
    const mins = Math.floor((data.elapsedSeconds % 3600) / 60);
    const secs = data.elapsedSeconds % 60;
    const timeStr = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    tray.setToolTip(`TimeTrack - ${data.projectName} | ${timeStr}`);
  } else {
    tray.setToolTip('TimeTrack - Idle');
  }
}

module.exports = { createTray, updateTrayTooltip };
