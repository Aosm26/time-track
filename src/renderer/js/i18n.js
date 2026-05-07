// ═══════════════════════════════════════════
// TimeTrack — Internationalization (i18n)
// ═══════════════════════════════════════════

const TRANSLATIONS = {
  en: {
    // Nav
    nav_timer: 'Timer',
    nav_projects: 'Projects',
    nav_reports: 'Reports',
    nav_settings: 'Settings',
    nav_mini: 'Mini Mode',

    // Title bar
    btn_minimize: 'Minimize',
    btn_maximize: 'Maximize',
    btn_close: 'Close',

    // Timer
    timer_idle: 'Idle',
    timer_running: 'Running',
    timer_afk: 'AFK',
    timer_project: 'Project',
    timer_task: 'Task',
    timer_select_project: 'Select project...',
    timer_select_task_first: 'Select project first...',
    timer_select_task: 'Select task...',
    timer_start: 'Start',
    timer_stop: 'Stop',
    timer_today_total: 'Today Total',
    timer_sessions: 'Sessions',
    timer_recent: 'Recent Sessions',
    timer_no_sessions: 'No sessions yet',
    timer_no_projects: 'No projects found',
    timer_no_tasks: 'No tasks found',
    timer_started_fail: 'Could not start',
    timer_session_saved: 'Session saved',

    // Projects
    projects_title: 'Projects',
    projects_new: 'New Project',
    projects_empty: 'No projects created yet',
    projects_empty_hint: 'Create your first project to start tracking',
    projects_tasks: 'tasks',
    projects_no_tasks: 'No tasks',
    projects_add_task: '+ Add Task',
    projects_edit: 'Edit',
    projects_delete: 'Delete',
    projects_created: 'Project created',
    projects_updated: 'Project updated',
    projects_deleted: 'Project deleted',

    // Project form
    form_project_edit: 'Edit Project',
    form_project_new: 'New Project',
    form_project_name: 'Project Name',
    form_project_name_ph: 'Enter project name...',
    form_hourly_rate: 'Hourly Rate ($)',
    form_color: 'Color',
    form_cancel: 'Cancel',
    form_create: 'Create',
    form_update: 'Update',
    form_project_name_required: 'Project name is required',

    // Tasks
    form_task_new: 'New Task',
    form_task_name: 'Task Name',
    form_task_name_ph: 'Enter task name...',
    form_task_add: 'Add',
    form_task_name_required: 'Task name is required',
    task_added: 'Task added',
    task_deleted: 'Task deleted',

    // Confirm
    confirm_delete_project: 'Delete Project',
    confirm_delete_project_msg: 'project and all its tasks will be deleted. Are you sure?',
    confirm_delete_btn: 'Delete',

    // Reports
    reports_title: 'Reports',
    reports_period: 'Period',
    reports_today: 'Today',
    reports_week: 'This Week',
    reports_month: 'This Month',
    reports_custom: 'Custom',
    reports_project: 'Project',
    reports_all: 'All',
    reports_total_time: 'Total Time',
    reports_session_count: 'Sessions',
    reports_avg_session: 'Avg. Session',
    reports_earnings: 'Est. Earnings',
    reports_date: 'Date',
    reports_start: 'Start',
    reports_end: 'End',
    reports_duration: 'Duration',
    reports_afk: 'AFK',
    reports_no_data: 'No data found',
    reports_csv_saved: 'CSV saved',
    reports_excel_saved: 'Excel saved',

    // Settings
    settings_title: 'Settings',
    settings_timer: 'Timer',
    settings_afk_threshold: 'AFK Threshold',
    settings_afk_desc: 'Idle time threshold (minutes)',
    settings_autosave: 'Auto Save',
    settings_autosave_desc: 'Save active session interval (seconds)',
    settings_app: 'Application',
    settings_always_on_top: 'Always on Top',
    settings_always_on_top_desc: 'Keep window above other windows',
    settings_language: 'Language',
    settings_language_desc: 'Interface language',
    settings_shortcuts: 'Keyboard Shortcuts',
    settings_shortcut_timer: 'Start / Stop',
    settings_shortcut_mini: 'Mini Mode',
    settings_shortcut_show: 'Show / Hide',
    settings_afk_updated: 'AFK threshold updated',
    settings_autosave_updated: 'Auto save updated',
    settings_aot_on: 'Always on top enabled',
    settings_aot_off: 'Always on top disabled',
    settings_language_updated: 'Language updated',

    // AFK
    afk_title: 'Are you there?',
    afk_default_desc: 'Detected as AFK',
    afk_desc: 'You have been inactive for {min} minutes. Timer paused automatically.',
    afk_continue: 'Continue',
    afk_stop: 'End Session',

    // Session recovery
    recovery_title: 'Session Recovery',
    recovery_desc: 'Incomplete session(s) found. Would you like to recover?',
    recovery_delete: 'Delete',
    recovery_recover: 'Recover',
    recovery_recovered: 'Sessions recovered',
    recovery_deleted: 'Drafts deleted',

    // Status bar
    status_idle: 'Idle',
    status_running: 'Running',

    // Duration
    dur_h: 'h',
    dur_m: 'm',
    dur_min: 'min',
    dur_sec: 's',

    // Tray
    tray_show_hide: 'Show/Hide',
    tray_start_stop: 'Start/Stop',
    tray_quit: 'Quit',
    tray_idle: 'Idle',

    // General
    error: 'Error',
  },

  tr: {
    // Nav
    nav_timer: 'Zamanlayıcı',
    nav_projects: 'Projeler',
    nav_reports: 'Raporlar',
    nav_settings: 'Ayarlar',
    nav_mini: 'Mini Mod',

    // Title bar
    btn_minimize: 'Küçült',
    btn_maximize: 'Büyüt',
    btn_close: 'Kapat',

    // Timer
    timer_idle: 'Boşta',
    timer_running: 'Çalışıyor',
    timer_afk: 'AFK',
    timer_project: 'Proje',
    timer_task: 'Görev',
    timer_select_project: 'Proje seçin...',
    timer_select_task_first: 'Önce proje seçin...',
    timer_select_task: 'Görev seçin...',
    timer_start: 'Başlat',
    timer_stop: 'Durdur',
    timer_today_total: 'Bugün Toplam',
    timer_sessions: 'Seans',
    timer_recent: 'Son Seanslar',
    timer_no_sessions: 'Henüz seans kaydı yok',
    timer_no_projects: 'Proje bulunamadı',
    timer_no_tasks: 'Görev bulunamadı',
    timer_started_fail: 'Başlatılamadı',
    timer_session_saved: 'Seans kaydedildi',

    // Projects
    projects_title: 'Projeler',
    projects_new: 'Yeni Proje',
    projects_empty: 'Henüz proje oluşturulmadı',
    projects_empty_hint: 'Zaman takibine başlamak için ilk projenizi oluşturun',
    projects_tasks: 'görev',
    projects_no_tasks: 'Görev yok',
    projects_add_task: '+ Görev Ekle',
    projects_edit: 'Düzenle',
    projects_delete: 'Sil',
    projects_created: 'Proje oluşturuldu',
    projects_updated: 'Proje güncellendi',
    projects_deleted: 'Proje silindi',

    // Project form
    form_project_edit: 'Proje Düzenle',
    form_project_new: 'Yeni Proje',
    form_project_name: 'Proje Adı',
    form_project_name_ph: 'Proje adını girin...',
    form_hourly_rate: 'Saatlik Ücret (₺)',
    form_color: 'Renk',
    form_cancel: 'İptal',
    form_create: 'Oluştur',
    form_update: 'Güncelle',
    form_project_name_required: 'Proje adı gerekli',

    // Tasks
    form_task_new: 'Yeni Görev',
    form_task_name: 'Görev Adı',
    form_task_name_ph: 'Görev adını girin...',
    form_task_add: 'Ekle',
    form_task_name_required: 'Görev adı gerekli',
    task_added: 'Görev eklendi',
    task_deleted: 'Görev silindi',

    // Confirm
    confirm_delete_project: 'Projeyi Sil',
    confirm_delete_project_msg: 'projesi ve tüm görevleri silinecek. Emin misiniz?',
    confirm_delete_btn: 'Sil',

    // Reports
    reports_title: 'Raporlar',
    reports_period: 'Dönem',
    reports_today: 'Bugün',
    reports_week: 'Bu Hafta',
    reports_month: 'Bu Ay',
    reports_custom: 'Özel',
    reports_project: 'Proje',
    reports_all: 'Tümü',
    reports_total_time: 'Toplam Süre',
    reports_session_count: 'Seans',
    reports_avg_session: 'Ort. Seans',
    reports_earnings: 'Tahmini Kazanç',
    reports_date: 'Tarih',
    reports_start: 'Başlangıç',
    reports_end: 'Bitiş',
    reports_duration: 'Süre',
    reports_afk: 'AFK',
    reports_no_data: 'Veri bulunamadı',
    reports_csv_saved: 'CSV kaydedildi',
    reports_excel_saved: 'Excel kaydedildi',

    // Settings
    settings_title: 'Ayarlar',
    settings_timer: 'Zamanlayıcı',
    settings_afk_threshold: 'AFK Eşik Süresi',
    settings_afk_desc: 'Hareketsiz kalma süresi eşiği (dakika)',
    settings_autosave: 'Otomatik Kaydetme',
    settings_autosave_desc: 'Aktif seansı kaydetme aralığı (saniye)',
    settings_app: 'Uygulama',
    settings_always_on_top: 'Her Zaman Üstte',
    settings_always_on_top_desc: 'Pencereyi diğer pencerelerin üstünde tut',
    settings_language: 'Dil',
    settings_language_desc: 'Arayüz dili',
    settings_shortcuts: 'Klavye Kısayolları',
    settings_shortcut_timer: 'Başlat / Durdur',
    settings_shortcut_mini: 'Mini Mod',
    settings_shortcut_show: 'Göster / Gizle',
    settings_afk_updated: 'AFK eşiği güncellendi',
    settings_autosave_updated: 'Otomatik kaydetme güncellendi',
    settings_aot_on: 'Her zaman üstte açıldı',
    settings_aot_off: 'Her zaman üstte kapatıldı',
    settings_language_updated: 'Dil güncellendi',

    // AFK
    afk_title: 'Bilgisayar Başında mısınız?',
    afk_default_desc: 'AFK olarak algılandı',
    afk_desc: '{min} dakikadır hareketsizsiniz. Süre otomatik duraklatıldı.',
    afk_continue: 'Devam Et',
    afk_stop: 'Seansı Bitir',

    // Session recovery
    recovery_title: 'Seans Kurtarma',
    recovery_desc: 'Tamamlanmamış seans(lar) bulundu. Kurtarmak ister misiniz?',
    recovery_delete: 'Sil',
    recovery_recover: 'Kurtar',
    recovery_recovered: 'Seanslar kurtarıldı',
    recovery_deleted: 'Taslaklar silindi',

    // Status bar
    status_idle: 'Boşta',
    status_running: 'Çalışıyor',

    // Duration
    dur_h: 'sa',
    dur_m: 'dk',
    dur_min: 'dk',
    dur_sec: 'sn',

    // Tray
    tray_show_hide: 'Göster/Gizle',
    tray_start_stop: 'Başlat/Durdur',
    tray_quit: 'Çıkış',
    tray_idle: 'Boşta',

    // General
    error: 'Hata',
  }
};

let currentLang = 'en';

function t(key, replacements = {}) {
  let str = TRANSLATIONS[currentLang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  for (const [k, v] of Object.entries(replacements)) {
    str = str.replace(`{${k}}`, v);
  }
  return str;
}

function setLanguage(lang) {
  if (TRANSLATIONS[lang]) {
    currentLang = lang;
  }
}

function getLanguage() {
  return currentLang;
}
