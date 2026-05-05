// Canvas cosmos: estrellas parpadeantes y varios mini sistemas solares.
// Corre en el hilo principal pero usa rAF con delta time para ser suave.
// En movil (<768px) se reduce a la mitad de elementos.

const STAR_PALETTE = [
  '#FFFFFF',
  '#F4F2FA',
  '#D6D2EC',
  '#BFD4FF',
  '#FFE7A8',
];

const PLANET_PALETTE = [
  '#7B5EA7',
  '#C9A020',
  '#1A9A7A',
  '#3A5FD9',
  '#F07F6A',
  '#F4F2FA',
  '#D9895B',
  '#8ED1FC',
];

export function initCosmos(canvasId = 'cosmos') {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const isMobile = () => window.innerWidth < 768;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, stars, planets, solarSystems;
  let raf = 0;

  function resize() {
    W = canvas.width = window.innerWidth;
    // El canvas es fixed al viewport, asi que su bitmap interno debe
    // mantener el mismo alto visible. Si usamos scrollHeight se comprime
    // todo el dibujo y el fondo se percibe como manchas.
    H = canvas.height = window.innerHeight;
    init();
  }

  function randRange(min, max) { return min + Math.random() * (max - min); }
  function randItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function init() {
    const mobile = isMobile();
    const starCount  = mobile ? 90  : 220;
    const planetCount = mobile ? 4  : 8;
    const solarSystemCount  = mobile ? 2  : 5;

    // Estrellas: base + algunas destacadas para dar profundidad.
    stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: randRange(0.7, 2.4),
      color: randItem(STAR_PALETTE),
      phase: Math.random() * Math.PI * 2,
      speed: randRange(0.35, 1.1),
      twinkleAmp: randRange(0.35, 0.95),
      glow: randRange(4, 12),
      kind: Math.random() > 0.82 ? 'bright' : 'dust',
    }));

    // Planetas sueltos en el fondo para dar profundidad.
    planets = Array.from({ length: planetCount }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: randRange(3.5, 8.5),
      color: randItem(PLANET_PALETTE),
      phase: Math.random() * Math.PI * 2,
      speed: randRange(0.12, 0.35),
      drift: { x: randRange(-0.03, 0.03), y: randRange(-0.018, 0.018) },
    }));

    // Mini sistemas solares distribuidos por el fondo.
    solarSystems = Array.from({ length: solarSystemCount }, () => {
      const padX = Math.min(180, W * 0.16);
      const padY = Math.min(150, H * 0.2);
      const x = randRange(padX, W - padX);
      const y = randRange(padY, H - padY);
      const orbitCount = Math.round(randRange(3, mobile ? 4 : 6));
      const baseRadius = randRange(mobile ? 20 : 28, mobile ? 42 : 70);
      const sunRadius = randRange(7, 12);
      const tilt = randRange(-0.5, 0.5);
      const orbitGap = randRange(14, 20);
      const planetsInSystem = Array.from({ length: orbitCount }, (_, idx) => {
        const orbit = baseRadius + idx * orbitGap;
        return {
          orbit,
          radius: randRange(2.4, idx === orbitCount - 1 ? 5.8 : 4.8),
          color: randItem(PLANET_PALETTE),
          angle: Math.random() * Math.PI * 2,
          speed: randRange(0.08, 0.22) / (1 + idx * 0.28),
          glow: randRange(4, 10),
          ring: Math.random() > 0.82,
        };
      });
      return {
        x,
        y,
        sunRadius,
        sunColor: randItem(['#FFD166', '#FFE7A8', '#FFF2C2']),
        orbitColor: randItem(['#AFC7FF', '#D6D2EC', '#B8FFF1']),
        orbitAlpha: randRange(0.16, 0.28),
        glow: randRange(14, 26),
        tilt,
        planets: planetsInSystem,
      };
    });
  }

  let last = 0;
  function draw(ts) {
    const dt = (ts - last) / 1000;
    last = ts;
    ctx.clearRect(0, 0, W, H);

    // Sistemas solares
    for (const s of solarSystems) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.scale(1, 0.72);

      for (const planet of s.planets) {
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.strokeStyle = s.orbitColor;
        ctx.globalAlpha = s.orbitAlpha;
        ctx.lineWidth = 0.9;
        ctx.ellipse(0, 0, planet.orbit, planet.orbit, s.tilt, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.shadowBlur = s.glow;
      ctx.shadowColor = s.sunColor;
      const sunGradient = ctx.createRadialGradient(0, 0, s.sunRadius * 0.25, 0, 0, s.sunRadius * 3.2);
      sunGradient.addColorStop(0, '#FFF9D6');
      sunGradient.addColorStop(0.45, s.sunColor);
      sunGradient.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(0, 0, s.sunRadius * 3.1, 0, Math.PI * 2);
      ctx.fillStyle = sunGradient;
      ctx.globalAlpha = 0.28;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(0, 0, s.sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = s.sunColor;
      ctx.globalAlpha = 0.92;
      ctx.fill();

      for (const planet of s.planets) {
        if (!prefersReduced) planet.angle += planet.speed * dt;
        const px = Math.cos(planet.angle) * planet.orbit;
        const py = Math.sin(planet.angle) * planet.orbit;
        ctx.shadowBlur = planet.glow;
        ctx.shadowColor = planet.color;
        ctx.beginPath();
        ctx.arc(px, py, planet.radius, 0, Math.PI * 2);
        ctx.fillStyle = planet.color;
        ctx.globalAlpha = 0.9;
        ctx.fill();

        if (planet.ring) {
          ctx.shadowBlur = 0;
          ctx.beginPath();
          ctx.strokeStyle = '#F4F2FA';
          ctx.globalAlpha = 0.45;
          ctx.lineWidth = 0.7;
          ctx.ellipse(px, py, planet.radius * 1.85, planet.radius * 0.7, 0.3, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      ctx.restore();
    }

    // Estrellas
    for (const s of stars) {
      if (!prefersReduced) s.phase += s.speed * dt;
      const alpha = s.twinkleAmp * (0.5 + 0.5 * Math.sin(s.phase)) + (1 - s.twinkleAmp) * 0.8;
      ctx.shadowBlur = s.kind === 'bright' ? s.glow : s.glow * 0.45;
      ctx.shadowColor = s.color;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.kind === 'bright' ? alpha : alpha * 0.72;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      if (s.kind === 'bright') {
        ctx.lineWidth = 0.9;
        ctx.strokeStyle = s.color;
        ctx.beginPath();
        ctx.moveTo(s.x - s.r * 2.4, s.y);
        ctx.lineTo(s.x + s.r * 2.4, s.y);
        ctx.moveTo(s.x, s.y - s.r * 2.4);
        ctx.lineTo(s.x, s.y + s.r * 2.4);
        ctx.globalAlpha = alpha * 0.55;
        ctx.stroke();
      }
    }

    // Planetas con glow
    for (const p of planets) {
      if (!prefersReduced) {
        p.phase += p.speed * dt;
        p.x += p.drift.x;
        p.y += p.drift.y;
        if (p.x < -20) p.x = W + 20;
        if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20;
        if (p.y > H + 20) p.y = -20;
      }
      const alpha = 0.5 + 0.3 * Math.sin(p.phase);
      // Glow exterior
      ctx.shadowBlur = 0;
      const grd = ctx.createRadialGradient(p.x, p.y, p.r * 0.3, p.x, p.y, p.r * 3);
      grd.addColorStop(0, p.color);
      grd.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * 3, 0, Math.PI * 2);
      ctx.fillStyle = grd;
      ctx.globalAlpha = alpha * 0.25;
      ctx.fill();
      // Nucleo
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = alpha * 0.75;
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
    raf = requestAnimationFrame(draw);
  }

  function delayedResize() {
    cancelAnimationFrame(raf);
    setTimeout(() => {
      resize();
      raf = requestAnimationFrame(draw);
    }, 400);
  }

  window.addEventListener('resize', delayedResize);
  resize();
  raf = requestAnimationFrame(draw);
}
