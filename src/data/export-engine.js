const fs = require('fs');

class ExportEngine {
  constructor(db) {
    this.db = db;
  }

  _getData(filters = {}) {
    let query = `
      SELECT 
        p.name as proje,
        t.name as gorev,
        date(tl.start_time) as tarih,
        time(tl.start_time) as baslangic,
        time(tl.end_time) as bitis,
        tl.duration_seconds,
        tl.afk_deduction_seconds,
        p.hourly_rate
      FROM time_logs tl
      JOIN tasks t ON t.task_id = tl.task_id
      JOIN projects p ON p.project_id = t.project_id
      WHERE tl.is_draft = 0
    `;
    const params = [];

    if (filters.startDate) {
      query += ' AND tl.start_time >= ?';
      params.push(filters.startDate);
    }
    if (filters.endDate) {
      query += ' AND tl.start_time <= ?';
      params.push(filters.endDate);
    }
    if (filters.projectId) {
      query += ' AND t.project_id = ?';
      params.push(filters.projectId);
    }

    query += ' ORDER BY tl.start_time ASC';

    const stmt = this.db.prepare(query);
    return stmt.all(...params);
  }

  _formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}sa ${m}dk ${s}sn`;
  }

  _formatDurationDecimal(seconds) {
    return (seconds / 3600).toFixed(2);
  }

  async toCSV(filters, filePath) {
    const data = this._getData(filters);
    
    const headers = [
      'Proje', 'Görev', 'Tarih', 'Başlangıç', 'Bitiş',
      'Süre', 'Süre (Saat)', 'AFK Düşümü', 'Net Süre',
      'Saatlik Ücret', 'Tutar'
    ];

    const rows = data.map(row => {
      const netSeconds = row.duration_seconds;
      const hours = netSeconds / 3600;
      const amount = hours * (row.hourly_rate || 0);

      return [
        `"${row.proje}"`,
        `"${row.gorev}"`,
        row.tarih,
        row.baslangic || '',
        row.bitis || '',
        this._formatDuration(row.duration_seconds),
        this._formatDurationDecimal(row.duration_seconds),
        this._formatDuration(row.afk_deduction_seconds || 0),
        this._formatDuration(netSeconds),
        (row.hourly_rate || 0).toFixed(2),
        amount.toFixed(2)
      ].join(',');
    });

    // Add summary row
    const totalSeconds = data.reduce((sum, r) => sum + r.duration_seconds, 0);
    const totalAfk = data.reduce((sum, r) => sum + (r.afk_deduction_seconds || 0), 0);
    const totalAmount = data.reduce((sum, r) => {
      const hours = r.duration_seconds / 3600;
      return sum + (hours * (r.hourly_rate || 0));
    }, 0);

    rows.push(''); // Empty row
    rows.push([
      '"TOPLAM"', '', '', '', '',
      this._formatDuration(totalSeconds),
      this._formatDurationDecimal(totalSeconds),
      this._formatDuration(totalAfk),
      this._formatDuration(totalSeconds),
      '',
      totalAmount.toFixed(2)
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    
    // Add BOM for Turkish character support in Excel
    const bom = '\ufeff';
    fs.writeFileSync(filePath, bom + csv, 'utf-8');
  }

  async toExcel(filters, filePath) {
    const ExcelJS = require('exceljs');
    const data = this._getData(filters);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'TimeTrack';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('Zaman Raporu');

    // Style header
    sheet.columns = [
      { header: 'Proje', key: 'proje', width: 20 },
      { header: 'Görev', key: 'gorev', width: 25 },
      { header: 'Tarih', key: 'tarih', width: 12 },
      { header: 'Başlangıç', key: 'baslangic', width: 10 },
      { header: 'Bitiş', key: 'bitis', width: 10 },
      { header: 'Süre', key: 'sure', width: 15 },
      { header: 'Süre (Saat)', key: 'saat', width: 12 },
      { header: 'AFK Düşümü', key: 'afk', width: 15 },
      { header: 'Saatlik Ücret', key: 'ucret', width: 14 },
      { header: 'Tutar', key: 'tutar', width: 12 },
    ];

    // Header styling
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF6366F1' }
    };
    headerRow.alignment = { horizontal: 'center' };

    // Data rows
    data.forEach(row => {
      const hours = row.duration_seconds / 3600;
      const amount = hours * (row.hourly_rate || 0);

      sheet.addRow({
        proje: row.proje,
        gorev: row.gorev,
        tarih: row.tarih,
        baslangic: row.baslangic || '',
        bitis: row.bitis || '',
        sure: this._formatDuration(row.duration_seconds),
        saat: parseFloat(this._formatDurationDecimal(row.duration_seconds)),
        afk: this._formatDuration(row.afk_deduction_seconds || 0),
        ucret: row.hourly_rate || 0,
        tutar: parseFloat(amount.toFixed(2))
      });
    });

    // Summary row
    const totalSeconds = data.reduce((sum, r) => sum + r.duration_seconds, 0);
    const totalAmount = data.reduce((sum, r) => {
      const hours = r.duration_seconds / 3600;
      return sum + (hours * (r.hourly_rate || 0));
    }, 0);

    const summaryRow = sheet.addRow({
      proje: 'TOPLAM',
      sure: this._formatDuration(totalSeconds),
      saat: parseFloat(this._formatDurationDecimal(totalSeconds)),
      tutar: parseFloat(totalAmount.toFixed(2))
    });
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' }
    };

    await workbook.xlsx.writeFile(filePath);
  }
}

module.exports = { ExportEngine };
