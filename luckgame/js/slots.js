import { state, saveState, refreshUI, showToast, animateCoin } from './state.js';

const SYMBOLS  = ['🍒', '🍋', '⭐', '7️⃣', '💎', '🗿'];
const WEIGHTS  = [  40,   25,   18,    12,    5,    1];   // out of 100
const PAYTABLE = {
  '🗿🗿🗿': 100,
  '💎💎💎': 50,
  '7️⃣7️⃣7️⃣': 20,
  '⭐⭐⭐':  10,
  '🍋🍋🍋':   5,
  '🍒🍒🍒':   3,
};
const SPIN_COST = 10;

function weightedRandom() {
  const total = WEIGHTS.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < SYMBOLS.length; i++) {
    r -= WEIGHTS[i];
    if (r <= 0) return SYMBOLS[i];
  }
  return SYMBOLS[SYMBOLS.length - 1];
}

let spinning = false;

export function spin() {
  if (spinning) return;
  if (state.balance < SPIN_COST) { showToast('⚠️ Not enough coins!'); return; }

  spinning = true;
  state.balance  -= SPIN_COST;
  state.totalSpent += SPIN_COST;
  state.gamesPlayed++;
  saveState(state);
  refreshUI();

  const spinBtn    = document.getElementById('spinBtn');
  const resultEl   = document.getElementById('slotsResult');
  spinBtn.disabled = true;
  resultEl.textContent = '· · ·';
  resultEl.className   = 'slots-result';

  [0, 1, 2].forEach(i => document.getElementById('reel' + i).classList.add('spinning'));

  const results = [weightedRandom(), weightedRandom(), weightedRandom()];
  const delays  = [600, 900, 1200];

  delays.forEach((delay, i) => {
    setTimeout(() => {
      document.getElementById('reel'  + i).classList.remove('spinning');
      document.getElementById('sym'   + i).textContent = results[i];
    }, delay);
  });

  setTimeout(() => {
    const key      = results.join('');
    const allMatch = results[0] === results[1] && results[1] === results[2];
    const twoMatch = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

    let payout = 0;
    let msg    = '';

    if (PAYTABLE[key]) {
      payout = SPIN_COST * PAYTABLE[key];
      msg    = `Jackpot! +${payout} coins`;
      resultEl.className = 'slots-result slots-result--win';
      const machine = document.querySelector('.slots-machine');
      machine.classList.add('win-flash');
      setTimeout(() => machine.classList.remove('win-flash'), 1800);
    } else if (twoMatch && !allMatch) {
      payout = 5;
      msg    = `Two match! +${payout} coins`;
      resultEl.className = 'slots-result slots-result--win';
    } else {
      msg    = 'No match · Try again';
      resultEl.className = 'slots-result slots-result--lose';
    }

    resultEl.textContent = msg;

    if (payout > 0) {
      state.balance  += payout;
      state.totalWon += payout;
      saveState(state);
      refreshUI();
      animateCoin();
    }

    spinning         = false;
    spinBtn.disabled = false;
  }, 1400);
}

export function initSlots() {
  document.getElementById('spinBtn').addEventListener('click', spin);
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.getElementById('modal-slots').classList.contains('modal-backdrop--open')) {
      e.preventDefault();
      spin();
    }
  });
}