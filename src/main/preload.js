const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('timeTrack', {
  // Timer operations
  timer: {
    start: (taskId) => ipcRenderer.invoke('timer:start', taskId),
    stop: () => ipcRenderer.invoke('timer:stop'),
    pause: () => ipcRenderer.invoke('timer:pause'),
    resume: () => ipcRenderer.invoke('timer:resume'),
    getState: () => ipcRenderer.invoke('timer:getState'),
    afkContinue: () => ipcRenderer.invoke('timer:afkContinue'),
    afkStop: () => ipcRenderer.invoke('timer:afkStop'),
  },

  // Project operations
  projects: {
    getAll: () => ipcRenderer.invoke('projects:getAll'),
    getById: (id) => ipcRenderer.invoke('projects:getById', id),
    create: (data) => ipcRenderer.invoke('projects:create', data),
    update: (id, data) => ipcRenderer.invoke('projects:update', id, data),
    delete: (id) => ipcRenderer.invoke('projects:delete', id),
  },

  // Task operations
  tasks: {
    getByProject: (projectId) => ipcRenderer.invoke('tasks:getByProject', projectId),
    create: (data) => ipcRenderer.invoke('tasks:create', data),
    update: (id, data) => ipcRenderer.invoke('tasks:update', id, data),
    updateStatus: (id, status) => ipcRenderer.invoke('tasks:updateStatus', id, status),
    delete: (id) => ipcRenderer.invoke('tasks:delete', id),
  },

  // Time log operations
  timeLogs: {
    getByDateRange: (start, end, projectId) => ipcRenderer.invoke('timelogs:getByDateRange', start, end, projectId),
    getStats: (projectId, period) => ipcRenderer.invoke('timelogs:getStats', projectId, period),
    getRecent: (limit) => ipcRenderer.invoke('timelogs:getRecent', limit),
    delete: (id) => ipcRenderer.invoke('timelogs:delete', id),
    recoverDraft: (logId) => ipcRenderer.invoke('timelogs:recoverDraft', logId),
    deleteDraft: (logId) => ipcRenderer.invoke('timelogs:deleteDraft', logId),
  },

  // Export operations
  export: {
    toCSV: (filters) => ipcRenderer.invoke('export:csv', filters),
    toExcel: (filters) => ipcRenderer.invoke('export:excel', filters),
  },

  // Settings
  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
    getAll: () => ipcRenderer.invoke('settings:getAll'),
  },

  // Mini mode
  miniMode: {
    toggle: () => ipcRenderer.invoke('mini:toggle'),
    showMain: () => ipcRenderer.invoke('mini:showMain'),
  },

  // Window controls
  window: {
    minimize: () => ipcRenderer.send('window:minimize'),
    maximize: () => ipcRenderer.send('window:maximize'),
    close: () => ipcRenderer.send('window:close'),
  },

  // Event listeners
  on: (channel, callback) => {
    const validChannels = [
      'timer:tick',
      'state:changed',
      'afk:detected',
      'session:recovery',
      'shortcut:toggleTimer',
      'shortcut:toggleMini',
    ];
    if (validChannels.includes(channel)) {
      const subscription = (_event, ...args) => callback(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    }
  },

  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  }
});
