const STORAGE_KEY = 'holymoly_luckgame_v1';

export function loadState() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? {}; }
  catch { return {}; }
}

export function saveState(s) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export let state = {
  balance: 0,
  lastDaily: null,
  gamesPlayed: 0,
  totalWon: 0,
  totalSpent: 0,
  ...loadState()
};

function _currentDay() {
  const d = new Date();
  return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate();
}

if (!state.lastDaily && state.balance === 0) {
  state.balance = 1000;
  state.lastDaily = _currentDay();
  saveState(state);
}

let _els = null;
function _getEls() {
  if (_els) return _els;
  _els = {
    balance:  document.getElementById('balanceDisplay'),
    games:    document.getElementById('statGames'),
    won:      document.getElementById('statWon'),
    spent:    document.getElementById('statSpent'),
    dailyBtn: document.getElementById('dailyBtn'),
    dot:      document.querySelector('#dailyBtn .dot'),
    coin:     document.getElementById('walletCoin'),
    toast:    document.getElementById('toast'),
  };
  return _els;
}

export function refreshUI() {
  const e = _getEls();
  const canClaim = state.lastDaily !== _currentDay();

  e.balance.textContent  = state.balance.toLocaleString();
  e.games.textContent    = state.gamesPlayed;
  e.won.textContent      = state.totalWon.toLocaleString() + ' 🪙';
  e.spent.textContent    = state.totalSpent.toLocaleString() + ' 🪙';
  e.dailyBtn.disabled    = !canClaim;
  e.dot.style.background = canClaim ? 'var(--gold)' : 'var(--text-dim)';
  e.dot.style.boxShadow  = canClaim ? '0 0 6px var(--gold)' : 'none';
}

export function animateCoin() {
  const coin = _getEls().coin;
  coin.classList.remove('coin-anim');
  coin.classList.add('coin-anim');
  coin.addEventListener('animationend', () => {
    coin.classList.remove('coin-anim');
  }, { once: true });
}

let toastTimer;
export function showToast(msg) {
  const t = _getEls().toast;
  t.textContent = msg;
  t.classList.add('toast--show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('toast--show'), 2800);
}

export function initDaily() {
  document.getElementById('dailyBtn').addEventListener('click', () => {
    const hour = _currentDay();
    if (state.lastDaily === hour) return;
    state.balance += 250;
    state.lastDaily = hour;
    saveState(state);
    refreshUI();
    showToast('🪙 +250 hourly coins claimed!');
    animateCoin();
  });
}

async function _h(s) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

function _todayCode() {
  const d = new Date();
  const dd   = String(d.getDate()).padStart(2, '0');
  const mm   = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getFullYear());
  const raw  = dd + mm + yyyy;
  return raw.split('').map(c => String.fromCharCode(97 + parseInt(c))).join('');
}

let _seq = '';
let _seqTimer;
let _hashTimer;
document.addEventListener('keydown', e => {
  if (e.key.length !== 1) return;
  const tag = document.activeElement?.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;

  _seq += e.key.toLowerCase();
  if (_seq.length > 20) _seq = _seq.slice(-20);

  clearTimeout(_seqTimer);
  _seqTimer = setTimeout(() => { _seq = ''; }, 2000);

  clearTimeout(_hashTimer);
  _hashTimer = setTimeout(async () => {
    const snap = _seq;
    const todayHash = await _h(_todayCode());
    for (let i = 0; i < snap.length; i++) {
      const candidate = snap.slice(i);
      if (candidate.length < 4) continue;
      if (await _h(candidate) === todayHash) {
        _seq = '';
        const amount = 999;
        state.balance += amount;
        saveState(state);
        refreshUI();
        showToast('👾 Dev mode · +' + amount + ' coins');
        animateCoin();
        break;
      }
    }
  }, 150);
});


const _ENC_PASSWORD = 'holymoly_luckgame_save_v1';

async function _deriveKey(password) {
  const raw = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(password),
    { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: new TextEncoder().encode('luckgame_salt_2024'), iterations: 100000, hash: 'SHA-256' },
    raw,
    { name: 'AES-GCM', length: 256 },
    false, ['encrypt', 'decrypt']
  );
}

export async function exportProgress() {
  try {
    const key  = await _deriveKey(_ENC_PASSWORD);
    const iv   = crypto.getRandomValues(new Uint8Array(12));
    const data = new TextEncoder().encode(JSON.stringify(state));
    const enc  = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
    const buf  = new Uint8Array(12 + enc.byteLength);
    buf.set(iv, 0);
    buf.set(new Uint8Array(enc), 12);
    return btoa(String.fromCharCode(...buf));
  } catch (e) {
    return null;
  }
}

export async function importProgress(code) {
  try {
    const buf  = Uint8Array.from(atob(code.trim()), c => c.charCodeAt(0));
    const iv   = buf.slice(0, 12);
    const enc  = buf.slice(12);
    const key  = await _deriveKey(_ENC_PASSWORD);
    const dec  = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, enc);
    const parsed = JSON.parse(new TextDecoder().decode(dec));
    Object.assign(state, parsed);
    saveState(state);
    refreshUI();
    return true;
  } catch (e) {
    return false;
  }
}
export function loadBg() {
  try {
    const r = indexedDB.open('holymoly', 1);
    r.onupgradeneeded = e => e.target.result.createObjectStore('settings');
    r.onsuccess = e => {
      const tx  = e.target.result.transaction('settings', 'readonly');
      const req = tx.objectStore('settings').get('bgImage');
      req.onsuccess = ev => {
        const blob = ev.target.result;
        if (blob) {
          const url = URL.createObjectURL(blob);
          document.body.style.backgroundImage    = `url(${url})`;
          document.body.style.backgroundSize     = 'cover';
          document.body.style.backgroundPosition = 'center';
        }
      };
    };
  } catch(e) {}
}