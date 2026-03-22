import { state, saveState, refreshUI, showToast, animateCoin, isMuted, setMuted } from './state.js';

const SYMBOLS  = ['cherry', 'orange', 'star', 'seven', 'diamond'];
const WEIGHTS  = [       30,       28,     22,      15,          5];
const SYMBOL_IMG = '../assets/images/luckgame/slots/';
const PAYTABLE = {};
PAYTABLE['diamond'+'diamond'+'diamond'] = 50;
PAYTABLE['seven'  +'seven'  +'seven'  ] = 20;
PAYTABLE['star'   +'star'   +'star'   ] = 10;
PAYTABLE['orange' +'orange' +'orange' ] =  5;
PAYTABLE['cherry' +'cherry' +'cherry' ] =  3;

const BET_STEPS = [1, 10, 100, 1000, 10000, 100000];
let currentBetIndex = 2;

let _audioCtx      = null;
let _spinBuffer    = null;
let _spinSource    = null;
let _spinGainNode  = null;

function getCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

async function loadSpinSound() {
  try {
    const ctx  = getCtx();
    const res  = await fetch('../assets/sounds/spinning.wav');
    const buf  = await res.arrayBuffer();
    _spinBuffer = await ctx.decodeAudioData(buf);
  } catch (e) {
    console.warn('Could not load spinning.wav:', e);
  }
}

function soundSpinStart() {
  if (!_spinBuffer || isMuted()) return;
  const ctx       = getCtx();
  _spinGainNode   = ctx.createGain();
  _spinGainNode.gain.setValueAtTime(0.0001, ctx.currentTime);
  _spinGainNode.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.12);
  _spinGainNode.connect(ctx.destination);

  _spinSource        = ctx.createBufferSource();
  _spinSource.buffer = _spinBuffer;
  _spinSource.loop   = true;
  _spinSource.connect(_spinGainNode);
  _spinSource.start(ctx.currentTime);
}

function soundSpinStop() {
  if (!_spinSource || !_spinGainNode) return;
  const ctx = getCtx();
  _spinGainNode.gain.cancelScheduledValues(ctx.currentTime);
  _spinGainNode.gain.setValueAtTime(_spinGainNode.gain.value, ctx.currentTime);
  _spinGainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
  const src = _spinSource;
  setTimeout(() => { try { src.stop(); } catch(_) {} }, 280);
  _spinSource   = null;
  _spinGainNode = null;
}

function tone({ type, freq, freqEnd, rampTime, gain, attack, decay, offset = 0 }) {
  if (isMuted()) return;
  const ctx = getCtx();
  const now = ctx.currentTime + offset;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd !== undefined && rampTime) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + rampTime);
  }

  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(gain, now + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);

  osc.connect(env);
  env.connect(ctx.destination);
  osc.start(now);
  osc.stop(now + attack + decay + 0.05);
}

function soundPress() {
  tone({ type: 'square', freq: 380, freqEnd: 180, rampTime: 0.08, gain: 0.28, attack: 0.005, decay: 0.12 });
}

function soundReelStop(reelIndex) {
  const freqs = [220, 260, 310];
  const f = freqs[reelIndex];

  tone({ type: 'sine',     freq: f,     freqEnd: f * 0.4, rampTime: 0.14, gain: 0.70, attack: 0.004, decay: 0.22 });
  tone({ type: 'triangle', freq: f * 2, freqEnd: f * 0.8, rampTime: 0.10, gain: 0.35, attack: 0.003, decay: 0.18 });
  tone({ type: 'square',   freq: f * 4, freqEnd: f * 1.5, rampTime: 0.05, gain: 0.18, attack: 0.002, decay: 0.08 });
}

function soundLose() {
  tone({ type: 'sawtooth', freq: 260, freqEnd: 100, rampTime: 0.22, gain: 0.22, attack: 0.01, decay: 0.35 });
  tone({ type: 'sawtooth', freq: 200, freqEnd:  80, rampTime: 0.22, gain: 0.16, attack: 0.01, decay: 0.35, offset: 0.05 });
}

function soundBonus() {
  tone({ type: 'triangle', freq: 440,  gain: 0.32, attack: 0.008, decay: 0.22 });
  tone({ type: 'triangle', freq: 550,  gain: 0.32, attack: 0.008, decay: 0.26, offset: 0.16 });
  tone({ type: 'sine',     freq: 1200, freqEnd: 900, rampTime: 0.15, gain: 0.10, attack: 0.005, decay: 0.24, offset: 0.10 });
}

function soundJackpot() {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    tone({ type: 'square',   freq, freqEnd: freq * 0.97, rampTime: 0.15, gain: 0.28, attack: 0.01, decay: 0.38, offset: i * 0.12 });
    tone({ type: 'triangle', freq, freqEnd: freq * 0.97, rampTime: 0.15, gain: 0.16, attack: 0.01, decay: 0.42, offset: i * 0.12 + 0.02 });
  });
  [1200, 1600, 2000].forEach((freq, i) => {
    tone({ type: 'sine', freq, freqEnd: freq * 0.8, rampTime: 0.4, gain: 0.08, attack: 0.01, decay: 0.55, offset: 0.30 + i * 0.08 });
  });
}

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

let spinning = false;

export function spin() {
  if (spinning) return;
  const SPIN_COST = getBetAmount();
  if (state.balance < SPIN_COST) { showToast('⚠️ Not enough coins!'); return; }

  soundPress();

  spinning = true;
  state.balance    -= SPIN_COST;
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

  soundSpinStart();

  const results = [weightedRandom(), weightedRandom(), weightedRandom()];
  const delays  = [600, 900, 1200];

  const cycleIntervals = [0, 1, 2].map(i => {
    const sym = document.getElementById('sym' + i);
    return setInterval(() => {
      const rs = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      sym.innerHTML = '<img src="' + SYMBOL_IMG + rs + '.png" alt="' + rs + '" class="reel-img">';
    }, 80);
  });

  delays.forEach((delay, i) => {
    setTimeout(() => {
      clearInterval(cycleIntervals[i]);

      if (i === 2) soundSpinStop();
      soundReelStop(i);

      const reel = document.getElementById('reel' + i);
      const sym  = document.getElementById('sym'  + i);
      reel.classList.remove('spinning');

      sym.style.transition = 'none';
      sym.style.transform  = 'translateY(60px)';
      sym.style.opacity    = '0';
      sym.innerHTML        = '<img src="' + SYMBOL_IMG + results[i] + '.png" alt="' + results[i] + '" class="reel-img">';

      sym.getBoundingClientRect();
      sym.style.transition = 'transform 0.25s cubic-bezier(0.22,1,0.36,1), opacity 0.18s ease';
      sym.style.transform  = 'translateY(0)';
      sym.style.opacity    = '1';
    }, delay);
  });

  setTimeout(() => {
    const key      = results[0] + results[1] + results[2];
    const allMatch = results[0] === results[1] && results[1] === results[2];
    const twoMatch = results[0] === results[1] || results[1] === results[2] || results[0] === results[2];

    let payout    = 0;
    let msg       = '';
    let isJackpot = false;

    if (PAYTABLE[key]) {
      payout    = SPIN_COST * PAYTABLE[key];
      msg       = `Jackpot! +${payout.toLocaleString()} coins`;
      isJackpot = true;
      resultEl.className = 'slots-result slots-result--win';
      soundJackpot();
      const machine = document.querySelector('.slots-machine');
      machine.classList.add('win-flash');
      setTimeout(() => machine.classList.remove('win-flash'), 1800);
    } else if (twoMatch && !allMatch) {
      payout = SPIN_COST;
      msg    = `Two match! +${payout.toLocaleString()} coins`;
      resultEl.className = 'slots-result slots-result--win';
      soundBonus();
    } else {
      msg = 'No match · Try again';
      resultEl.className = 'slots-result slots-result--lose';
      soundLose();
    }

    resultEl.textContent = msg;

    if (payout > 0) {
      state.balance  += payout;
      state.totalWon += payout;
      saveState(state);
      refreshUI();
      animateCoin();
    }

    const cooldown = isJackpot ? 2000 : 0;
    setTimeout(() => {
      spinning         = false;
      spinBtn.disabled = false;
      updateBetUI();
    }, cooldown);

  }, 1400);
}

export function initSlots() {
  loadSpinSound();

  const muteBtn = document.getElementById('slotsMuteBtn');
  if (muteBtn) muteBtn.addEventListener('click', () => setMuted(!isMuted()));

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