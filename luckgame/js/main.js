import { state, refreshUI, initDaily, loadBg, saveState, exportProgress, importProgress, showToast, animateCoin } from './state.js';
import { initModals, openModal, closeModal } from './modal.js';
import { initSlots } from './slots.js';

loadBg();
initDaily();
initModals();
initSlots();
refreshUI();

// ── Save / Load ──────────────────────────────────────────────────────────────
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
    Object.assign(state, {
      balance: 1000,
      lastDaily: new Date().toDateString(),
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

// ── Free Coins / Ad modal ────────────────────────────────────────────────────
const AD_COOLDOWN_MS = 3 * 60 * 1000; // 3 min cooldown

const AD_FAKE_CONTENT = [
  { icon: '🍕', text: 'Hungry? Order now with PizzaBlast™' },
  { icon: '🚗', text: 'Find your dream car at AutoZen™' },
  { icon: '👟', text: 'Step up your game — RunFast™ shoes' },
  { icon: '📱', text: 'The new UltraPhone 15 is here' },
  { icon: '🎮', text: 'Play CrushSaga — #1 mobile game' },
  { icon: '☕', text: 'Start your morning with BeanDrop™' },
  { icon: '🌍', text: 'Travel deals — BookNow™' },
  { icon: '💪', text: 'Transform your body — FitPro™' },
];

let adPlaying = false;

function getLastAdTime() {
  try { return parseInt(localStorage.getItem('luckgame_lastAd') || '0'); } catch { return 0; }
}
function setLastAdTime() {
  try { localStorage.setItem('luckgame_lastAd', Date.now().toString()); } catch {}
}

function updateAdCooldownNote() {
  const note = document.getElementById('adCooldownNote');
  if (!note) return;
  const elapsed   = Date.now() - getLastAdTime();
  const remaining = AD_COOLDOWN_MS - elapsed;
  if (remaining > 0) {
    const mins = Math.ceil(remaining / 60000);
    note.textContent = `Next free coins available in ~${mins} min`;
  } else {
    note.textContent = '';
  }
}

function updateAdButtons() {
  const elapsed   = Date.now() - getLastAdTime();
  const onCooldown = elapsed < AD_COOLDOWN_MS;
  document.querySelectorAll('.ad-option-btn').forEach(btn => {
    btn.disabled = onCooldown || adPlaying;
  });
  updateAdCooldownNote();
}

document.getElementById('freeCoinsBtn').addEventListener('click', () => {
  openModal('freecoins');
  document.getElementById('adScreen').style.display  = 'none';
  document.getElementById('adOptions').style.display = '';
  updateAdButtons();
});

document.querySelectorAll('.ad-option-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    if (adPlaying) return;
    const reward   = parseInt(btn.dataset.adReward);
    const duration = parseInt(btn.dataset.adDuration);
    playAd(reward, duration);
  });
});

function playAd(reward, durationSec) {
  adPlaying = true;
  updateAdButtons();

  const screen       = document.getElementById('adScreen');
  const options      = document.getElementById('adOptions');
  const screenIcon   = document.getElementById('adScreenIcon');
  const screenText   = document.getElementById('adScreenText');
  const skipBtn      = document.getElementById('adSkipBtn');
  const progressBar  = document.getElementById('adProgressBar');
  const countdownEl  = document.getElementById('adSkipCountdown');

  options.style.display  = 'none';
  screen.style.display   = '';
  progressBar.style.width = '0%';
  skipBtn.className = 'ad-screen__skip';
  skipBtn.style.pointerEvents = 'none';
  skipBtn.textContent = 'Skip in ';
  const countSpan = document.createElement('span');
  countSpan.id = 'adSkipCountdown';
  const skipDelaySec = Math.min(3, durationSec - 1);
  countSpan.textContent = skipDelaySec;
  skipBtn.appendChild(countSpan);
  skipBtn.appendChild(document.createTextNode('s'));

  const content = AD_FAKE_CONTENT[Math.floor(Math.random() * AD_FAKE_CONTENT.length)];
  screenIcon.textContent = content.icon;
  screenText.textContent = content.text;

  const startTime  = Date.now();
  const totalMs    = durationSec * 1000;
  const skipDelayMs = skipDelaySec * 1000;
  let skippable = false;
  let done      = false;

  // Countdown ticks
  let countVal = skipDelaySec;
  const countInterval = setInterval(() => {
    countVal--;
    const el = document.getElementById('adSkipCountdown');
    if (el && countVal > 0) el.textContent = countVal;
    else clearInterval(countInterval);
  }, 1000);

  // Unlock skip button after delay
  const skipUnlockTimer = setTimeout(() => {
    skippable = true;
    skipBtn.className = 'ad-screen__skip ad-screen__skip--active';
    skipBtn.style.pointerEvents = '';
    skipBtn.textContent = 'Skip ad';
  }, skipDelayMs);

  // Progress bar + auto-finish
  const progressInterval = setInterval(() => {
    if (done) { clearInterval(progressInterval); return; }
    const elapsed = Date.now() - startTime;
    const pct = Math.min((elapsed / totalMs) * 100, 100);
    progressBar.style.width = pct + '%';
    if (elapsed >= totalMs) {
      clearInterval(progressInterval);
      finishAd();
    }
  }, 80);

  function finishAd() {
    if (done) return;
    done = true;
    clearTimeout(skipUnlockTimer);
    clearInterval(countInterval);
    adPlaying = false;
    setLastAdTime();
    state.balance  += reward;
    state.totalWon += reward;
    saveState(state);
    refreshUI();
    animateCoin();
    screen.style.display  = 'none';
    options.style.display = '';
    updateAdButtons();
    showToast(`🪙 +${reward} coins from ad!`);
  }

  skipBtn.onclick = () => {
    if (!skippable || done) return;
    finishAd();
  };
}