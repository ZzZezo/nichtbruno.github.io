(function () {
  const STORAGE_KEY = 'holymoly_perf_tier';
  const TIERS = ['low', 'mid', 'high'];

  function cores() {
    return navigator.hardwareConcurrency || 2;
  }

  function benchmark() {
    const t0 = performance.now();
    let x = 0;
    for (let i = 0; i < 200_000; i++) x += Math.sqrt(i) * Math.sin(i);
    void x;
    return performance.now() - t0;
  }

  function detect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';
    const c = cores();
    if (c <= 2) return 'low';
    const dt = benchmark();
    if (dt > 18) return 'low';
    if (dt > 7)  return 'mid';
    return 'high';
  }

  function applyTier(tier) {
    document.documentElement.setAttribute('data-perf', tier);
    document.documentElement.style.setProperty('--perf-tier', `"${tier}"`);
  }

  function renderBadge(tier) {
    let currentTier = tier;

    function insert() {
      const badge = document.createElement('div');
      badge.id = 'perf-badge';
      badge.setAttribute('aria-hidden', 'true');
      badge.style.cssText = [
        'position:fixed',
        'bottom:10px',
        'left:10px',
        'z-index:9999',
        'font-family:monospace',
        'font-size:9px',
        'letter-spacing:.12em',
        'text-transform:uppercase',
        'padding:2px 6px',
        'border-radius:4px',
        'opacity:.55',
        'background:rgba(0,0,0,.35)',
        'color:#fff',
        'backdrop-filter:blur(4px)',
        'cursor:grab',
        'user-select:none',
        '-webkit-user-select:none',
      ].join(';');
      badge.textContent = `gfx · ${currentTier}`;
      document.body.appendChild(badge);

      badge.addEventListener('click', () => {
        if (badge._wasDragged) { badge._wasDragged = false; return; }
        const idx = TIERS.indexOf(currentTier);
        currentTier = TIERS[(idx + 1) % TIERS.length];
        badge.textContent = `gfx · ${currentTier}`;
        applyTier(currentTier);
        try { localStorage.setItem(STORAGE_KEY, currentTier); } catch (_) {}
      });

      const drag = { active: false, startX: 0, startY: 0, origLeft: 0, origTop: 0, moved: false };

      badge.addEventListener('mousedown', e => {
        if (e.button !== 0) return;
        e.preventDefault();
        const rect = badge.getBoundingClientRect();
        drag.active  = true;
        drag.moved   = false;
        drag.startX  = e.clientX;
        drag.startY  = e.clientY;
        drag.origLeft = rect.left;
        drag.origTop  = rect.top;
        badge.style.cursor = 'grabbing';
        badge.style.right  = 'auto';
        badge.style.bottom = 'auto';
        badge.style.left   = rect.left + 'px';
        badge.style.top    = rect.top  + 'px';
      });

      document.addEventListener('mousemove', e => {
        if (!drag.active) return;
        const dx = e.clientX - drag.startX;
        const dy = e.clientY - drag.startY;
        if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        drag.moved = true;
        badge.style.left = Math.max(0, drag.origLeft + dx) + 'px';
        badge.style.top  = Math.max(0, drag.origTop  + dy) + 'px';
      });

      document.addEventListener('mouseup', () => {
        if (!drag.active) return;
        drag.active = false;
        badge.style.cursor = 'grab';
        badge._wasDragged = drag.moved;
      });

      // Touch support
      badge.addEventListener('touchstart', e => {
        const t = e.touches[0];
        const rect = badge.getBoundingClientRect();
        drag.active  = true;
        drag.moved   = false;
        drag.startX  = t.clientX;
        drag.startY  = t.clientY;
        drag.origLeft = rect.left;
        drag.origTop  = rect.top;
        badge.style.right  = 'auto';
        badge.style.bottom = 'auto';
        badge.style.left   = rect.left + 'px';
        badge.style.top    = rect.top  + 'px';
      }, { passive: true });

      document.addEventListener('touchmove', e => {
        if (!drag.active) return;
        const t = e.touches[0];
        const dx = t.clientX - drag.startX;
        const dy = t.clientY - drag.startY;
        if (!drag.moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
        drag.moved = true;
        if (e.cancelable) e.preventDefault();
        badge.style.left = Math.max(0, drag.origLeft + dx) + 'px';
        badge.style.top  = Math.max(0, drag.origTop  + dy) + 'px';
      }, { passive: false });

      document.addEventListener('touchend', () => {
        if (!drag.active) return;
        drag.active = false;
        badge._wasDragged = drag.moved;
      });
    }

    if (document.body) {
      insert();
    } else {
      document.addEventListener('DOMContentLoaded', insert, { once: true });
    }
  }

  let tier = null;
  try {
    tier = localStorage.getItem(STORAGE_KEY);
  } catch (_) {}

  if (!tier) {
    tier = detect();
    try { localStorage.setItem(STORAGE_KEY, tier); } catch (_) {}
  }

  applyTier(tier);

  // Only mount the draggable badge on the root page
  const isRoot = location.pathname === '/' ||
    (location.pathname.endsWith('/index.html') && location.pathname.split('/').filter(Boolean).length <= 1);
  if (isRoot) renderBadge(tier);
})();