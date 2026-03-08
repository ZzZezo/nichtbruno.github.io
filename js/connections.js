export function drawConnections(pairs = []) {
  const svg    = document.getElementById('connections');
  const canvas = document.getElementById('canvas');
  if (!svg || !canvas) return;

  svg.setAttribute('width',  canvas.scrollWidth);
  svg.setAttribute('height', canvas.scrollHeight);
  svg.innerHTML = '';

  const cRect = canvas.getBoundingClientRect();

  /* Optional hub shorthand */
  const hub   = document.getElementById('hub');
  const hubCenter = hub ? (() => {
    const r = hub.getBoundingClientRect();
    return { x: r.left - cRect.left + r.width / 2, y: r.top - cRect.top + r.height / 2 };
  })() : null;

  function centerOf(id) {
    if (id === 'hub') return hubCenter;
    const el = document.getElementById(id);
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { x: r.left - cRect.left + r.width / 2, y: r.top - cRect.top + r.height / 2 };
  }

  pairs.forEach(([a, b]) => {
    const from = centerOf(a);
    const to   = centerOf(b);
    if (!from || !to) return;

    const dx = to.x - from.x;

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d',
      `M${from.x} ${from.y} C${from.x + dx * .4} ${from.y},${from.x + dx * .6} ${to.y},${to.x} ${to.y}`
    );

    /* Colour the line based on the source node tier */
    const srcEl  = document.getElementById(a);
    const tier   = srcEl ? [...srcEl.classList].find(c =>
      ['seedling','sapling','evergreen','project','gold','sky','rose','slate','lavender','moss'].includes(c)
    ) : null;

    const strokeMap = {
      seedling:  '#a09880', sapling:  '#4a8a60', evergreen:'#1b4332',
      project:   '#a0521f', gold:     '#a07820', sky:      '#2d7aac',
      rose:      '#b03060', slate:    '#5a6a7a', lavender: '#7040b0',
      moss:      '#6a8a20',
    };

    path.setAttribute('stroke',           strokeMap[tier] ?? '#a09880');
    path.setAttribute('stroke-width',     '1.5');
    path.setAttribute('stroke-dasharray', '5,4');
    path.setAttribute('fill',             'none');
    path.setAttribute('opacity',          '0.45');
    svg.appendChild(path);
  });
}