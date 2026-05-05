// Duplica los hijos del marquee para lograr un loop infinito sin saltos.
// El CSS anima translateX(-50%) sobre el track; al duplicar, el bucle es continuo.
export function initMarquee(selector = '.marquee__track') {
  document.querySelectorAll(selector).forEach((track) => {
    if (track.dataset.cloned === 'true') return;
    const original = Array.from(track.children);
    original.forEach((child) => {
      const clone = child.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      track.appendChild(clone);
    });
    track.dataset.cloned = 'true';
  });
}
