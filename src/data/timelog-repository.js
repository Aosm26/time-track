class TimelogRepository {
  constructor(db) {
    this.db = db;
  }

  create(taskId) {
    const stmt = this.db.prepare(
      'INSERT INTO time_logs (task_id, start_time, is_draft) VALUES (?, ?, 1)'
    );
    const result = stmt.run(taskId, new Date().toISOString());
    return { log_id: result.lastInsertRowid };
  }

  close(logId, endTime, durationSeconds, afkDeductionSeconds) {
    const stmt = this.db.prepare(
      `UPDATE time_logs 
       SET end_time = ?, duration_seconds = ?, afk_deduction_seconds = ?, is_draft = 0 
       WHERE log_id = ?`
    );
    stmt.run(endTime, durationSeconds, afkDeductionSeconds || 0, logId);
  }

  updateDraft(logId, durationSeconds, afkSeconds) {
    const stmt = this.db.prepare(
      'UPDATE time_logs SET duration_seconds = ?, afk_deduction_seconds = ?, end_time = ? WHERE log_id = ? AND is_draft = 1'
    );
    stmt.run(durationSeconds, afkSeconds || 0, new Date().toISOString(), logId);
  }

  getDrafts() {
    const stmt = this.db.prepare(`
      SELECT tl.*, t.name as task_name, p.name as project_name, p.color as project_color
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      JOIN projects p ON p.project_id = t.project_id
      WHERE tl.is_draft = 1
      ORDER BY tl.start_time DESC
    `);
    return stmt.all();
  }

  recoverDraft(logId) {
    const stmt = this.db.prepare(
      'UPDATE time_logs SET is_draft = 0 WHERE log_id = ?'
    );
    stmt.run(logId);
  }

  getByDateRange(startDate, endDate, projectId) {
    let query = `
      SELECT tl.*, t.name as task_name, t.project_id, p.name as project_name, p.color as project_color, p.hourly_rate
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      JOIN projects p ON p.project_id = t.project_id
      WHERE tl.is_draft = 0
        AND tl.start_time >= ?
        AND tl.start_time <= ?
    `;
    const params = [startDate, endDate];

    if (projectId) {
      query += ' AND t.project_id = ?';
      params.push(projectId);
    }

    query += ' ORDER BY tl.start_time DESC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  getRecent(limit = 10) {
    const stmt = this.db.prepare(`
      SELECT tl.*, t.name as task_name, p.name as project_name, p.color as project_color
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      JOIN projects p ON p.project_id = t.project_id
      WHERE tl.is_draft = 0
      ORDER BY tl.start_time DESC
      LIMIT ?
    `);
    return stmt.all(limit);
  }

  getStats(projectId, period) {
    let dateFilter = '';
    const params = [];

    if (period === 'today') {
      dateFilter = "AND date(tl.start_time) = date('now', 'localtime')";
    } else if (period === 'week') {
      dateFilter = "AND tl.start_time >= date('now', '-7 days', 'localtime')";
    } else if (period === 'month') {
      dateFilter = "AND tl.start_time >= date('now', '-30 days', 'localtime')";
    }

    let projectFilter = '';
    if (projectId) {
      projectFilter = 'AND t.project_id = ?';
      params.push(projectId);
    }

    const stmt = this.db.prepare(`
      SELECT 
        COALESCE(SUM(tl.duration_seconds), 0) as total_seconds,
        COALESCE(SUM(tl.afk_deduction_seconds), 0) as total_afk_seconds,
        COUNT(tl.log_id) as session_count,
        COALESCE(AVG(tl.duration_seconds), 0) as avg_session_seconds
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      WHERE tl.is_draft = 0
      ${dateFilter}
      ${projectFilter}
    `);

    const stats = stmt.get(...params);

    // Get daily breakdown
    const dailyStmt = this.db.prepare(`
      SELECT 
        date(tl.start_time) as day,
        SUM(tl.duration_seconds) as total_seconds,
        COUNT(tl.log_id) as session_count
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      WHERE tl.is_draft = 0
      ${dateFilter}
      ${projectFilter}
      GROUP BY date(tl.start_time)
      ORDER BY day DESC
      LIMIT 30
    `);

    const daily = dailyStmt.all(...params);

    // Get per-project breakdown
    const projectStmt = this.db.prepare(`
      SELECT 
        p.project_id,
        p.name as project_name,
        p.color as project_color,
        SUM(tl.duration_seconds) as total_seconds,
        COUNT(tl.log_id) as session_count
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      JOIN projects p ON p.project_id = t.project_id
      WHERE tl.is_draft = 0
      ${dateFilter}
      ${projectFilter}
      GROUP BY p.project_id
      ORDER BY total_seconds DESC
    `);

    const byProject = projectStmt.all(...params);

    return { ...stats, daily, byProject };
  }

  getTodayTotal() {
    const stmt = this.db.prepare(`
      SELECT COALESCE(SUM(duration_seconds), 0) as total
      FROM time_logs
      WHERE is_draft = 0 AND date(start_time) = date('now', 'localtime')
    `);
    return stmt.get().total;
  }

  delete(id) {
    const stmt = this.db.prepare('DELETE FROM time_logs WHERE log_id = ?');
    return stmt.run(id);
  }
}

module.exports = { TimelogRepository };
