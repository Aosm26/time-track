class ProjectRepository {
  constructor(db) {
    this.db = db;
    
    this._stmts = {
      create: db.prepare(
        'INSERT INTO projects (name, hourly_rate, color) VALUES (?, ?, ?)'
      ),
      getAll: db.prepare(`
        SELECT p.*,
          COUNT(DISTINCT t.task_id) as task_count,
          COALESCE(SUM(CASE WHEN tl.is_draft = 0 THEN tl.duration_seconds ELSE 0 END), 0) as total_seconds
        FROM projects p
        LEFT JOIN tasks t ON t.project_id = p.project_id
        LEFT JOIN time_logs tl ON tl.task_id = t.task_id
        GROUP BY p.project_id
        ORDER BY p.updated_at DESC
      `),
      getById: db.prepare('SELECT * FROM projects WHERE project_id = ?'),
      update: db.prepare(
        'UPDATE projects SET name = ?, hourly_rate = ?, color = ?, updated_at = CURRENT_TIMESTAMP WHERE project_id = ?'
      ),
      delete: db.prepare('DELETE FROM projects WHERE project_id = ?'),
    };
  }

  create(name, hourlyRate = 0, color = '#6366f1') {
    const result = this._stmts.create.run(name, hourlyRate, color);
    return this.getById(result.lastInsertRowid);
  }

  getAll() {
    return this._stmts.getAll.all();
  }

  getById(id) {
    return this._stmts.getById.get(id);
  }

  update(id, data) {
    const current = this.getById(id);
    if (!current) throw new Error('Proje bulunamadı');
    
    this._stmts.update.run(
      data.name ?? current.name,
      data.hourlyRate ?? current.hourly_rate,
      data.color ?? current.color,
      id
    );
    return this.getById(id);
  }

  delete(id) {
    return this._stmts.delete.run(id);
  }
}

module.exports = { ProjectRepository };
