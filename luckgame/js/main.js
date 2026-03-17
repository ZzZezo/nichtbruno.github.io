import { detectPerf } from './perf.js';
import { refreshUI, initDaily, loadBg } from './state.js';
import { initModals, openModal } from './modal.js';
import { initSlots  } from './slots.js';
import { exportProgress, importProgress } from './state.js';

detectPerf();

const badge = document.createElement('div');
badge.id = 'perfBadge';
badge.textContent = 'gfx · ' + (document.documentElement.dataset.perf ?? 'high');
document.body.appendChild(badge);

loadBg();
initDaily();
initModals();
initSlots();
refreshUI();

document.getElementById('saveloadBtn').addEventListener('click', () => {
  openModal('saveload');
  document.getElementById('exportCode').value   = '';
  document.getElementById('importCode').value   = '';
  document.getElementById('exportStatus').textContent = '';
  document.getElementById('importStatus').textContent = '';
  document.getElementById('exportStatus').className   = 'saveload-status';
  document.getElementById('importStatus').className   = 'saveload-status';
});

document.getElementById('exportBtn').addEventListener('click', async () => {
  const code = await exportProgress();
  if (code) {
    document.getElementById('exportCode').value = code;
    setStatus('exportStatus', 'Code generated — copy it and save it somewhere safe.', 'ok');
  } else {
    setStatus('exportStatus', 'Export failed. Try again.', 'err');
  }
});

document.getElementById('copyBtn').addEventListener('click', () => {
  const code = document.getElementById('exportCode').value;
  if (!code) { setStatus('exportStatus', 'Generate a code first.', 'err'); return; }
  navigator.clipboard.writeText(code).then(() => {
    setStatus('exportStatus', 'Copied to clipboard!', 'ok');
  }).catch(() => {
    setStatus('exportStatus', 'Copy failed — select all and copy manually.', 'err');
  });
});

document.getElementById('importBtn').addEventListener('click', async () => {
  const code = document.getElementById('importCode').value.trim();
  if (!code) { setStatus('importStatus', 'Paste a save code first.', 'err'); return; }
  const ok = await importProgress(code);
  if (ok) {
    setStatus('importStatus', 'Progress loaded successfully!', 'ok');
  } else {
    setStatus('importStatus', 'Invalid or corrupted code.', 'err');
  }
});

function setStatus(id, msg, type) {
  const el = document.getElementById(id);
  el.textContent = msg;
  el.className = 'saveload-status saveload-status--' + type;
}