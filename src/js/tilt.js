// Tilt 3D suave + spotlight (--mx, --my) para cards. Solo en pointer: fine.
export function initTilt(selector = '[data-tilt]') {
  const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!isFine || prefersReduced) return;

  const cards = document.querySelectorAll(selector);
  const MAX = 6; // grados max de rotacion

  cards.forEach((card) => {
    let raf = 0;
    let pending = null;

    function onMove(e) {
      pending = e;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const ev = pending;
        const rect = card.getBoundingClientRect();
        const x = (ev.clientX - rect.left) / rect.width;
        const y = (ev.clientY - rect.top) / rect.height;
        const rx = (0.5 - y) * MAX;
        const ry = (x - 0.5) * MAX;
        card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
        card.style.setProperty('--mx', `${x * 100}%`);
        card.style.setProperty('--my', `${y * 100}%`);
        raf = 0;
      });
    }
    function reset() {
      card.style.transform = '';
    }

    card.addEventListener('pointermove', onMove);
    card.addEventListener('pointerleave', reset);
  });
}
