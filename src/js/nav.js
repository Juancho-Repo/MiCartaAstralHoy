// Navbar: backdrop-blur al hacer scroll + drawer mobile con aria-expanded.
export function initNav() {
  const nav = document.querySelector('.nav');
  const toggle = document.querySelector('.nav__toggle');
  const drawer = document.querySelector('.nav__drawer');
  const backdrop = document.querySelector('.nav__backdrop');
  if (!nav) return;

  // IntersectionObserver sobre un sentinel sincroniza el estado "scrolled".
  const sentinel = document.createElement('div');
  sentinel.setAttribute('aria-hidden', 'true');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:100px;';
  document.body.prepend(sentinel);

  const io = new IntersectionObserver(([entry]) => {
    nav.classList.toggle('nav--scrolled', !entry.isIntersecting);
  }, { threshold: 0 });
  io.observe(sentinel);

  function setDrawer(open) {
    if (!drawer || !toggle || !backdrop) return;
    drawer.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    document.body.style.overflow = open ? 'hidden' : '';
  }

  toggle?.addEventListener('click', () => {
    const isOpen = drawer?.classList.contains('is-open');
    setDrawer(!isOpen);
  });
  backdrop?.addEventListener('click', () => setDrawer(false));
  drawer?.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => setDrawer(false))
  );
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawer(false);
  });
}
