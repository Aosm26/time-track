// ═══════════════════════════════════════════
// TimeTrack — Modal Manager (i18n)
// ═══════════════════════════════════════════

const Modal = {
  _overlay: null,
  _modal: null,
  _title: null,
  _body: null,
  _footer: null,
  _closeBtn: null,

  init() {
    this._overlay = document.getElementById('modalOverlay');
    this._modal = document.getElementById('modal');
    this._title = document.getElementById('modalTitle');
    this._body = document.getElementById('modalBody');
    this._footer = document.getElementById('modalFooter');
    this._closeBtn = document.getElementById('modalClose');

    this._closeBtn.addEventListener('click', () => this.close());
    this._overlay.addEventListener('click', (e) => {
      if (e.target === this._overlay) this.close();
    });
  },

  show(title, bodyHTML, footerHTML) {
    this._title.textContent = title;
    this._body.innerHTML = bodyHTML;
    this._footer.innerHTML = footerHTML || '';
    this._overlay.classList.remove('hidden');
  },

  close() {
    this._overlay.classList.add('hidden');
  },

  showProjectForm(project = null, onSave) {
    const isEdit = !!project;
    const title = isEdit ? t('form_project_edit') : t('form_project_new');
    const currentColor = project?.color || '#6366f1';

    const bodyHTML = `
      <div class="form-group">
        <label class="form-label">${t('form_project_name')}</label>
        <input type="text" class="form-input" id="inputProjectName" placeholder="${t('form_project_name_ph')}" value="${project?.name || ''}" autofocus>
      </div>
      <div class="form-group">
        <label class="form-label">${t('form_hourly_rate')}</label>
        <input type="number" class="form-input" id="inputHourlyRate" placeholder="0" min="0" step="0.01" value="${project?.hourly_rate || 0}">
      </div>
      <div class="form-group">
        <label class="form-label">${t('form_color')}</label>
        <div class="color-picker-row" id="colorPicker">
          ${PROJECT_COLORS.map(c => `<div class="color-swatch ${c === currentColor ? 'selected' : ''}" data-color="${c}" style="background:${c}"></div>`).join('')}
        </div>
      </div>
    `;

    const footerHTML = `
      <button class="btn btn-ghost" id="modalCancel">${t('form_cancel')}</button>
      <button class="btn btn-primary" id="modalSave">${isEdit ? t('form_update') : t('form_create')}</button>
    `;

    this.show(title, bodyHTML, footerHTML);

    let selectedColor = currentColor;
    document.getElementById('colorPicker').addEventListener('click', (e) => {
      const swatch = e.target.closest('.color-swatch');
      if (!swatch) return;
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('selected'));
      swatch.classList.add('selected');
      selectedColor = swatch.dataset.color;
    });

    document.getElementById('modalCancel').addEventListener('click', () => this.close());
    document.getElementById('modalSave').addEventListener('click', () => {
      const name = document.getElementById('inputProjectName').value.trim();
      const hourlyRate = parseFloat(document.getElementById('inputHourlyRate').value) || 0;
      if (!name) { showToast(t('form_project_name_required'), 'error'); return; }
      onSave({ name, hourlyRate, color: selectedColor });
      this.close();
    });

    document.getElementById('inputProjectName').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('modalSave').click();
    });
  },

  showTaskForm(projectId, onSave) {
    const bodyHTML = `
      <div class="form-group">
        <label class="form-label">${t('form_task_name')}</label>
        <input type="text" class="form-input" id="inputTaskName" placeholder="${t('form_task_name_ph')}" autofocus>
      </div>
    `;
    const footerHTML = `
      <button class="btn btn-ghost" id="modalCancel">${t('form_cancel')}</button>
      <button class="btn btn-primary" id="modalSave">${t('form_task_add')}</button>
    `;

    this.show(t('form_task_new'), bodyHTML, footerHTML);

    document.getElementById('modalCancel').addEventListener('click', () => this.close());
    document.getElementById('modalSave').addEventListener('click', () => {
      const name = document.getElementById('inputTaskName').value.trim();
      if (!name) { showToast(t('form_task_name_required'), 'error'); return; }
      onSave({ projectId, name });
      this.close();
    });

    document.getElementById('inputTaskName').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('modalSave').click();
    });
  },

  showConfirm(title, message, onConfirm) {
    const bodyHTML = `<p style="color: var(--text-secondary); font-size: var(--text-sm);">${message}</p>`;
    const footerHTML = `
      <button class="btn btn-ghost" id="modalCancel">${t('form_cancel')}</button>
      <button class="btn btn-danger" id="modalConfirm">${t('confirm_delete_btn')}</button>
    `;

    this.show(title, bodyHTML, footerHTML);

    document.getElementById('modalCancel').addEventListener('click', () => this.close());
    document.getElementById('modalConfirm').addEventListener('click', () => {
      onConfirm();
      this.close();
    });
  },

  showRecovery(drafts, onRecover, onDelete) {
    const list = drafts.map(d => `
      <div class="session-item" style="margin-bottom:8px">
        <div class="session-info">
          <div class="color-dot" style="background:${d.project_color}"></div>
          <div>
            <div class="session-project">${d.project_name}</div>
            <div class="session-task">${d.task_name}</div>
          </div>
        </div>
        <div style="text-align:right">
          <div class="session-time">${formatDuration(d.duration_seconds || 0)}</div>
          <div class="session-date">${formatDate(d.start_time)}</div>
        </div>
      </div>
    `).join('');

    const bodyHTML = `
      <p style="color:var(--text-secondary);font-size:var(--text-sm);margin-bottom:16px">${t('recovery_desc')}</p>
      ${list}
    `;
    const footerHTML = `
      <button class="btn btn-danger" id="modalDelete">${t('recovery_delete')}</button>
      <button class="btn btn-primary" id="modalRecover">${t('recovery_recover')}</button>
    `;

    this.show(t('recovery_title'), bodyHTML, footerHTML);

    document.getElementById('modalDelete').addEventListener('click', () => {
      onDelete(drafts);
      this.close();
    });
    document.getElementById('modalRecover').addEventListener('click', () => {
      onRecover(drafts);
      this.close();
    });
  }
};
