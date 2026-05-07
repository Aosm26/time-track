class TaskRepository {
  constructor(db) {
    this.db = db;
    
    this._stmts = {
      create: db.prepare(
        'INSERT INTO tasks (project_id, name) VALUES (?, ?)'
      ),
      getByProject: db.prepare(`
        SELECT t.*,
          COALESCE(SUM(CASE WHEN tl.is_draft = 0 THEN tl.duration_seconds ELSE 0 END), 0) as total_seconds,
          COUNT(tl.log_id) as log_count
        FROM tasks t
        LEFT JOIN time_logs tl ON tl.task_id = t.task_id
        WHERE t.project_id = ?
        GROUP BY t.task_id
        ORDER BY t.status ASC, t.created_at DESC
      `),
      getById: db.prepare('SELECT * FROM tasks WHERE task_id = ?'),
      update: db.prepare(
        'UPDATE tasks SET name = ? WHERE task_id = ?'
      ),
      updateStatus: db.prepare(
        'UPDATE tasks SET status = ? WHERE task_id = ?'
      ),
      delete: db.prepare('DELETE FROM tasks WHERE task_id = ?'),
    };
  }

  create(projectId, name) {
    const result = this._stmts.create.run(projectId, name);
    return this.getById(result.lastInsertRowid);
  }

  getByProject(projectId) {
    return this._stmts.getByProject.all(projectId);
  }

  getById(id) {
    return this._stmts.getById.get(id);
  }

  update(id, data) {
    if (data.name) {
      this._stmts.update.run(data.name, id);
    }
    return this.getById(id);
  }

  updateStatus(id, status) {
    if (!['open', 'completed'].includes(status)) {
      throw new Error('Geçersiz durum: ' + status);
    }
    this._stmts.updateStatus.run(status, id);
  }

  delete(id) {
    return this._stmts.delete.run(id);
  }
}

module.exports = { TaskRepository };
