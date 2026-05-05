// Cursor personalizado: punto + anillo que sigue al mouse via rAF.
// Se activa solo en pointer: fine para no interferir en mobile/tablet.
export function initCursor() {
  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (!isFine) return;

  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'cursor-dot';
  ring.className = 'cursor-ring';
  document.body.append(dot, ring);

  let x = 0, y = 0;
  let rx = 0, ry = 0;
  let raf = 0;

  function tick() {
    rx += (x - rx) * 0.18;
    ry += (y - ry) * 0.18;
    dot.style.transform = `translate(${x - 3}px, ${y - 3}px)`;
    ring.style.transform = `translate(${rx - 17}px, ${ry - 17}px)`;
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener('pointermove', (e) => {
    x = e.clientX; y = e.clientY;
    document.body.classList.add('cursor--active');
    if (!raf) raf = requestAnimationFrame(tick);
  });
  document.addEventListener('pointerleave', () => {
    document.body.classList.remove('cursor--active');
  });

  // Estado hover sobre elementos interactivos.
  const hoverTargets = 'a, button, .card, .accordion__trigger';
  document.addEventListener('pointerover', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.add('cursor--hover');
  });
  document.addEventListener('pointerout', (e) => {
    if (e.target.closest(hoverTargets)) document.body.classList.remove('cursor--hover');
  });
}
