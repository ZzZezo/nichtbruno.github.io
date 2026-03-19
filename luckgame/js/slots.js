import { state, saveState, refreshUI, showToast, animateCoin } from './state.js';

const SYMBOLS  = ['🍒', '🍋', '⭐', '7️⃣', '💎'];
const WEIGHTS  = [  30,   28,   22,    15,    5];   // out of 100
const PAYTABLE = {
  '💎💎💎': 50,
  '7️⃣7️⃣7️⃣': 20,
  '⭐⭐⭐':  10,
  '🍋🍋🍋':   5,
  '🍒🍒🍒':   3,
};

const BET_STEPS = [1, 5, 10, 50, 100, 500];
let currentBetIndex = 2; // default to 10

function getBetAmount() {
  const allInEl = document.getElementById('betAllIn');
  if (allInEl && allInEl.dataset.allin === 'true') {
    return Math.max(1, state.balance);
  }
  return BET_STEPS[currentBetIndex];
}

function updateBetUI() {
  const allInEl = document.getElementById('betAllIn');
  const isAllIn = allInEl && allInEl.dataset.allin === 'true';
  const bet = isAllIn ? Math.max(1, state.balance) : BET_STEPS[currentBetIndex];

  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn && !spinning) {
    spinBtn.textContent = `Spin · ${bet.toLocaleString()} coins [Space]`;
  }

  const slider = document.getElementById('betSlider');
  if (slider && !isAllIn) {
    slider.value = currentBetIndex;
  }

  document.querySelectorAll('.bet-step[data-bet-index]').forEach((el, i) => {
    el.classList.toggle('bet-step--active', !isAllIn && i === currentBetIndex);
  });
  if (allInEl) allInEl.classList.toggle('bet-step--active', isAllIn);
}

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
  const SPIN_COST = getBetAmount();
  if (state.balance < SPIN_COST) { showToast('⚠️ Not enough coins!'); return; }

  spinning = true;
  state.balance  -= SPIN_COST;
  state.totalSpent += SPIN_COST;
  state.gamesPlayed++;
  saveState(state);
  refreshUI();
  updateBetUI();

  const spinBtn    = document.getElementById('spinBtn');
  const resultEl   = document.getElementById('slotsResult');
  spinBtn.disabled = true;
  resultEl.textContent = '· · ·';
  resultEl.className   = 'slots-result';

  [0, 1, 2].forEach(i => document.getElementById('reel' + i).classList.add('spinning'));

  const results = [weightedRandom(), weightedRandom(), weightedRandom()];
  const delays  = [600, 900, 1200];

  // Cycle random symbols on each reel while spinning
  const cycleIntervals = [0, 1, 2].map(i => {
    const sym = document.getElementById('sym' + i);
    return setInterval(() => {
      sym.textContent = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
    }, 80);
  });

  delays.forEach((delay, i) => {
    setTimeout(() => {
      clearInterval(cycleIntervals[i]);
      const reel = document.getElementById('reel' + i);
      const sym  = document.getElementById('sym'  + i);
      reel.classList.remove('spinning');

      // Snap new symbol in from below
      sym.style.transition = 'none';
      sym.style.transform  = 'translateY(60px)';
      sym.style.opacity    = '0';
      sym.textContent      = results[i];

      sym.getBoundingClientRect(); // force reflow
      sym.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.18s ease';
      sym.style.transform  = 'translateY(0)';
      sym.style.opacity    = '1';
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
      msg    = `Jackpot! +${payout.toLocaleString()} coins`;
      resultEl.className = 'slots-result slots-result--win';
      const machine = document.querySelector('.slots-machine');
      machine.classList.add('win-flash');
      setTimeout(() => machine.classList.remove('win-flash'), 1800);
    } else if (twoMatch && !allMatch) {
      payout = SPIN_COST;
      msg    = `Two match! +${payout.toLocaleString()} coins`;
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
    updateBetUI();
  }, 1400);
}

export function initSlots() {
  document.getElementById('spinBtn').addEventListener('click', spin);

  document.querySelectorAll('.bet-step[data-bet-index]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentBetIndex = parseInt(btn.dataset.betIndex);
      const allInEl = document.getElementById('betAllIn');
      if (allInEl) allInEl.dataset.allin = 'false';
      const slider = document.getElementById('betSlider');
      if (slider) slider.value = currentBetIndex;
      updateBetUI();
    });
  });

  const allInEl = document.getElementById('betAllIn');
  if (allInEl) {
    allInEl.dataset.allin = 'false';
    allInEl.addEventListener('click', () => {
      allInEl.dataset.allin = allInEl.dataset.allin === 'true' ? 'false' : 'true';
      updateBetUI();
    });
  }

  const slider = document.getElementById('betSlider');
  if (slider) {
    slider.min   = 0;
    slider.max   = BET_STEPS.length - 1;
    slider.value = currentBetIndex;
    slider.addEventListener('input', () => {
      currentBetIndex = parseInt(slider.value);
      const allInEl = document.getElementById('betAllIn');
      if (allInEl) allInEl.dataset.allin = 'false';
      updateBetUI();
    });
  }

  updateBetUI();

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.getElementById('modal-slots').classList.contains('modal-backdrop--open')) {
      e.preventDefault();
      spin();
    }
  });
}