// Reveal escalonado con IntersectionObserver. Respeta prefers-reduced-motion.
export function initReveal() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = document.querySelectorAll('.reveal');

  if (prefersReduced) {
    nodes.forEach((n) => n.classList.add('is-visible'));
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  nodes.forEach((node, idx) => {
    // Stagger automatico si el nodo no define su propio delay.
    if (!node.style.getPropertyValue('--reveal-delay')) {
      node.style.setProperty('--reveal-delay', `${(idx % 6) * 70}ms`);
    }
    io.observe(node);
  });
}
