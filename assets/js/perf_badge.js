(function () {
  const STORAGE_KEY = 'holymoly_perf_tier';
  const TIERS = ['low', 'mid', 'high'];

  // Read tier set by the main page (or fall back to detection)
  function detect() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return 'low';
    const cores = navigator.hardwareConcurrency || 2;
    if (cores <= 2) return 'low';
    const t0 = performance.now();
    let x = 0;
    for (let i = 0; i < 200_000; i++) x += Math.sqrt(i) * Math.sin(i);
    void x;
    const dt = performance.now() - t0;
    if (dt > 18) return 'low';
    if (dt > 7)  return 'mid';
    return 'high';
  }

  let tier;
  try { tier = sessionStorage.getItem(STORAGE_KEY); } catch (_) {}
  if (!tier) {
    tier = detect();
    try { sessionStorage.setItem(STORAGE_KEY, tier); } catch (_) {}
  }

  // Apply to <html> so CSS [data-perf] selectors work
  document.documentElement.setAttribute('data-perf', tier);

  // Badge
  function mountBadge() {
    let currentTier = tier;

    const badge = document.createElement('div');
    badge.id = 'perf-badge';
    badge.setAttribute('aria-hidden', 'true');
    badge.style.cssText = [
      'position:fixed', 'bottom:10px', 'left:10px', 'z-index:9999',
      'font-family:monospace', 'font-size:9px', 'letter-spacing:.12em',
      'text-transform:uppercase', 'padding:2px 6px', 'border-radius:4px',
      'opacity:.55', 'background:rgba(0,0,0,.35)', 'color:#fff',
      'backdrop-filter:blur(4px)', 'cursor:grab',
      'user-select:none', '-webkit-user-select:none',
    ].join(';');
    badge.textContent = `gfx · ${currentTier}`;
    document.body.appendChild(badge);

    // Click → cycle tier
    badge.addEventListener('click', () => {
      if (badge._wasDragged) { badge._wasDragged = false; return; }
      const idx = TIERS.indexOf(currentTier);
      currentTier = TIERS[(idx + 1) % TIERS.length];
      badge.textContent = `gfx · ${currentTier}`;
      document.documentElement.setAttribute('data-perf', currentTier);
      try { sessionStorage.setItem(STORAGE_KEY, currentTier); } catch (_) {}
    });

    // Drag (no position save)
    const drag = { active: false, startX: 0, startY: 0, origLeft: 0, origTop: 0, moved: false };

    badge.addEventListener('mousedown', e => {
      if (e.button !== 0) return;
      e.preventDefault();
      const rect = badge.getBoundingClientRect();
      Object.assign(drag, { active: true, moved: false, startX: e.clientX, startY: e.clientY, origLeft: rect.left, origTop: rect.top });
      badge.style.cursor = 'grabbing';
      badge.style.right = 'auto'; badge.style.bottom = 'auto';
      badge.style.left = rect.left + 'px'; badge.style.top = rect.top + 'px';
    });
    document.addEventListener('mousemove', e => {
      if (!drag.active) return;
      const dx = e.clientX - drag.startX, dy = e.clientY - drag.startY;
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

    // Touch
    badge.addEventListener('touchstart', e => {
      const t = e.touches[0], rect = badge.getBoundingClientRect();
      Object.assign(drag, { active: true, moved: false, startX: t.clientX, startY: t.clientY, origLeft: rect.left, origTop: rect.top });
      badge.style.right = 'auto'; badge.style.bottom = 'auto';
      badge.style.left = rect.left + 'px'; badge.style.top = rect.top + 'px';
    }, { passive: true });
    document.addEventListener('touchmove', e => {
      if (!drag.active) return;
      const t = e.touches[0], dx = t.clientX - drag.startX, dy = t.clientY - drag.startY;
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

  if (document.body) mountBadge();
  else document.addEventListener('DOMContentLoaded', mountBadge, { once: true });
})();