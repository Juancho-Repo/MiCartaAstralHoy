// Anima contadores numericos cuando entran en viewport. Formato es-CO.
const formatter = new Intl.NumberFormat('es-CO');

export function initNumberTicker(selector = '[data-ticker]') {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = document.querySelectorAll(selector);

  nodes.forEach((node) => {
    const target = Number(node.dataset.ticker);
    const suffix = node.dataset.suffix || '';
    if (Number.isNaN(target)) return;

    if (prefersReduced) {
      node.textContent = formatter.format(target) + suffix;
      return;
    }

    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      const duration = 1600;
      const start = performance.now();
      function step(now) {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        const value = Math.round(target * eased);
        node.textContent = formatter.format(value) + suffix;
        if (t < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }, { threshold: 0.4 });
    io.observe(node);
  });
}
