const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');

let db = null;

function initDatabase() {
  const dbPath = path.join(app.getPath('userData'), 'timetrack.db');
  
  db = new Database(dbPath);
  
  // Enable WAL mode for better performance
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Create tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      project_id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      hourly_rate REAL DEFAULT 0,
      color TEXT DEFAULT '#6366f1',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS tasks (
      task_id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      status TEXT DEFAULT 'open' CHECK(status IN ('open', 'completed')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(project_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS time_logs (
      log_id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      start_time DATETIME NOT NULL,
      end_time DATETIME,
      duration_seconds INTEGER DEFAULT 0,
      afk_deduction_seconds INTEGER DEFAULT 0,
      is_draft BOOLEAN DEFAULT 1,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(task_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    -- Indexes for common queries
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_timelogs_task ON time_logs(task_id);
    CREATE INDEX IF NOT EXISTS idx_timelogs_start ON time_logs(start_time);
    CREATE INDEX IF NOT EXISTS idx_timelogs_draft ON time_logs(is_draft);
  `);

  // Insert default settings if not exist
  const insertSetting = db.prepare(
    'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)'
  );
  
  const defaultSettings = db.transaction(() => {
    insertSetting.run('afkThreshold', JSON.stringify(5));       // 5 minutes
    insertSetting.run('autoSaveInterval', JSON.stringify(60));   // 60 seconds
    insertSetting.run('alwaysOnTop', JSON.stringify(false));
    insertSetting.run('startMinimized', JSON.stringify(false));
    insertSetting.run('theme', JSON.stringify('dark'));
    insertSetting.run('language', JSON.stringify('en'));
  });
  
  defaultSettings();

  return db;
}

function getDatabase() {
  return db;
}

function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

module.exports = { initDatabase, getDatabase, closeDatabase };
