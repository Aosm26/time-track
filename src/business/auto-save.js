const AUTO_SAVE_INTERVAL = 60000; // 60 seconds

class AutoSave {
  constructor(db) {
    this._db = db;
    this._lastSaveTime = 0;
    this._stmt = db.prepare(
      'UPDATE time_logs SET duration_seconds = ?, afk_deduction_seconds = ?, end_time = ? WHERE log_id = ? AND is_draft = 1'
    );
  }

  tick(logId, elapsedSeconds, afkSeconds) {
    const now = Date.now();
    if (now - this._lastSaveTime >= AUTO_SAVE_INTERVAL) {
      this._save(logId, elapsedSeconds, afkSeconds);
      this._lastSaveTime = now;
    }
  }

  _save(logId, elapsedSeconds, afkSeconds) {
    try {
      this._stmt.run(
        elapsedSeconds,
        afkSeconds || 0,
        new Date().toISOString(),
        logId
      );
    } catch (e) {
      console.error('Auto-save failed:', e.message);
    }
  }

  forceSave(logId, elapsedSeconds, afkSeconds) {
    this._save(logId, elapsedSeconds, afkSeconds);
    this._lastSaveTime = Date.now();
  }
}

module.exports = { AutoSave };
