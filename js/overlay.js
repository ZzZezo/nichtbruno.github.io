export function initOverlay() {
  function applyDark(on) {
    document.documentElement.classList.toggle('dark', !!on);
    localStorage.setItem('darkMode', on ? '1' : '0');
  }
  applyDark(localStorage.getItem('darkMode') === '1');

  const DB_NAME  = 'holymoly';
  const DB_STORE = 'settings';
  const BG_KEY   = 'bgImage';
  let   db       = null;

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
    const url  = typeof blobOrUrl === 'string'
      ? blobOrUrl : URL.createObjectURL(blobOrUrl);
    const cvs  = document.getElementById('canvas');
    if (cvs) {
      cvs.style.backgroundImage    = `url(${url})`;
      cvs.style.backgroundSize     = 'cover';
      cvs.style.backgroundPosition = 'center';
    }
  }

  // New function to clear background
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
      transition:   'none',
      left:         rect.left   + 'px',
      top:          rect.top    + 'px',
      width:        rect.width  + 'px',
      height:       rect.height + 'px',
      borderRadius: '10px',
      opacity:      '1',
    });
    pageFrame.src               = node.dataset.page;
    overlay.style.pointerEvents = 'all';
    backdrop.classList.add('page-backdrop--visible');
    closeBtn.classList.add('page-close--visible');

    requestAnimationFrame(() => requestAnimationFrame(() => {
      Object.assign(pageInner.style, {
        transition:   'all .55s cubic-bezier(.16,1,.3,1)',
        left:         '0', top:    '0',
        width:        '100vw', height: '100vh',
        borderRadius: '0',
      });
    }));
  }

  function closeOverlay() {
    if (!isOpen) return;
    Object.assign(pageInner.style, {
      transition: 'all .38s cubic-bezier(.7,0,.84,0)',
      opacity:    '0',
      transform:  'scale(.92)',
    });
    backdrop.classList.remove('page-backdrop--visible');
    closeBtn.classList.remove('page-close--visible');
    overlay.style.pointerEvents = 'none';
    setTimeout(() => {
      pageFrame.src = 'about:blank';
      Object.assign(pageInner.style, { transition:'none', opacity:'', transform:'' });
      isOpen = false;
    }, 400);
  }

  closeBtn.addEventListener('click', closeOverlay);
  backdrop.addEventListener('click', closeOverlay);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeOverlay(); });

  const POS_KEY = 'nodePositions';

  function loadPos()       { try { return JSON.parse(localStorage.getItem(POS_KEY)) ?? {}; } catch { return {}; } }
  function savePos(map)    { localStorage.setItem(POS_KEY, JSON.stringify(map)); }

  const saved = loadPos();
  document.querySelectorAll('.node').forEach(node => {
  if (node.classList.contains('node--darkmode') ||
      node.classList.contains('node--bgpicker') ||
      node.classList.contains('node--bgclear') ||
      node.id === 'n-welcome') {
    return;
  }
  if (node.id && saved[node.id]) {
    node.style.left   = saved[node.id].x + 'px';
    node.style.top    = saved[node.id].y + 'px';
    node.style.right  = 'auto';
    node.style.bottom = 'auto';
  }
});

  const drag = {
    node:     null,
    startX:   0, startY:   0,
    origLeft: 0, origTop:  0,
    moved:    false,
  };

  function getXY(e) {
    return e.touches
      ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
      : { x: e.clientX,            y: e.clientY            };
  }

  function onDragStart(e) {
    const node   = e.currentTarget;
    if (e.button && e.button !== 0) return;
    if (e.target.closest('a, button, input, select')) return;

    const { x, y }  = getXY(e);
    const rect       = node.getBoundingClientRect();
    const parentRect = node.parentElement.getBoundingClientRect();

    drag.node     = node;
    drag.startX   = x;
    drag.startY   = y;
    drag.origLeft = rect.left - parentRect.left;
    drag.origTop  = rect.top  - parentRect.top;
    drag.moved    = false;

    node.style.transition = 'none';
    node.style.zIndex     = '50';

    if (e.type === 'mousedown') e.preventDefault();
  }

  function onDragMove(e) {
    if (!drag.node) return;
    const { x, y } = getXY(e);
    const dx = x - drag.startX;
    const dy = y - drag.startY;

    if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    drag.moved = true;

    if (e.cancelable) e.preventDefault();

    const newLeft = Math.max(0, drag.origLeft + dx);
    const newTop  = Math.max(0, drag.origTop  + dy);

    drag.node.style.left   = newLeft + 'px';
    drag.node.style.top    = newTop  + 'px';
    drag.node.style.right  = 'auto';
    drag.node.style.bottom = 'auto';

    window.__redrawConnections?.();
  }

  function onDragEnd() {
    if (!drag.node) return;
    const node    = drag.node;
    const wasMoved = drag.moved;

    node.style.zIndex     = '';
    node.style.transition = '';
    drag.node = null;

    if (wasMoved && node.id &&
        !node.classList.contains('node--darkmode') &&
        !node.classList.contains('node--bgpicker') &&
        !node.classList.contains('node--bgclear') &&
        node.id !== 'n-welcome') {
      const pos = loadPos();
      pos[node.id] = { x: parseFloat(node.style.left), y: parseFloat(node.style.top) };
      savePos(pos);
    }

    node._wasDragged = wasMoved;
  }

  document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('mousedown',  onDragStart);
    node.addEventListener('touchstart', onDragStart, { passive: true });
  });

  document.addEventListener('mousemove',  onDragMove);
  document.addEventListener('touchmove',  onDragMove, { passive: false });
  document.addEventListener('mouseup',    onDragEnd);
  document.addEventListener('touchend',   onDragEnd);

  document.querySelectorAll('.node').forEach(node => {
    node.addEventListener('click', () => {
      if (node._wasDragged) { node._wasDragged = false; return; }
      if (node.classList.contains('node--disabled')) return;

      // Theme toggle
      if (node.classList.contains('node--darkmode')) {
        applyDark(!document.documentElement.classList.contains('dark'));
        return;
      }
      // Background picker
      if (node.classList.contains('node--bgpicker')) {
        bgInput?.click();
        return;
      }
      // New clear background button
      if (node.classList.contains('node--bgclear')) {
        clearBg();
        return;
      }

      // Direct navigation for nodes with data-page
      if (node.dataset.page) {
        window.location.href = node.dataset.page;
        return;
      }
    });
  });
}