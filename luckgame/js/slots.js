import { state, saveState, refreshUI, showToast, animateCoin } from './state.js';

const SYMBOLS  = ['🍒', '🍋', '⭐', '7️⃣', '💎'];
const WEIGHTS  = [  30,   28,   22,    15,    5];
const PAYTABLE = {
  '💎💎💎': 50,
  '7️⃣7️⃣7️⃣': 20,
  '⭐⭐⭐':  10,
  '🍋🍋🍋':   5,
  '🍒🍒🍒':   3,
};

const BET_STEPS = [1, 5, 10, 50, 100, 500];
let currentBetIndex = 2;

function getBetAmount() {
  const allInEl = document.getElementById('betAllIn');
  if (allInEl && allInEl.dataset.allin === 'true') return Math.max(1, state.balance);
  return BET_STEPS[currentBetIndex];
}

function updateBetUI() {
  const allInEl = document.getElementById('betAllIn');
  const isAllIn = allInEl && allInEl.dataset.allin === 'true';
  const bet = isAllIn ? Math.max(1, state.balance) : BET_STEPS[currentBetIndex];
  const spinBtn = document.getElementById('spinBtn');
  if (spinBtn && !spinning) spinBtn.textContent = `Spin · ${bet.toLocaleString()} coins [Space]`;
  const slider = document.getElementById('betSlider');
  if (slider && !isAllIn) slider.value = currentBetIndex;
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

function buildStrip(finalSymbol, count = 28) {
  const strip = [];
  for (let i = 0; i < count - 1; i++) strip.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
  strip.push(finalSymbol);
  return strip;
}

function animateReel(reelIndex, finalSymbol, duration) {
  return new Promise(resolve => {
    const container = document.getElementById('reel' + reelIndex);
    const SYMBOL_H = 72;
    const strip = buildStrip(finalSymbol, 28);

    const stripEl = document.createElement('div');
    stripEl.className = 'reel-strip';
    strip.forEach(sym => {
      const cell = document.createElement('div');
      cell.className = 'reel-strip-cell';
      cell.textContent = sym;
      stripEl.appendChild(cell);
    });

    const existingSym = container.querySelector('.reel-symbol');
    existingSym.style.opacity = '0';
    container.appendChild(stripEl);

    const totalDist = (strip.length - 1) * SYMBOL_H;
    const startTime = performance.now();

    function easeOut(t) { return 1 - Math.pow(1 - t, 3); }

    function tick(now) {
      const elapsed = now - startTime;
      const t = Math.min(elapsed / duration, 1);
      const pos = easeOut(t) * totalDist;
      stripEl.style.transform = `translateY(-${pos}px)`;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        container.removeChild(stripEl);
        existingSym.textContent = finalSymbol;
        existingSym.style.opacity = '1';
        existingSym.style.transition = 'none';
        existingSym.style.transform = 'translateY(0)';
        resolve();
      }
    }

    requestAnimationFrame(tick);
  });
}

let spinning = false;

export function spin() {
  if (spinning) return;
  const SPIN_COST = getBetAmount();
  if (state.balance < SPIN_COST) { showToast('⚠️ Not enough coins!'); return; }

  spinning = true;
  state.balance   -= SPIN_COST;
  state.totalSpent += SPIN_COST;
  state.gamesPlayed++;
  saveState(state);
  refreshUI();
  updateBetUI();

  const spinBtn  = document.getElementById('spinBtn');
  const resultEl = document.getElementById('slotsResult');
  spinBtn.disabled     = true;
  resultEl.textContent = '· · ·';
  resultEl.className   = 'slots-result';

  const results   = [weightedRandom(), weightedRandom(), weightedRandom()];
  const durations = [700, 1050, 1400];

  Promise.all(results.map((sym, i) => animateReel(i, sym, durations[i]))).then(() => {
    const key      = results.join('');
    const allMatch = results[0] === results[1] && results[1] === results[2];
    const twoMatch = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

    let payout = 0, msg = '';
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
      msg = 'No match · Try again';
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

    spinning = false;
    spinBtn.disabled = false;
    updateBetUI();
  });
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
    slider.min = 0; slider.max = BET_STEPS.length - 1; slider.value = currentBetIndex;
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