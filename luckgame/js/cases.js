import { state, saveState, refreshUI, showToast, animateCoin } from './state.js';

export const RARITIES = {
  common:     { label: 'Common',     color: '#9ea8b3', glow: 'rgba(158,168,179,0.45)', border: '#9ea8b3' },
  uncommon:   { label: 'Uncommon',   color: '#4caf51', glow: 'rgba(76, 175, 101, 0.45)',  border: '#4caf51' },
  rare:       { label: 'Rare',       color: '#5b9bf5', glow: 'rgba(91,155,245,0.45)',  border: '#5b9bf5' },
  epic:       { label: 'Epic',       color: '#9d50eb', glow: 'rgba(176,106,245,0.45)', border: '#9d50eb' },
  legendary:  { label: 'Legendary',  color: '#f7e350', glow: 'rgba(245,197,66,0.55)',  border: '#f7e350' },
  mystic:  { label: 'Mystic',  color: '#f54242', glow: 'rgba(240, 83, 83, 0.55)',  border: '#f54242' },
};

const ALL_ITEMS = [
  { id: 'c1', name: 'Axe',         rarity: 'common',    value: 1,    img: 'axe.png'        },
  { id: 'c2', name: 'Nut',         rarity: 'common',    value: 5,   img: 'nut.png'        },
  { id: 'c3', name: 'Tree',        rarity: 'common',    value: 8,   img: 'tree.png'       },
  { id: 'c4', name: 'Ball',        rarity: 'common',    value: 12,   img: 'ball.png'       },
  
  { id: 'u1', name: 'Car',         rarity: 'uncommon',  value: 60,   img: 'cat.png'        },
  { id: 'u2', name: 'Gun',         rarity: 'uncommon',  value: 55,   img: 'gun.png'        },
  { id: 'u3', name: 'Table',       rarity: 'uncommon',  value: 67,   img: 'table.png'      },
  
  { id: 'r1', name: 'Magic',       rarity: 'rare',      value: 115,  img: 'magic.png'      },
  { id: 'r2', name: 'Knife',       rarity: 'rare',      value: 101,  img: 'knife.png'      },
  { id: 'r3', name: 'Controller',  rarity: 'rare',      value: 130,  img: 'controller.png' },
  
  { id: 'e1', name: 'Doner',       rarity: 'epic',      value: 650,  img: 'doner.png'      },
  { id: 'e2', name: 'Weed',        rarity: 'epic',      value: 420,  img: 'weed.png'       },

  { id: 'l1', name: 'Cedevita',    rarity: 'legendary', value: 700,  img: 'cedevita.png'   },
  { id: 'l2', name: 'Nougat Bits', rarity: 'legendary', value: 1700, img: 'nougat.png'     },
  
  { id: 'm1', name: 'GameBoy Advance SP', rarity: 'mystic', value: 10000, img: 'gameboy.png'     },
];

export const CASES = [
  {
    id:    'backpack',
    name:  'Backpack',
    img:   'backpack.png',
    cost:  50,
    desc:  'A dusty backpack. Mostly junk, but who knows.',
    weights: { common: 60, uncommon: 26, rare: 13, legendary: 1  },
  },
  {
    id:    'dufflebag',
    name:  'Duffle Bag',
    img:   'dufflebag.png',
    cost:  200,
    desc:  'A heavy duffle bag. Could be good.',
    weights: { common: 25, uncommon: 20, rare: 33, epic: 18, legendary: 4  },
  },
  {
    id:    'safe',
    name:  'The Safe',
    img:   'safe.png',
    cost:  750,
    desc:  'A steel safe. Only the finest loot inside.',
    weights: { rare: 14, epic: 60, legendary: 25, mystic: 1 },
  },
  {
    id:    'luckyblock',
    name:  'Lucky Block',
    img:   'luckyblock.png',
    cost:  1250,
    desc:  'Stupid af.',
    weights: { common: 98, mystic: 2 },
  },
];


const CARD_STRIDE  = 120;
const STRIP_COUNT  = 56;
const WINNER_INDEX = 48;

let _activeCaseIndex = 0;
let _spinning        = false;
let _audioCtx        = null;

function getCtx() {
  if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  return _audioCtx;
}

function tone({ type = 'sine', freq, freqEnd, rampTime, gain, attack, decay, offset = 0 }) {
  const ctx = getCtx();
  const now = ctx.currentTime + offset;
  const osc = ctx.createOscillator();
  const env = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (freqEnd !== undefined && rampTime)
    osc.frequency.exponentialRampToValueAtTime(Math.max(freqEnd, 1), now + rampTime);
  env.gain.setValueAtTime(0.0001, now);
  env.gain.linearRampToValueAtTime(gain, now + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
  osc.connect(env); env.connect(ctx.destination);
  osc.start(now); osc.stop(now + attack + decay + 0.05);
}
function soundNav()   { tone({ type:'triangle', freq:520, freqEnd:420, rampTime:0.07, gain:0.15, attack:0.003, decay:0.08 }); }
function soundOpen()  { tone({ type:'triangle',   freq:300, freqEnd:180, rampTime:0.1,  gain:0.28, attack:0.01,  decay:0.15 }); }
function soundTick()  { tone({ type:'triangle', freq:440, freqEnd:220, rampTime:0.04, gain:0.28, attack:0.002, decay:0.06 }); }
function soundReveal(rarity) {
  const freqMap = { common:330, uncommon:440, rare:550, epic:660, legendary:880 };
  const f = freqMap[rarity] || 440;
  tone({ type:'triangle', freq:f,       gain:0.35, attack:0.01, decay:0.4 });
  tone({ type:'sine',     freq:f * 1.5, gain:0.18, attack:0.01, decay:0.5, offset:0.08 });
  if (rarity === 'legendary') {
    [523, 659, 784, 1047].forEach((fr, i) =>
      tone({ type:'square', freq:fr, freqEnd:fr*0.95, rampTime:0.2, gain:0.2, attack:0.01, decay:0.4, offset:i*0.1 })
    );
  }
  if (rarity === 'mystic') {
    [523, 659, 784, 1047].forEach((fr, i) =>
      tone({ type:'square', freq:fr, freqEnd:fr*0.95, rampTime:0.1, gain:0.4, attack:0.01, decay:0.4, offset:i*0.1 })
    );
  }
}

function pickItemForCase(caseData) {
  const w     = caseData.weights;
  const total = Object.values(w).reduce((a, b) => a + b, 0);
  let roll = Math.random() * total;
  let rarity = 'common';
  for (const [r, wt] of Object.entries(w)) { roll -= wt; if (roll <= 0) { rarity = r; break; } }
  const pool = ALL_ITEMS.filter(it => it.rarity === rarity);
  return pool.length ? pool[Math.floor(Math.random() * pool.length)] : ALL_ITEMS[0];
}

function imgSrc(item) { return '../assets/images/luckgame/cases/' + item.img; }

function buildCard(item, isWinner) {
  const rar = RARITIES[item.rarity];
  const div = document.createElement('div');
  div.className = 'case-reel-card' + (isWinner ? ' case-reel-card--winner' : '');
  div.style.setProperty('--rc', rar.color);
  div.style.setProperty('--rg', rar.glow);
  div.style.setProperty('--rb', rar.border);
  div.innerHTML =
    '<div class="crc-img-wrap">' +
      '<img class="crc-img" src="' + imgSrc(item) + '" alt="' + item.name + '" ' +
        'onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'">' +
      '<div class="crc-fallback" style="display:none">?</div>' +
    '</div>' +
    '<div class="crc-name">' + item.name + '</div>' +
    '<div class="crc-rarity">' + rar.label + '</div>';
  return div;
}

function spinReel(winnerItem, caseData, onDone) {
  const track     = document.getElementById('caseReelTrack');
  const container = document.getElementById('caseReelContainer');
  const overlay   = document.getElementById('caseOpeningOverlay');
  if (!track || !container || !overlay) return;

  track.innerHTML = '';
  track.style.transition = 'none';
  track.style.transform  = 'translateX(0px)';
  let winnerCardEl = null;
  for (let i = 0; i < STRIP_COUNT; i++) {
    const item = (i === WINNER_INDEX) ? winnerItem : pickItemForCase(caseData);
    const card = buildCard(item, false); // never pass isWinner=true during build
    if (i === WINNER_INDEX) winnerCardEl = card;
    track.appendChild(card);
  }

  void track.offsetWidth;

  const containerW = container.offsetWidth;
  const centerX    = containerW / 2;

  const winnerCX = WINNER_INDEX * CARD_STRIDE + CARD_STRIDE / 2;
  const jitter   = (Math.random() - 0.5) * 60;
  const finalX   = centerX - winnerCX + jitter;

  const startX = containerW + 80;

  const totalDist = startX - finalX;

  overlay.classList.add('case-opening-overlay--active');

  const SPIN_DURATION = 8000; // ms
  const startTime     = performance.now();
  let lastTickPos     = startX;
  let rafId;
  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(now) {
    const elapsed  = now - startTime;
    const progress = Math.min(elapsed / SPIN_DURATION, 1);
    const eased    = easeOutQuart(progress);
    const currentX = startX - totalDist * eased;

    track.style.transition = 'none';
    track.style.transform  = 'translateX(' + currentX + 'px)';

    if (Math.abs(currentX - lastTickPos) >= CARD_STRIDE * 0.85) {
      soundTick();
      lastTickPos = currentX;
    }

    if (progress < 1) {
      rafId = requestAnimationFrame(tick);
    } else {
      track.style.transform = 'translateX(' + finalX + 'px)';
      onSpinEnd();
    }
  }

  function onSpinEnd() {
    cancelAnimationFrame(rafId);
    if (winnerCardEl) {
      winnerCardEl.style.setProperty('--rb', RARITIES[winnerItem.rarity].border);
      winnerCardEl.classList.add('case-reel-card--winner');
      winnerCardEl.classList.add('case-reel-card--flash');
    }
    soundReveal(winnerItem.rarity);
    showResult(winnerItem, onDone);
  }

  rafId = requestAnimationFrame(tick);
}

function showResult(item, onDone) {
  const rar = RARITIES[item.rarity];
  const el  = document.getElementById('caseResultPanel');
  if (!el) return;
  el.style.setProperty('--rarity-color',  rar.color);
  el.style.setProperty('--rarity-glow',   rar.glow);
  el.style.setProperty('--rarity-border', rar.border);
  el.querySelector('.case-result__img').src            = imgSrc(item);
  el.querySelector('.case-result__img').style.opacity  = '1';
  el.querySelector('.case-result__name').textContent   = item.name;
  el.querySelector('.case-result__rarity').textContent = rar.label;
  el.querySelector('.case-result__value').textContent  = '+' + item.value.toLocaleString() + ' coins';
  el.classList.add('case-result-panel--visible');
  onDone(item);
}

function openCase(caseData) {
  if (_spinning) return;
  if (state.balance < caseData.cost) { showToast('Not enough coins!'); return; }

  soundOpen();
  _spinning = true;
  state.balance    -= caseData.cost;
  state.totalSpent += caseData.cost;
  state.gamesPlayed++;
  saveState(state);
  refreshUI();

  const winner      = pickItemForCase(caseData);
  const resultPanel = document.getElementById('caseResultPanel');
  const openBtn     = document.getElementById('caseOpenBtn');
  const reelCont    = document.getElementById('caseReelContainer');

  resultPanel.classList.remove('case-result-panel--visible');
  reelCont.classList.add('case-reel-container--spinning');
  if (openBtn) openBtn.disabled = true;

  spinReel(winner, caseData, (item) => {
    state.balance  += item.value;
    state.totalWon += item.value;
    saveState(state);
    refreshUI();
    animateCoin();
    setTimeout(() => {
      _spinning = false;
      if (openBtn) openBtn.disabled = false;
    }, 500);
  });
}

function navigateCase(dir) {
  if (_spinning) return;
  soundNav();
  _activeCaseIndex = (_activeCaseIndex + dir + CASES.length) % CASES.length;
  applyActiveCase();
}

function resetReel() {
  const track    = document.getElementById('caseReelTrack');
  const overlay  = document.getElementById('caseOpeningOverlay');
  const reelCont = document.getElementById('caseReelContainer');
  const result   = document.getElementById('caseResultPanel');
  if (track)    { track.style.transition = 'none'; track.style.transform = 'translateX(0)'; track.innerHTML = ''; }
  if (overlay)  overlay.classList.remove('case-opening-overlay--active');
  if (reelCont) reelCont.classList.remove('case-reel-container--spinning');
  if (result) {
    result.classList.remove('case-result-panel--visible');
    result.style.removeProperty('--rarity-color');
    result.style.removeProperty('--rarity-glow');
    result.style.removeProperty('--rarity-border');
    result.querySelector('.case-result__img').src           = '';
    result.querySelector('.case-result__img').style.opacity = '0';
    result.querySelector('.case-result__name').textContent  = '';
    result.querySelector('.case-result__rarity').textContent = '';
    result.querySelector('.case-result__value').textContent  = '';
  }
}

function applyActiveCase() {
  const cd = CASES[_activeCaseIndex];
  if (!cd) return;

  document.getElementById('casePrevBtn').disabled = _activeCaseIndex === 0;
  document.getElementById('caseNextBtn').disabled = _activeCaseIndex === CASES.length - 1;

  document.querySelectorAll('.case-nav-dot').forEach((d, i) =>
    d.classList.toggle('case-nav-dot--active', i === _activeCaseIndex)
  );

  document.getElementById('caseActiveName').textContent = cd.name;
  document.getElementById('caseActiveDesc').textContent = cd.desc;
  document.getElementById('caseActiveCost').textContent = cd.cost.toLocaleString() + ' coins';
  document.getElementById('caseOpenBtn').textContent    = 'Open  \u00B7  ' + cd.cost.toLocaleString() + ' coins [SPACE]';

  const img = document.getElementById('caseActiveImg');
  img.style.opacity = '0';
  img.src = '../assets/images/luckgame/cases/' + cd.img;
  img.onload  = () => { img.style.opacity = '1'; };
  img.onerror = () => { img.style.opacity = '0.25'; };

  const oddsEl = document.getElementById('caseOddsGrid');
  oddsEl.innerHTML = '';
  const total = Object.values(cd.weights).reduce((a, b) => a + b, 0);
  for (const [rar, w] of Object.entries(cd.weights)) {
    if (!w) continue;
    const pct = ((w / total) * 100).toFixed(1);
    const r   = RARITIES[rar];
    const row = document.createElement('div');
    row.className = 'case-odds-row';
    row.style.setProperty('--rarity-color', r.color);
    row.innerHTML =
      '<span class="case-odds-dot"></span>' +
      '<span class="case-odds-label">' + r.label + '</span>' +
      '<span class="case-odds-pct">' + pct + '%</span>';
    oddsEl.appendChild(row);
  }

  resetReel();
}

export function initCases() {
  const dotsEl = document.getElementById('caseNavDots');
  if (dotsEl) {
    dotsEl.innerHTML = '';
    CASES.forEach((_, i) => {
      const d = document.createElement('span');
      d.className = 'case-nav-dot' + (i === 0 ? ' case-nav-dot--active' : '');
      dotsEl.appendChild(d);
    });
  }

  document.getElementById('casePrevBtn').addEventListener('click', () => navigateCase(-1));
  document.getElementById('caseNextBtn').addEventListener('click', () => navigateCase(+1));
  document.getElementById('caseOpenBtn').addEventListener('click', () => openCase(CASES[_activeCaseIndex]));

  document.addEventListener('keydown', e => {
    if (e.code === 'Space' && document.getElementById('modal-case').classList.contains('modal-backdrop--open')) {
      e.preventDefault();
      openCase(CASES[_activeCaseIndex]);
    }
  });

  applyActiveCase();
}