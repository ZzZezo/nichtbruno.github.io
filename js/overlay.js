export function initOverlay() {

  function applyDark(on) {
    document.documentElement.classList.toggle('dark', !!on);
    localStorage.setItem('darkMode', on ? '1' : '0');
  }
  applyDark(localStorage.getItem('darkMode') === '1');

  const DB_NAME  = 'holymoly';
  const DB_STORE = 'settings';
  const BG_KEY   = 'bgImage';
  let db = null;

  function openDB() {
    return new Promise((res, rej) => {
      const r = indexedDB.open(DB_NAME, 1);
      r.onupgradeneeded = e => e.target.result.createObjectStore(DB_STORE);
      r.onsuccess = e => res(e.target.result);
      r.onerror   = e => rej(e);
    });
  }

  async function saveBg(blob) {
    try {
      if (!db) db = await openDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).put(blob, BG_KEY);
    } catch(e) { console.warn('bg save:', e); }
  }

  async function loadBg() {
    try {
      if (!db) db = await openDB();
      return await new Promise((res, rej) => {
        const tx  = db.transaction(DB_STORE, 'readonly');
        const req = tx.objectStore(DB_STORE).get(BG_KEY);
        req.onsuccess = e => res(e.target.result ?? null);
        req.onerror   = rej;
      });
    } catch(e) { return null; }
  }

  function applyBg(blobOrUrl) {
    if (!blobOrUrl) return;
    const url = typeof blobOrUrl === 'string'
      ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const cvs = document.getElementById('canvas');
    if (cvs) {
      cvs.style.backgroundImage    = `url(${url})`;
      cvs.style.backgroundSize     = 'cover';
      cvs.style.backgroundPosition = 'center';
    }
  }

  async function clearBg() {
    const cvs = document.getElementById('canvas');
    if (cvs) cvs.style.backgroundImage = '';
    try {
      if (!db) db = await openDB();
      const tx = db.transaction(DB_STORE, 'readwrite');
      tx.objectStore(DB_STORE).delete(BG_KEY);
    } catch(e) { console.warn('bg clear:', e); }
  }

  loadBg().then(blob => { if (blob) applyBg(blob); });

  const bgInput = document.getElementById('bgFileInput');
  bgInput?.addEventListener('change', () => {
    const file = bgInput.files[0];
    if (!file) return;
    applyBg(file);
    saveBg(file);
  });

  const overlay   = document.getElementById('pageOverlay');
  const pageInner = document.getElementById('pageInner');
  const pageFrame = document.getElementById('pageFrame');
  const backdrop  = document.getElementById('backdrop');
  const closeBtn  = document.getElementById('closeBtn');
  let isOpen = false;

  function openOverlay(node) {
    if (isOpen) return;
    isOpen = true;
    const rect = node.getBoundingClientRect();
    Object.assign(pageInner.style, {
      transition: 'none',
      left: rect.left + 'px', top: rect.top + 'px',
      width: rect.width + 'px', height: rect.height + 'px',
      borderRadius: '10px', opacity: '1',
    });
    if (pageFrame) pageFrame.src = node.dataset.page;
    overlay.style.pointerEvents = 'all';
    backdrop.classList.add('page-backdrop--visible');
    closeBtn.classList.add('page-close--visible');
    requestAnimationFrame(() => requestAnimationFrame(() => {
      Object.assign(pageInner.style, {
        transition: 'all .55s cubic-bezier(.16,1,.3,1)',
        left: '0', top: '0', width: '100vw', height: '100vh', borderRadius: '0',
      });
    }));
  }

  function closeOverlay() {
    if (!isOpen) return;
    Object.assign(pageInner.style, {
      transition: 'all .38s cubic-bezier(.7,0,.84,0)',
      opacity: '0', transform: 'scale(.92)',
    });
    backdrop.classList.remove('page-backdrop--visible');
    closeBtn.classList.remove('page-close--visible');
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      if (pageFrame) pageFrame.src = 'about:blank';
      Object.assign(pageInner.style, { transition: 'none', opacity: '', transform: '' });
      isOpen = false;
    }, 400);
  }

  closeBtn?.addEventListener('click', closeOverlay);
  backdrop?.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeOverlay();
    if (e.key === 'r' || e.key === 'R') {
      // Only reset if no input/text element is focused
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      localStorage.removeItem(POS_KEY);
      centerNodes();
    }
  });

  const POS_KEY = 'nodePositions_v2';
  function loadPos() { try { return JSON.parse(localStorage.getItem(POS_KEY)) ?? {}; } catch { return {}; } }
  function savePos(map) { localStorage.setItem(POS_KEY, JSON.stringify(map)); }

  const saved = loadPos();

  const DEFAULTS = {
    'btn-darkmode': { x: 18,  y: 18 },
    'btn-bgpicker': { x: 62,  y: 18 },
    'btn-bgclear':  { x: 106, y: 18 },
    'site-label':   { x: null, y: 18 },
  };

  function placeElement(el) {
    const d = DEFAULTS[el.id];
    if (!d) return;
    if (d.x === null) {
      requestAnimationFrame(() => {
        el.style.right  = '18px';
        el.style.top    = d.y + 'px';
        el.style.left   = 'auto';
        el.style.bottom = 'auto';
      });
    } else {
      el.style.left   = d.x + 'px';
      el.style.top    = d.y + 'px';
      el.style.right  = 'auto';
      el.style.bottom = 'auto';
    }
  }

  function placeNode(el, x, y) {
    if (saved[el.id]) {
      el.style.left   = saved[el.id].x + 'px';
      el.style.top    = saved[el.id].y + 'px';
      el.style.right  = 'auto';
      el.style.bottom = 'auto';
    } else {
      el.style.left   = x + 'px';
      el.style.top    = y + 'px';
      el.style.right  = 'auto';
      el.style.bottom = 'auto';
    }
  }

  function centerNodes() {
    document.querySelectorAll('.toolbar-item, .site-label').forEach(placeElement);

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cx = vw / 2;

    // Node element sizes (icon + label height, icon width)
    const BIG_W = 116,  BIG_H  = 130;
    const MED_W = 84,   MED_H  = 96;
    const SML_W = 62,   SML_H  = 70;
    const GAP   = 24;
    const ROW_GAP = 30;

    // Total height of the three-row layout
    const totalH = SML_H + ROW_GAP + BIG_H + ROW_GAP + MED_H;
    const rowTop = (vh - totalH) / 2;

    // Row 1: small nodes (n-arcade5, n-arcade6, n-arcade7, n-img3)
    const smallIds = ['n-arcade5', 'n-arcade6', 'n-arcade7', 'n-img3', 'n-arcade8'];
    const smallRowW = smallIds.length * SML_W + (smallIds.length - 1) * GAP;
    const smallStartX = cx - smallRowW / 2;
    const smallY = rowTop;
    smallIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) placeNode(el, smallStartX + i * (SML_W + GAP), smallY);
    });

    // Row 2: big node (n-arcade2)
    const bigY = rowTop + SML_H + ROW_GAP;
    const bigEl = document.getElementById('n-arcade2');
    if (bigEl) placeNode(bigEl, cx - BIG_W / 2, bigY);

    // Row 3: medium nodes (n-arcade3, n-arcade4, n-arcade1)
    const medIds = ['n-arcade3', 'n-arcade4', 'n-arcade1'];
    const medRowW = medIds.length * MED_W + (medIds.length - 1) * GAP;
    const medStartX = cx - medRowW / 2;
    const medY = rowTop + SML_H + ROW_GAP + BIG_H + ROW_GAP;
    medIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (el) placeNode(el, medStartX + i * (MED_W + GAP), medY);
    });
  }

  window.addEventListener('load', centerNodes);

  const drag = {
    el: null,
    startX: 0, startY: 0,
    origLeft: 0, origTop: 0,
    moved: false,
  };

  function getXY(e) {
    return e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX,            y: e.clientY            };
  }

  function onDragStart(e) {
    const el = e.currentTarget;
    if (e.button && e.button !== 0) return;
    if (e.target.closest('a, button, input, select')) return;

    const { x, y }  = getXY(e);
    const rect       = el.getBoundingClientRect();
    const parentRect = el.parentElement.getBoundingClientRect();

    drag.el       = el;
    drag.startX   = x;
    drag.startY   = y;
    drag.origLeft = rect.left - parentRect.left;
    drag.origTop  = rect.top  - parentRect.top;
    drag.moved    = false;

    el.style.transition = 'none';
    el.style.zIndex     = '500';

    if (e.type === 'mousedown') e.preventDefault();
  }

  function onDragMove(e) {
    if (!drag.el) return;
    const { x, y } = getXY(e);
    const dx = x - drag.startX;
    const dy = y - drag.startY;

    if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    drag.moved = true;
    if (e.cancelable) e.preventDefault();

    if (drag.el.style.right !== 'auto') {
      drag.el.style.right = 'auto';
      drag.el.style.left  = drag.origLeft + 'px';
      drag.el.style.top   = drag.origTop  + 'px';
    }

    drag.el.style.left = Math.max(0, drag.origLeft + dx) + 'px';
    drag.el.style.top  = Math.max(0, drag.origTop  + dy) + 'px';
  }

  function onDragEnd() {
    if (!drag.el) return;
    const el       = drag.el;
    const wasMoved = drag.moved;

    el.style.zIndex     = '';
    el.style.transition = '';
    drag.el = null;

    const isUI = el.classList.contains('toolbar-item') || el.classList.contains('site-label');
    if (wasMoved && el.id && !isUI) {
      const pos = loadPos();
      pos[el.id] = { x: parseFloat(el.style.left), y: parseFloat(el.style.top) };
      savePos(pos);
    }

    el._wasDragged = wasMoved;
  }

  document.querySelectorAll('.node, .toolbar-item, .site-label').forEach(el => {
    el.addEventListener('mousedown',  onDragStart);
    el.addEventListener('touchstart', onDragStart, { passive: true });
  });

  document.addEventListener('mousemove',  onDragMove);
  document.addEventListener('touchmove',  onDragMove, { passive: false });
  document.addEventListener('mouseup',    onDragEnd);
  document.addEventListener('touchend',   onDragEnd);

  document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('click', () => {
      if (node._wasDragged) { node._wasDragged = false; return; }
      if (node.classList.contains('node--disabled')) return;
      if (node.dataset.page) {
        if (node.dataset.page.startsWith('http')) {
          window.open(node.dataset.page, '_blank');
        } else {
          window.location.href = node.dataset.page;
        }
      }
    });
  });
}