import { state, refreshUI, initDaily, loadBg, saveState } from './state.js';
import { initModals, openModal } from './modal.js';
import { initSlots  } from './slots.js';
import { exportProgress, importProgress } from './state.js';

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
  document.getElementById('resetStatus').textContent  = '';
  document.getElementById('exportStatus').className   = 'saveload-status';
  document.getElementById('importStatus').className   = 'saveload-status';
  document.getElementById('resetStatus').className    = 'saveload-status';
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

let resetConfirmPending = false;
let resetConfirmTimer;
document.getElementById('resetBtn').addEventListener('click', () => {
  if (!resetConfirmPending) {
    resetConfirmPending = true;
    document.getElementById('resetBtn').textContent = '⚠ Click again to confirm reset';
    setStatus('resetStatus', 'This will wipe all coins, stats and history.', 'err');
    resetConfirmTimer = setTimeout(() => {
      resetConfirmPending = false;
      document.getElementById('resetBtn').textContent = '⚠ Reset all progress';
      document.getElementById('resetStatus').textContent = '';
      document.getElementById('resetStatus').className = 'saveload-status';
    }, 4000);
  } else {
    clearTimeout(resetConfirmTimer);
    resetConfirmPending = false;
    // Wipe state
    Object.assign(state, {
      balance: 1000,
      lastDaily: new Date().getFullYear() + '-' + new Date().getMonth() + '-' + new Date().getDate(),
      gamesPlayed: 0,
      totalWon: 0,
      totalSpent: 0,
    });
    saveState(state);
    refreshUI();
    document.getElementById('resetBtn').textContent = '⚠ Reset all progress';
    setStatus('resetStatus', 'Progress reset. Starting fresh with 1000 coins.', 'ok');
  }
});