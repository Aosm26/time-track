const { ipcMain, dialog } = require('electron');
const { ProjectRepository } = require('../data/project-repository');
const { TaskRepository } = require('../data/task-repository');
const { TimelogRepository } = require('../data/timelog-repository');
const { ExportEngine } = require('../data/export-engine');

function setupIpcHandlers(db, businessLayer, windowManager) {
  const projectRepo = new ProjectRepository(db);
  const taskRepo = new TaskRepository(db);
  const timelogRepo = new TimelogRepository(db);
  const exportEngine = new ExportEngine(db);

  const { stateMachine, timerEngine, afkDetector } = businessLayer;

  // ─── Timer ───────────────────────────────────────────────
  ipcMain.handle('timer:start', async (_event, taskId) => {
    try {
      const task = taskRepo.getById(taskId);
      if (!task) throw new Error('Görev bulunamadı');
      
      const project = projectRepo.getById(task.project_id);
      const log = timelogRepo.create(taskId);
      
      timerEngine.start(log.log_id, {
        taskId,
        taskName: task.name,
        projectId: project.project_id,
        projectName: project.name
      });
      
      afkDetector.start();
      
      return { success: true, logId: log.log_id };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timer:stop', async () => {
    try {
      const result = timerEngine.stop();
      afkDetector.stop();
      
      if (result && result.logId) {
        timelogRepo.close(
          result.logId,
          new Date().toISOString(),
          result.elapsedSeconds,
          result.afkSeconds
        );
      }
      
      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timer:pause', async () => {
    try {
      timerEngine.pause();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timer:resume', async () => {
    try {
      timerEngine.resume();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timer:getState', async () => {
    return {
      state: stateMachine.getState(),
      elapsed: timerEngine.getElapsed(),
      currentTask: timerEngine.getCurrentTask()
    };
  });

  ipcMain.handle('timer:afkContinue', async () => {
    try {
      afkDetector.handleAfkReturn('continue');
      timerEngine.resume();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timer:afkStop', async () => {
    try {
      afkDetector.handleAfkReturn('stop');
      const result = timerEngine.stop();
      afkDetector.stop();
      
      if (result && result.logId) {
        timelogRepo.close(
          result.logId,
          new Date().toISOString(),
          result.elapsedSeconds,
          result.afkSeconds
        );
      }
      
      return { success: true, ...result };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ─── Projects ────────────────────────────────────────────
  ipcMain.handle('projects:getAll', async () => {
    return projectRepo.getAll();
  });

  ipcMain.handle('projects:getById', async (_event, id) => {
    return projectRepo.getById(id);
  });

  ipcMain.handle('projects:create', async (_event, data) => {
    try {
      return { success: true, project: projectRepo.create(data.name, data.hourlyRate, data.color) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('projects:update', async (_event, id, data) => {
    try {
      return { success: true, project: projectRepo.update(id, data) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('projects:delete', async (_event, id) => {
    try {
      projectRepo.delete(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ─── Tasks ───────────────────────────────────────────────
  ipcMain.handle('tasks:getByProject', async (_event, projectId) => {
    return taskRepo.getByProject(projectId);
  });

  ipcMain.handle('tasks:create', async (_event, data) => {
    try {
      return { success: true, task: taskRepo.create(data.projectId, data.name) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('tasks:update', async (_event, id, data) => {
    try {
      return { success: true, task: taskRepo.update(id, data) };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('tasks:updateStatus', async (_event, id, status) => {
    try {
      taskRepo.updateStatus(id, status);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('tasks:delete', async (_event, id) => {
    try {
      taskRepo.delete(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ─── Time Logs ───────────────────────────────────────────
  ipcMain.handle('timelogs:getByDateRange', async (_event, start, end, projectId) => {
    return timelogRepo.getByDateRange(start, end, projectId);
  });

  ipcMain.handle('timelogs:getStats', async (_event, projectId, period) => {
    return timelogRepo.getStats(projectId, period);
  });

  ipcMain.handle('timelogs:getRecent', async (_event, limit) => {
    return timelogRepo.getRecent(limit || 10);
  });

  ipcMain.handle('timelogs:delete', async (_event, id) => {
    try {
      timelogRepo.delete(id);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timelogs:recoverDraft', async (_event, logId) => {
    try {
      timelogRepo.recoverDraft(logId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('timelogs:deleteDraft', async (_event, logId) => {
    try {
      timelogRepo.delete(logId);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ─── Export ──────────────────────────────────────────────
  ipcMain.handle('export:csv', async (_event, filters) => {
    try {
      const mainWin = windowManager.getMainWindow();
      const result = await dialog.showSaveDialog(mainWin, {
        defaultPath: `timetrack-rapor-${new Date().toISOString().slice(0, 10)}.csv`,
        filters: [{ name: 'CSV', extensions: ['csv'] }]
      });
      
      if (result.canceled) return { success: false, canceled: true };
      
      await exportEngine.toCSV(filters, result.filePath);
      return { success: true, filePath: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('export:excel', async (_event, filters) => {
    try {
      const mainWin = windowManager.getMainWindow();
      const result = await dialog.showSaveDialog(mainWin, {
        defaultPath: `timetrack-rapor-${new Date().toISOString().slice(0, 10)}.xlsx`,
        filters: [{ name: 'Excel', extensions: ['xlsx'] }]
      });
      
      if (result.canceled) return { success: false, canceled: true };
      
      await exportEngine.toExcel(filters, result.filePath);
      return { success: true, filePath: result.filePath };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // ─── Settings ────────────────────────────────────────────
  ipcMain.handle('settings:get', async (_event, key) => {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const row = stmt.get(key);
    return row ? JSON.parse(row.value) : null;
  });

  ipcMain.handle('settings:set', async (_event, key, value) => {
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    stmt.run(key, JSON.stringify(value));
    
    // Apply settings immediately
    if (key === 'afkThreshold') {
      afkDetector.setThreshold(value * 60); // minutes to seconds
    }
    
    return { success: true };
  });

  ipcMain.handle('settings:getAll', async () => {
    const stmt = db.prepare('SELECT key, value FROM settings');
    const rows = stmt.all();
    const settings = {};
    rows.forEach(row => {
      settings[row.key] = JSON.parse(row.value);
    });
    return settings;
  });

  // ─── Mini Mode ───────────────────────────────────────────
  ipcMain.handle('mini:toggle', async () => {
    const mini = windowManager.getMiniWindow();
    if (mini && !mini.isDestroyed()) {
      windowManager.closeMiniWindow();
      return { active: false };
    } else {
      windowManager.createMiniWindow();
      return { active: true };
    }
  });

  ipcMain.handle('mini:showMain', async () => {
    const mainWin = windowManager.getMainWindow();
    if (mainWin) {
      mainWin.show();
      mainWin.focus();
    }
  });
}

module.exports = { setupIpcHandlers };
