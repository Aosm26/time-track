// ═══════════════════════════════════════════
// TimeTrack — View Renderers (i18n)
// ═══════════════════════════════════════════

function renderTimerView() {
  return `
    <div class="timer-page">
      <div class="selector-bar">
        <div class="selector-group">
          <label class="selector-label">${t('timer_project')}</label>
          <div class="custom-select" id="projectSelectWrapper">
            <button class="select-trigger" id="projectSelect">
              <span class="select-value" id="projectSelectValue">${t('timer_select_project')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="select-dropdown" id="projectDropdown"></div>
          </div>
        </div>
        <div class="selector-divider">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" opacity="0.3"><polyline points="9 18 15 12 9 6"/></svg>
        </div>
        <div class="selector-group">
          <label class="selector-label">${t('timer_task')}</label>
          <div class="custom-select" id="taskSelectWrapper">
            <button class="select-trigger" id="taskSelect" disabled>
              <span class="select-value" id="taskSelectValue">${t('timer_select_task_first')}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            <div class="select-dropdown" id="taskDropdown"></div>
          </div>
        </div>
      </div>
      <div class="timer-display">
        <div class="timer-ring" id="timerRing">
          <div class="timer-time" id="timerTime">00:00:00</div>
          <div class="timer-label" id="timerLabel">${t('timer_idle')}</div>
        </div>
      </div>
      <div class="timer-controls">
        <button class="btn btn-start" id="btnStart" disabled>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          <span>${t('timer_start')}</span>
        </button>
        <button class="btn btn-stop hidden" id="btnStop">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>
          <span>${t('timer_stop')}</span>
        </button>
      </div>
      <div class="today-stats">
        <div class="stat-card">
          <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg></div>
          <div class="stat-info"><div class="stat-value" id="todayTotal">0${t('dur_h')} 0${t('dur_m')}</div><div class="stat-label">${t('timer_today_total')}</div></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div class="stat-info"><div class="stat-value" id="todaySessions">0</div><div class="stat-label">${t('timer_sessions')}</div></div>
        </div>
      </div>
      <div class="recent-sessions">
        <h3 class="section-title">${t('timer_recent')}</h3>
        <div class="sessions-list" id="sessionsList">
          <div class="empty-state"><p>${t('timer_no_sessions')}</p></div>
        </div>
      </div>
    </div>
  `;
}

function renderProjectsView() {
  return `
    <div class="page-header">
      <h2 class="page-title">${t('projects_title')}</h2>
      <button class="btn btn-primary" id="btnAddProject">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <span>${t('projects_new')}</span>
      </button>
    </div>
    <div class="projects-grid" id="projectsGrid"></div>
  `;
}

function renderReportsView() {
  return `
    <div class="page-header">
      <h2 class="page-title">${t('reports_title')}</h2>
      <div class="header-actions">
        <button class="btn btn-ghost" id="btnExportCSV"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>CSV</span></button>
        <button class="btn btn-ghost" id="btnExportExcel"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg><span>Excel</span></button>
      </div>
    </div>
    <div class="report-filters">
      <div class="filter-group">
        <label>${t('reports_period')}</label>
        <div class="filter-chips">
          <button class="chip active" data-period="today">${t('reports_today')}</button>
          <button class="chip" data-period="week">${t('reports_week')}</button>
          <button class="chip" data-period="month">${t('reports_month')}</button>
          <button class="chip" data-period="custom">${t('reports_custom')}</button>
        </div>
      </div>
      <div class="filter-group filter-dates hidden" id="customDates">
        <input type="date" class="input-date" id="dateStart">
        <span class="date-separator">—</span>
        <input type="date" class="input-date" id="dateEnd">
      </div>
      <div class="filter-group">
        <label>${t('reports_project')}</label>
        <select class="select-native" id="reportProjectFilter"><option value="">${t('reports_all')}</option></select>
      </div>
    </div>
    <div class="report-summary">
      <div class="summary-card"><div class="summary-value" id="reportTotalTime">0${t('dur_h')} 0${t('dur_m')}</div><div class="summary-label">${t('reports_total_time')}</div></div>
      <div class="summary-card"><div class="summary-value" id="reportSessions">0</div><div class="summary-label">${t('reports_session_count')}</div></div>
      <div class="summary-card"><div class="summary-value" id="reportAvgSession">0${t('dur_m')}</div><div class="summary-label">${t('reports_avg_session')}</div></div>
      <div class="summary-card"><div class="summary-value" id="reportEarnings">$0</div><div class="summary-label">${t('reports_earnings')}</div></div>
    </div>
    <div class="report-table-wrapper">
      <table class="report-table">
        <thead><tr><th>${t('reports_date')}</th><th>${t('reports_project')}</th><th>${t('timer_task')}</th><th>${t('reports_start')}</th><th>${t('reports_end')}</th><th>${t('reports_duration')}</th><th>${t('reports_afk')}</th></tr></thead>
        <tbody id="reportTableBody"><tr><td colspan="7" class="table-empty">${t('reports_no_data')}</td></tr></tbody>
      </table>
    </div>
  `;
}

function renderSettingsView() {
  return `
    <div class="page-header"><h2 class="page-title">${t('settings_title')}</h2></div>
    <div class="settings-list">
      <div class="settings-group">
        <h3 class="settings-group-title">${t('settings_timer')}</h3>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-label">${t('settings_afk_threshold')}</div><div class="setting-desc">${t('settings_afk_desc')}</div></div>
          <div class="setting-control"><input type="range" class="slider" id="settingAfkThreshold" min="1" max="30" value="5"><span class="slider-value" id="afkThresholdValue">5 ${t('dur_min')}</span></div>
        </div>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-label">${t('settings_autosave')}</div><div class="setting-desc">${t('settings_autosave_desc')}</div></div>
          <div class="setting-control"><input type="range" class="slider" id="settingAutoSave" min="15" max="300" value="60" step="15"><span class="slider-value" id="autoSaveValue">60 ${t('dur_sec')}</span></div>
        </div>
      </div>
      <div class="settings-group">
        <h3 class="settings-group-title">${t('settings_app')}</h3>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-label">${t('settings_always_on_top')}</div><div class="setting-desc">${t('settings_always_on_top_desc')}</div></div>
          <div class="setting-control"><label class="toggle"><input type="checkbox" id="settingAlwaysOnTop"><span class="toggle-slider"></span></label></div>
        </div>
        <div class="setting-item">
          <div class="setting-info"><div class="setting-label">${t('settings_language')}</div><div class="setting-desc">${t('settings_language_desc')}</div></div>
          <div class="setting-control">
            <select class="select-native" id="settingLanguage" style="width:120px">
              <option value="en">English</option>
              <option value="tr">Türkçe</option>
            </select>
          </div>
        </div>
      </div>
      <div class="settings-group">
        <h3 class="settings-group-title">${t('settings_shortcuts')}</h3>
        <div class="shortcut-list">
          <div class="shortcut-item"><span>${t('settings_shortcut_timer')}</span><kbd>Ctrl + Shift + S</kbd></div>
          <div class="shortcut-item"><span>${t('settings_shortcut_mini')}</span><kbd>Ctrl + Shift + M</kbd></div>
          <div class="shortcut-item"><span>${t('settings_shortcut_show')}</span><kbd>Ctrl + Shift + H</kbd></div>
        </div>
      </div>
    </div>
  `;
}
