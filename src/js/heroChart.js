const SIGNS = [
  { glyph: '\u2648', color: '#e23b2e' },
  { glyph: '\u2649', color: '#1f8f4a' },
  { glyph: '\u264a', color: '#f08a1c' },
  { glyph: '\u264b', color: '#13a3b8' },
  { glyph: '\u264c', color: '#e23b2e' },
  { glyph: '\u264d', color: '#1f8f4a' },
  { glyph: '\u264e', color: '#f08a1c' },
  { glyph: '\u264f', color: '#7a3ad6' },
  { glyph: '\u2650', color: '#e23b2e' },
  { glyph: '\u2651', color: '#1f8f4a' },
  { glyph: '\u2652', color: '#f08a1c' },
  { glyph: '\u2653', color: '#1f3bd6' },
];

const PLANETS = [
  { name: 'sun', glyph: '\u2609', stroke: '#f08a1c', orbit: 300, angle: 20, radius: 19, duration: 90 },
  { name: 'moon', glyph: '\u263e', stroke: '#3db6d9', orbit: 325, angle: 80, radius: 19, duration: 38 },
  { name: 'mercury', glyph: '\u263f', stroke: '#f08a1c', orbit: 285, angle: -55, radius: 18, duration: 55, reverse: true },
  { name: 'venus', glyph: '\u2640', stroke: '#1f8f4a', orbit: 345, angle: 140, radius: 18, duration: 75 },
  { name: 'mars', glyph: '\u2642', stroke: '#e23b2e', orbit: 310, angle: 220, radius: 18, duration: 130 },
  { name: 'jupiter', glyph: '\u2643', stroke: '#f0b41c', orbit: 355, angle: -110, radius: 19, duration: 210 },
  { name: 'saturn', glyph: '\u2644', stroke: '#1f3bd6', orbit: 290, angle: 260, radius: 19, duration: 280, reverse: true },
  { name: 'uranus', glyph: '\u2645', stroke: '#13a3b8', orbit: 335, angle: 175, radius: 18, duration: 340 },
  { name: 'neptune', glyph: '\u2646', stroke: '#7a3ad6', orbit: 360, angle: 300, radius: 18, duration: 400, reverse: true },
  { name: 'pluto', glyph: '\u2647', stroke: '#d83a8a', orbit: 300, angle: 330, radius: 17, duration: 460 },
  { name: 'chiron', glyph: '\u26b7', stroke: '#4a63e0', orbit: 320, angle: -150, radius: 16, duration: 170, reverse: true },
  { name: 'node', glyph: '\u260a', stroke: '#0b1733', orbit: 350, angle: 15, radius: 16, duration: 500, reverse: true },
];

const HERO_CHART_SELECTOR = '[data-hero-chart]';

function rad(deg) {
  return (deg * Math.PI) / 180;
}

function buildTickMarkup() {
  return Array.from({ length: 360 }, (_, i) => {
    const long = i % 10 === 0;
    const y2 = long ? -438 : -446;
    const width = long ? 1.6 : 1;
    const opacity = long ? 0.85 : 0.5;
    return `
      <line
        x1="0"
        y1="-460"
        x2="0"
        y2="${y2}"
        stroke="#1f3bd6"
        stroke-width="${width}"
        opacity="${opacity}"
        transform="rotate(${i})"
      ></line>
    `;
  }).join('');
}

function buildZodiacSpokes() {
  return SIGNS.map((_, i) => {
    const angle = -90 + i * 30;
    const x1 = Math.cos(rad(angle)) * 370 + 500;
    const y1 = Math.sin(rad(angle)) * 370 + 500;
    const x2 = Math.cos(rad(angle)) * 454 + 500;
    const y2 = Math.sin(rad(angle)) * 454 + 500;
    return `
      <line
        x1="${x1.toFixed(1)}"
        y1="${y1.toFixed(1)}"
        x2="${x2.toFixed(1)}"
        y2="${y2.toFixed(1)}"
      ></line>
    `;
  }).join('');
}

function buildZodiacGlyphs() {
  return SIGNS.map((sign, i) => {
    const angle = -90 + i * 30 + 15;
    const x = Math.cos(rad(angle)) * 412;
    const y = Math.sin(rad(angle)) * 412;
    return `
      <text
        class="hero-chart__glyph"
        x="${x.toFixed(1)}"
        y="${y.toFixed(1)}"
        font-size="32"
        fill="${sign.color}"
      >${sign.glyph}</text>
    `;
  }).join('');
}

function buildHouseSpokes() {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = 180 + i * 30;
    const x1 = Math.cos(rad(angle)) * 200;
    const y1 = Math.sin(rad(angle)) * 200;
    const x2 = Math.cos(rad(angle)) * 260;
    const y2 = Math.sin(rad(angle)) * 260;
    return `
      <line
        x1="${x1.toFixed(1)}"
        y1="${y1.toFixed(1)}"
        x2="${x2.toFixed(1)}"
        y2="${y2.toFixed(1)}"
      ></line>
    `;
  }).join('');
}

function buildHouseNumbers() {
  return Array.from({ length: 12 }, (_, i) => {
    const angle = 180 + i * 30 + 15;
    const x = Math.cos(rad(angle)) * 230;
    const y = Math.sin(rad(angle)) * 230;
    return `
      <text
        class="hero-chart__house-num"
        x="${x.toFixed(1)}"
        y="${y.toFixed(1)}"
      >${i + 1}</text>
    `;
  }).join('');
}

function buildPlanetMarkup() {
  return PLANETS.map((planet) => {
    const orbitClass = planet.reverse ? 'hero-chart__orbit is-reverse' : 'hero-chart__orbit';
    const glyphClass = planet.reverse
      ? 'hero-chart__planet-glyph'
      : 'hero-chart__planet-glyph is-reverse';

    return `
      <g class="${orbitClass}" style="--orbit-duration:${planet.duration}s">
        <g transform="rotate(${planet.angle}) translate(0 -${planet.orbit})">
          <g class="${glyphClass}" style="--orbit-duration:${planet.duration}s">
            <circle
              r="${planet.radius}"
              fill="#ffffff"
              stroke="${planet.stroke}"
              stroke-width="1.6"
            ></circle>
            <text
              class="hero-chart__glyph"
              font-size="${planet.radius + 6}"
              fill="${planet.stroke}"
            >${planet.glyph}</text>
          </g>
        </g>
      </g>
    `;
  }).join('');
}

function buildHeroChartMarkup() {
  return `
    <div class="hero-chart" aria-hidden="true">
      <svg viewBox="0 0 1000 1000" role="presentation">
        <circle cx="500" cy="500" r="470" fill="#ffffff"></circle>
        <circle cx="500" cy="500" r="470" fill="none" stroke="#1f3bd6" stroke-width="12"></circle>
        <circle cx="500" cy="500" r="454" fill="none" stroke="#1f3bd6" stroke-width="1.2" opacity=".55"></circle>
        <circle cx="500" cy="500" r="370" fill="none" stroke="#1f3bd6" stroke-width="1.2" opacity=".55"></circle>

        <g class="hero-chart__ticks">
          <g transform="translate(500 500)">
            ${buildTickMarkup()}
          </g>
        </g>

        <g class="hero-chart__zodiac-spokes" stroke="#1f3bd6" stroke-width="1" opacity=".5">
          ${buildZodiacSpokes()}
        </g>

        <g class="hero-chart__zodiac">
          <g transform="translate(500 500)">
            ${buildZodiacGlyphs()}
          </g>
        </g>

        <circle cx="500" cy="500" r="260" fill="#ffffff" stroke="#1f3bd6" stroke-width="1.5" opacity=".9"></circle>
        <circle cx="500" cy="500" r="200" fill="none" stroke="#1f3bd6" stroke-width="1" opacity=".55"></circle>

        <g class="hero-chart__houses">
          <g
            transform="translate(500 500)"
            class="hero-chart__house-spokes"
            stroke="#1f3bd6"
            stroke-width=".9"
            opacity=".55"
          >
            ${buildHouseSpokes()}
          </g>
          <g transform="translate(500 500)">
            ${buildHouseNumbers()}
          </g>
        </g>

        <g transform="translate(500 500)" class="hero-chart__aspects">
          <g class="hero-chart__core">
            <polyline class="hero-chart__aspect aspect-red" points="0,-180 156,90 -156,90 0,-180"></polyline>
            <polyline class="hero-chart__aspect aspect-blue" points="-170,-50 170,-50 106,148 -106,148 -170,-50"></polyline>
            <line class="hero-chart__aspect aspect-green" x1="-180" y1="20" x2="180" y2="-20"></line>
            <line class="hero-chart__aspect aspect-violet" x1="-150" y1="-120" x2="150" y2="120"></line>
            <line class="hero-chart__aspect aspect-red" x1="0" y1="-180" x2="0" y2="180"></line>
            <line class="hero-chart__aspect aspect-blue" x1="-180" y1="0" x2="180" y2="0"></line>
          </g>
        </g>

        <g transform="translate(500 500)">
          ${buildPlanetMarkup()}
        </g>

        <g transform="translate(500 500)" class="hero-chart__center">
          <circle r="7" fill="#1f3bd6"></circle>
          <circle r="16" fill="none" stroke="#1f3bd6" stroke-width="1" opacity=".55"></circle>
          <circle r="28" fill="none" stroke="#1f3bd6" stroke-width=".8" opacity=".3"></circle>
        </g>
      </svg>
    </div>
  `;
}

export function initHeroChart(selector = HERO_CHART_SELECTOR) {
  const root = document.querySelector(selector);
  if (!root || root.dataset.heroChartReady === 'true') return;

  root.innerHTML = buildHeroChartMarkup();
  root.dataset.heroChartReady = 'true';
}
