(function () {
  const STORAGE_KEY = 'holymoly_perf_tier';

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
        'pointer-events:none',
        'opacity:.55',
        'background:rgba(0,0,0,.35)',
        'color:#fff',
        'backdrop-filter:blur(4px)',
      ].join(';');
      badge.textContent = `gfx · ${tier}`;
      document.body.appendChild(badge);
    }

    if (document.body) {
      insert();
    } else {
      document.addEventListener('DOMContentLoaded', insert, { once: true });
    }
  }

  let tier = null;
  try {
    tier = sessionStorage.getItem(STORAGE_KEY);
  } catch (_) {}

  if (!tier) {
    tier = detect();
    try { sessionStorage.setItem(STORAGE_KEY, tier); } catch (_) {}
  }

  applyTier(tier);
  renderBadge(tier);
})();