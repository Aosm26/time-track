// ═══════════════════════════════════════════
// TimeTrack — Main Application Controller
// ═══════════════════════════════════════════

const state = {
  currentView: 'timer',
  selectedProjectId: null,
  selectedTaskId: null,
  timerState: 'idle',
  projects: [],
  tasks: [],
  reportPeriod: 'today',
  _dropdownListenerAdded: false,
  _reportListenersAdded: false,
};

document.addEventListener('DOMContentLoaded', async () => {
  // Load language setting before anything renders
  const savedLang = await window.timeTrack.settings.get('language');
  setLanguage(savedLang || 'en');

  Modal.init();
  initViews();
  initNavigation();
  initWindowControls();
  initTimerEvents();
  initShortcutEvents();
  updateStaticTexts();
  loadTimerView();
});

function initNavigation() {
  document.querySelectorAll('.nav-item[data-view]').forEach(btn => {
    btn.addEventListener('click', () => switchView(btn.dataset.view));
  });
}

function switchView(viewName) {
  state.currentView = viewName;
  document.querySelectorAll('.nav-item[data-view]').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-view="${viewName}"]`)?.classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('view-active'));
  const target = document.getElementById(`view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
  if (target) target.classList.add('view-active');

  switch (viewName) {
    case 'timer': loadTimerView(); break;
    case 'projects': loadProjectsView(); break;
    case 'reports': loadReportsView(); break;
    case 'settings': loadSettingsView(); break;
  }
}

function initViews() { rebuildViews(); }

function rebuildViews() {
  document.getElementById('viewTimer').innerHTML = renderTimerView();
  document.getElementById('viewProjects').innerHTML = renderProjectsView();
  document.getElementById('viewReports').innerHTML = renderReportsView();
  document.getElementById('viewSettings').innerHTML = renderSettingsView();
  state._reportListenersAdded = false;
  state._dropdownListenerAdded = false;
}

function updateStaticTexts() {
  // Sidebar
  document.querySelector('#navTimer span').textContent = t('nav_timer');
  document.querySelector('#navProjects span').textContent = t('nav_projects');
  document.querySelector('#navReports span').textContent = t('nav_reports');
  document.querySelector('#navSettings span').textContent = t('nav_settings');
  document.querySelector('#btnMiniMode span').textContent = t('nav_mini');
  // Title bar
  document.getElementById('btnMinimize').title = t('btn_minimize');
  document.getElementById('btnMaximize').title = t('btn_maximize');
  document.getElementById('btnClose').title = t('btn_close');
  // Status bar
  if (state.timerState === 'idle') {
    document.getElementById('statusText').textContent = t('status_idle');
  }
  // AFK overlay
  document.querySelector('.afk-title').textContent = t('afk_title');
  document.getElementById('afkDesc').textContent = t('afk_default_desc');
  document.getElementById('btnAfkContinue').textContent = t('afk_continue');
  document.getElementById('btnAfkStop').textContent = t('afk_stop');
}

function initWindowControls() {
  document.getElementById('btnMinimize').addEventListener('click', () => window.timeTrack.window.minimize());
  document.getElementById('btnMaximize').addEventListener('click', () => window.timeTrack.window.maximize());
  document.getElementById('btnClose').addEventListener('click', () => window.timeTrack.window.close());
  document.getElementById('btnMiniMode').addEventListener('click', () => window.timeTrack.miniMode.toggle());
}

function initTimerEvents() {
  window.timeTrack.on('timer:tick', (data) => {
    const timeEl = document.getElementById('timerTime');
    if (timeEl) timeEl.textContent = formatTime(data.elapsedSeconds);
  });

  window.timeTrack.on('state:changed', (data) => {
    state.timerState = data.newState;
    updateTimerUI(data.newState);
  });

  window.timeTrack.on('afk:detected', (data) => {
    const overlay = document.getElementById('afkOverlay');
    const desc = document.getElementById('afkDesc');
    const mins = Math.floor(data.threshold / 60);
    desc.textContent = t('afk_desc', { min: mins });
    overlay.classList.remove('hidden');
  });

  window.timeTrack.on('session:recovery', (drafts) => {
    Modal.showRecovery(
      drafts,
      async (ds) => { for (const d of ds) await window.timeTrack.timeLogs.recoverDraft(d.log_id); showToast(t('recovery_recovered'), 'success'); loadTimerView(); },
      async (ds) => { for (const d of ds) await window.timeTrack.timeLogs.deleteDraft(d.log_id); showToast(t('recovery_deleted'), 'info'); }
    );
  });

  document.getElementById('btnAfkContinue').addEventListener('click', async () => {
    document.getElementById('afkOverlay').classList.add('hidden');
    await window.timeTrack.timer.afkContinue();
  });
  document.getElementById('btnAfkStop').addEventListener('click', async () => {
    document.getElementById('afkOverlay').classList.add('hidden');
    await window.timeTrack.timer.afkStop();
    loadTimerView();
  });
}

function initShortcutEvents() {
  window.timeTrack.on('shortcut:toggleTimer', () => {
    if (state.timerState === 'running') document.getElementById('btnStop')?.click();
    else if (state.timerState === 'idle' && state.selectedTaskId) document.getElementById('btnStart')?.click();
  });
}

function updateTimerUI(newState) {
  const ring = document.getElementById('timerRing');
  const label = document.getElementById('timerLabel');
  const btnStart = document.getElementById('btnStart');
  const btnStop = document.getElementById('btnStop');
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');
  if (!ring) return;

  ring.className = 'timer-ring';
  statusDot.className = 'status-indicator';

  if (newState === 'idle') {
    label.textContent = t('timer_idle');
    btnStart?.classList.remove('hidden');
    btnStop?.classList.add('hidden');
    if (btnStart) btnStart.disabled = !state.selectedTaskId;
    statusText.textContent = t('status_idle');
    document.getElementById('statusProject').textContent = '—';
  } else if (newState === 'running') {
    ring.classList.add('running');
    label.textContent = t('timer_running');
    btnStart?.classList.add('hidden');
    btnStop?.classList.remove('hidden');
    statusDot.classList.add('running');
    statusText.textContent = t('status_running');
  } else if (newState === 'suspended') {
    ring.classList.add('suspended');
    label.textContent = t('timer_afk');
    statusDot.classList.add('suspended');
    statusText.textContent = t('timer_afk');
  }
}

// ── TIMER VIEW ──────────────────────────────
async function loadTimerView() {
  await loadProjectDropdown();
  await loadRecentSessions();
  await loadTodayStats();

  const timerState = await window.timeTrack.timer.getState();
  if (timerState.state !== 'idle') {
    state.timerState = timerState.state;
    updateTimerUI(timerState.state);
    if (timerState.currentTask) document.getElementById('statusProject').textContent = timerState.currentTask.projectName;
  }

  document.getElementById('btnStart').onclick = async () => {
    if (!state.selectedTaskId) return;
    const result = await window.timeTrack.timer.start(state.selectedTaskId);
    if (result.success) {
      const proj = state.projects.find(p => p.project_id === state.selectedProjectId);
      document.getElementById('statusProject').textContent = proj?.name || '';
    } else showToast(result.error || t('timer_started_fail'), 'error');
  };

  document.getElementById('btnStop').onclick = async () => {
    const result = await window.timeTrack.timer.stop();
    if (result.success) {
      document.getElementById('timerTime').textContent = '00:00:00';
      showToast(t('timer_session_saved'), 'success');
      await loadRecentSessions();
      await loadTodayStats();
    }
  };
}

async function loadProjectDropdown() {
  state.projects = await window.timeTrack.projects.getAll();
  const dropdown = document.getElementById('projectDropdown');
  const trigger = document.getElementById('projectSelect');
  const valueEl = document.getElementById('projectSelectValue');

  dropdown.innerHTML = state.projects.length === 0
    ? `<div class="select-option" style="opacity:0.5">${t('timer_no_projects')}</div>`
    : state.projects.map(p => `<div class="select-option" data-id="${p.project_id}"><div class="color-dot" style="background:${p.color}"></div><span>${p.name}</span></div>`).join('');

  trigger.onclick = (e) => { e.stopPropagation(); closeAllDropdowns(); dropdown.classList.toggle('open'); };

  dropdown.onclick = async (e) => {
    const opt = e.target.closest('.select-option');
    if (!opt || !opt.dataset.id) return;
    state.selectedProjectId = parseInt(opt.dataset.id);
    const proj = state.projects.find(p => p.project_id === state.selectedProjectId);
    valueEl.innerHTML = `<span class="color-dot" style="background:${proj.color};display:inline-block;margin-right:8px"></span>${proj.name}`;
    dropdown.classList.remove('open');
    await loadTaskDropdown(state.selectedProjectId);
  };

  // BUG FIX: only add global click listener once
  if (!state._dropdownListenerAdded) {
    document.addEventListener('click', closeAllDropdowns);
    state._dropdownListenerAdded = true;
  }
}

async function loadTaskDropdown(projectId) {
  state.tasks = await window.timeTrack.tasks.getByProject(projectId);
  const dropdown = document.getElementById('taskDropdown');
  const trigger = document.getElementById('taskSelect');
  const valueEl = document.getElementById('taskSelectValue');
  const btnStart = document.getElementById('btnStart');

  trigger.disabled = false;
  state.selectedTaskId = null;
  if (btnStart) btnStart.disabled = true;

  const openTasks = state.tasks.filter(t => t.status === 'open');
  dropdown.innerHTML = openTasks.length === 0
    ? `<div class="select-option" style="opacity:0.5">${t('timer_no_tasks')}</div>`
    : openTasks.map(tk => `<div class="select-option" data-id="${tk.task_id}"><span>${tk.name}</span><span style="font-size:0.7rem;color:var(--text-muted);margin-left:auto">${formatDuration(tk.total_seconds || 0)}</span></div>`).join('');

  valueEl.textContent = t('timer_select_task');

  trigger.onclick = (e) => { e.stopPropagation(); closeAllDropdowns(); dropdown.classList.toggle('open'); };
  dropdown.onclick = (e) => {
    const opt = e.target.closest('.select-option');
    if (!opt || !opt.dataset.id) return;
    state.selectedTaskId = parseInt(opt.dataset.id);
    const task = state.tasks.find(tk => tk.task_id === state.selectedTaskId);
    valueEl.textContent = task.name;
    dropdown.classList.remove('open');
    if (btnStart) btnStart.disabled = state.timerState !== 'idle';
  };
}

function closeAllDropdowns() { document.querySelectorAll('.select-dropdown').forEach(d => d.classList.remove('open')); }

async function loadRecentSessions() {
  const sessions = await window.timeTrack.timeLogs.getRecent(5);
  const list = document.getElementById('sessionsList');
  if (!list) return;
  if (sessions.length === 0) { list.innerHTML = `<div class="empty-state"><p>${t('timer_no_sessions')}</p></div>`; return; }
  list.innerHTML = sessions.map(s => `<div class="session-item"><div class="session-info"><div class="color-dot" style="background:${s.project_color}"></div><div><div class="session-project">${s.project_name}</div><div class="session-task">${s.task_name}</div></div></div><div style="text-align:right"><div class="session-time">${formatTime(s.duration_seconds)}</div><div class="session-date">${formatDate(s.start_time)}</div></div></div>`).join('');
}

async function loadTodayStats() {
  const stats = await window.timeTrack.timeLogs.getStats(null, 'today');
  const totalEl = document.getElementById('todayTotal');
  const sessEl = document.getElementById('todaySessions');
  if (totalEl) totalEl.textContent = formatDuration(stats.total_seconds || 0);
  if (sessEl) sessEl.textContent = stats.session_count || 0;
}

// ── PROJECTS VIEW ───────────────────────────
async function loadProjectsView() {
  state.projects = await window.timeTrack.projects.getAll();
  const grid = document.getElementById('projectsGrid');

  document.getElementById('btnAddProject').onclick = () => {
    Modal.showProjectForm(null, async (data) => {
      const result = await window.timeTrack.projects.create(data);
      if (result.success) { showToast(t('projects_created'), 'success'); loadProjectsView(); }
      else showToast(result.error || t('error'), 'error');
    });
  };

  if (state.projects.length === 0) {
    grid.innerHTML = `<div class="empty-state"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.3"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg><p>${t('projects_empty')}</p><p class="empty-hint">${t('projects_empty_hint')}</p></div>`;
    return;
  }

  let html = '';
  for (const p of state.projects) {
    const tasks = await window.timeTrack.tasks.getByProject(p.project_id);
    const tasksHTML = tasks.map(tk => `
      <div class="task-item ${tk.status === 'completed' ? 'task-completed' : ''}">
        <div class="task-name"><input type="checkbox" ${tk.status === 'completed' ? 'checked' : ''} class="task-checkbox" data-id="${tk.task_id}"><span>${tk.name}</span></div>
        <div style="display:flex;align-items:center;gap:4px"><span class="task-duration">${formatDuration(tk.total_seconds || 0)}</span><button class="btn-icon task-delete" data-id="${tk.task_id}" title="${t('projects_delete')}"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></div>
      </div>`).join('');

    html += `<div class="project-card" style="--project-color:${p.color}"><div class="project-name">${p.name}</div><div class="project-meta"><span>${p.task_count || 0} ${t('projects_tasks')}</span><span>${formatDuration(p.total_seconds || 0)}</span>${p.hourly_rate > 0 ? `<span>${getLanguage()==='tr'?'₺':'$'}${p.hourly_rate}/${t('dur_h')}</span>` : ''}</div><div class="project-tasks-list">${tasksHTML || `<div style="color:var(--text-muted);font-size:0.75rem;padding:8px 0">${t('projects_no_tasks')}</div>`}</div><div class="project-actions"><button class="btn btn-sm btn-ghost add-task-btn" data-project-id="${p.project_id}">${t('projects_add_task')}</button><button class="btn btn-sm btn-ghost edit-project-btn" data-project-id="${p.project_id}">${t('projects_edit')}</button><button class="btn btn-sm btn-danger delete-project-btn" data-project-id="${p.project_id}">${t('projects_delete')}</button></div></div>`;
  }
  grid.innerHTML = html;

  grid.querySelectorAll('.add-task-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    Modal.showTaskForm(parseInt(btn.dataset.projectId), async (data) => {
      const r = await window.timeTrack.tasks.create(data);
      if (r.success) { showToast(t('task_added'), 'success'); loadProjectsView(); }
      else showToast(r.error || t('error'), 'error');
    });
  }));

  grid.querySelectorAll('.edit-project-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const pid = parseInt(btn.dataset.projectId);
    const proj = state.projects.find(p => p.project_id === pid);
    Modal.showProjectForm(proj, async (data) => {
      const r = await window.timeTrack.projects.update(pid, data);
      if (r.success) { showToast(t('projects_updated'), 'success'); loadProjectsView(); }
      else showToast(r.error || t('error'), 'error');
    });
  }));

  grid.querySelectorAll('.delete-project-btn').forEach(btn => btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const pid = parseInt(btn.dataset.projectId);
    const proj = state.projects.find(p => p.project_id === pid);
    Modal.showConfirm(t('confirm_delete_project'), `"${proj?.name}" ${t('confirm_delete_project_msg')}`, async () => {
      await window.timeTrack.projects.delete(pid);
      showToast(t('projects_deleted'), 'info');
      loadProjectsView();
    });
  }));

  grid.querySelectorAll('.task-checkbox').forEach(cb => cb.addEventListener('change', async () => {
    await window.timeTrack.tasks.updateStatus(parseInt(cb.dataset.id), cb.checked ? 'completed' : 'open');
    loadProjectsView();
  }));

  grid.querySelectorAll('.task-delete').forEach(btn => btn.addEventListener('click', async (e) => {
    e.stopPropagation();
    await window.timeTrack.tasks.delete(parseInt(btn.dataset.id));
    showToast(t('task_deleted'), 'info');
    loadProjectsView();
  }));
}

// ── REPORTS VIEW ────────────────────────────
async function loadReportsView() {
  const projects = await window.timeTrack.projects.getAll();
  const filterSelect = document.getElementById('reportProjectFilter');
  if (filterSelect) {
    filterSelect.innerHTML = `<option value="">${t('reports_all')}</option>` + projects.map(p => `<option value="${p.project_id}">${p.name}</option>`).join('');
  }

  // BUG FIX: only bind report listeners once
  if (!state._reportListenersAdded) {
    document.querySelectorAll('.filter-chips .chip').forEach(chip => chip.addEventListener('click', () => {
      document.querySelectorAll('.filter-chips .chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      state.reportPeriod = chip.dataset.period;
      const cd = document.getElementById('customDates');
      if (state.reportPeriod === 'custom') cd?.classList.remove('hidden');
      else { cd?.classList.add('hidden'); refreshReport(); }
    }));
    document.getElementById('dateStart')?.addEventListener('change', refreshReport);
    document.getElementById('dateEnd')?.addEventListener('change', refreshReport);
    filterSelect?.addEventListener('change', refreshReport);

    document.getElementById('btnExportCSV')?.addEventListener('click', async () => {
      const r = await window.timeTrack.export.toCSV(getReportFilters());
      if (r.success) showToast(t('reports_csv_saved'), 'success');
      else if (!r.canceled) showToast(r.error || t('error'), 'error');
    });
    document.getElementById('btnExportExcel')?.addEventListener('click', async () => {
      const r = await window.timeTrack.export.toExcel(getReportFilters());
      if (r.success) showToast(t('reports_excel_saved'), 'success');
      else if (!r.canceled) showToast(r.error || t('error'), 'error');
    });
    state._reportListenersAdded = true;
  }
  refreshReport();
}

function getReportFilters() {
  const projectId = document.getElementById('reportProjectFilter')?.value || null;
  let startDate, endDate;
  if (state.reportPeriod === 'custom') {
    startDate = document.getElementById('dateStart')?.value;
    endDate = document.getElementById('dateEnd')?.value;
    if (endDate) endDate += 'T23:59:59';
  } else {
    const range = getDateRange(state.reportPeriod);
    startDate = range.start; endDate = range.end;
  }
  return { startDate, endDate, projectId: projectId ? parseInt(projectId) : null };
}

async function refreshReport() {
  const filters = getReportFilters();
  if (!filters.startDate || !filters.endDate) return;

  const logs = await window.timeTrack.timeLogs.getByDateRange(filters.startDate, filters.endDate, filters.projectId);
  const stats = await window.timeTrack.timeLogs.getStats(filters.projectId, state.reportPeriod === 'custom' ? null : state.reportPeriod);

  const el = (id) => document.getElementById(id);
  if (el('reportTotalTime')) el('reportTotalTime').textContent = formatDuration(stats.total_seconds || 0);
  if (el('reportSessions')) el('reportSessions').textContent = stats.session_count || 0;
  if (el('reportAvgSession')) el('reportAvgSession').textContent = formatDuration(Math.round(stats.avg_session_seconds || 0));

  let totalEarnings = 0;
  logs.forEach(l => { totalEarnings += (l.duration_seconds / 3600) * (l.hourly_rate || 0); });
  const currSymbol = getLanguage() === 'tr' ? '₺' : '$';
  if (el('reportEarnings')) el('reportEarnings').textContent = `${currSymbol}${totalEarnings.toFixed(0)}`;

  const tbody = el('reportTableBody');
  if (!tbody) return;
  if (logs.length === 0) { tbody.innerHTML = `<tr><td colspan="7" class="table-empty">${t('reports_no_data')}</td></tr>`; return; }

  tbody.innerHTML = logs.map(l => `<tr><td>${formatDate(l.start_time)}</td><td><span class="color-dot" style="background:${l.project_color};display:inline-block;margin-right:6px"></span>${l.project_name}</td><td>${l.task_name}</td><td>${formatTimeOnly(l.start_time)}</td><td>${formatTimeOnly(l.end_time)}</td><td style="font-family:var(--font-mono)">${formatTime(l.duration_seconds)}</td><td style="color:var(--warning)">${l.afk_deduction_seconds > 0 ? formatDuration(l.afk_deduction_seconds) : '—'}</td></tr>`).join('');
}

// ── SETTINGS VIEW ───────────────────────────
async function loadSettingsView() {
  const settings = await window.timeTrack.settings.getAll();

  const afkSlider = document.getElementById('settingAfkThreshold');
  const afkValue = document.getElementById('afkThresholdValue');
  if (afkSlider && settings.afkThreshold) { afkSlider.value = settings.afkThreshold; afkValue.textContent = `${settings.afkThreshold} ${t('dur_min')}`; }
  afkSlider.oninput = () => { afkValue.textContent = `${afkSlider.value} ${t('dur_min')}`; };
  afkSlider.onchange = () => { window.timeTrack.settings.set('afkThreshold', parseInt(afkSlider.value)); showToast(t('settings_afk_updated'), 'success'); };

  const saveSlider = document.getElementById('settingAutoSave');
  const saveValue = document.getElementById('autoSaveValue');
  if (saveSlider && settings.autoSaveInterval) { saveSlider.value = settings.autoSaveInterval; saveValue.textContent = `${settings.autoSaveInterval} ${t('dur_sec')}`; }
  saveSlider.oninput = () => { saveValue.textContent = `${saveSlider.value} ${t('dur_sec')}`; };
  saveSlider.onchange = () => { window.timeTrack.settings.set('autoSaveInterval', parseInt(saveSlider.value)); showToast(t('settings_autosave_updated'), 'success'); };

  const aotToggle = document.getElementById('settingAlwaysOnTop');
  if (aotToggle && settings.alwaysOnTop !== undefined) aotToggle.checked = settings.alwaysOnTop;
  aotToggle.onchange = () => { window.timeTrack.settings.set('alwaysOnTop', aotToggle.checked); showToast(aotToggle.checked ? t('settings_aot_on') : t('settings_aot_off'), 'info'); };

  // Language selector
  const langSelect = document.getElementById('settingLanguage');
  if (langSelect) {
    langSelect.value = getLanguage();
    langSelect.onchange = async () => {
      const newLang = langSelect.value;
      setLanguage(newLang);
      await window.timeTrack.settings.set('language', newLang);
      // Rebuild all views with new language
      rebuildViews();
      updateStaticTexts();
      switchView(state.currentView);
      showToast(t('settings_language_updated'), 'success');
    };
  }
}
