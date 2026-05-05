// Acordeon FAQ accesible: aria-expanded, teclado (Enter/Space), animacion max-height.
export function initAccordion() {
  const triggers = document.querySelectorAll('.accordion__trigger');
  const setOpen = (trigger, open) => {
    const content = trigger.nextElementSibling;
    if (!content) return;

    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    content.style.maxHeight = open ? content.scrollHeight + 'px' : '0px';
  };

  triggers.forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') === 'true';
      triggers.forEach((other) => {
        if (other !== trigger) setOpen(other, false);
      });
      setOpen(trigger, !open);
    });
    // Enter/Space ya los gestiona el navegador en <button>; no hace falta duplicar.
    setOpen(trigger, false);
  });

  // Recalcular al cambiar orientacion/viewport si hay paneles abiertos.
  window.addEventListener('resize', () => {
    triggers.forEach((t) => {
      if (t.getAttribute('aria-expanded') === 'true') {
        const content = t.nextElementSibling;
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });
}
