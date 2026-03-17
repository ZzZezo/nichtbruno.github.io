export function detectPerf() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.dataset.perf = 'low';
    return;
  }

  const cores = navigator.hardwareConcurrency ?? 2;
  if (cores <= 2) {
    document.documentElement.dataset.perf = 'low';
    return;
  }

  const t0 = performance.now();
  let x = 0;
  for (let i = 0; i < 200_000; i++) x += Math.sqrt(i) * Math.sin(i);
  const dt = performance.now() - t0;
  void x;

  if (dt > 18)       document.documentElement.dataset.perf = 'low';
  else if (dt > 7)   document.documentElement.dataset.perf = 'mid';
  else               document.documentElement.dataset.perf = 'high';
}