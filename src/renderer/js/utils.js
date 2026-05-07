// ═══════════════════════════════════════════
// TimeTrack — Utility Functions
// ═══════════════════════════════════════════

function formatTime(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function formatDuration(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) totalSeconds = 0;
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  if (h > 0) return `${h}${t('dur_h')} ${m}${t('dur_m')}`;
  if (m > 0) return `${m}${t('dur_m')}`;
  return `0${t('dur_m')}`;
}

function formatDate(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  const locale = getLanguage() === 'tr' ? 'tr-TR' : 'en-US';
  return d.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatTimeOnly(isoStr) {
  if (!isoStr) return '—';
  const d = new Date(isoStr);
  const locale = getLanguage() === 'tr' ? 'tr-TR' : 'en-US';
  return d.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

function getDateRange(period) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let start, end;

  switch (period) {
    case 'today':
      start = today.toISOString();
      end = new Date(today.getTime() + 86400000).toISOString();
      break;
    case 'week':
      const dayOfWeek = today.getDay() || 7;
      start = new Date(today.getTime() - (dayOfWeek - 1) * 86400000).toISOString();
      end = new Date(today.getTime() + 86400000).toISOString();
      break;
    case 'month':
      start = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
      end = new Date(today.getTime() + 86400000).toISOString();
      break;
    default:
      start = today.toISOString();
      end = new Date(today.getTime() + 86400000).toISOString();
  }
  return { start, end };
}

const PROJECT_COLORS = [
  '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e',
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6'
];
