// Smoke test: valida que el HTML tiene un H1 unico, las secciones clave, y los datos cargan.
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { servicios } from '../src/data/servicios.js';
import { testimonios } from '../src/data/testimonios.js';
import { faq } from '../src/data/faq.js';

const html = fs.readFileSync(path.resolve('index.html'), 'utf8');

describe('index.html', () => {
  it('tiene un solo H1', () => {
    const count = (html.match(/<h1\b/g) || []).length;
    expect(count).toBe(1);
  });

  it('incluye secciones clave (hero, servicios, testimonios, faq, cta)', () => {
    for (const sel of ['class="hero"', 'id="servicios"', 'id="testimonios"', 'id="faq"', 'class="cta-final']) {
      expect(html).toContain(sel);
    }
  });

  it('incluye meta SEO: description, canonical, og, twitter', () => {
    expect(html).toMatch(/<meta name="description"/i);
    expect(html).toMatch(/rel="canonical"/i);
    expect(html).toMatch(/property="og:title"/i);
    expect(html).toMatch(/name="twitter:card"/i);
  });

  it('incluye JSON-LD Organization', () => {
    expect(html).toMatch(/application\/ld\+json/);
    expect(html).toMatch(/"@type":\s*"Organization"/);
  });
});

describe('data', () => {
  it('tiene 7 servicios', () => {
    expect(servicios).toHaveLength(7);
    servicios.forEach((s) => {
      expect(s.nombre).toBeTruthy();
      expect(s.precioCOP).toBeTruthy();
      expect(s.precioUSD).toBeTruthy();
      expect(Array.isArray(s.incluye)).toBe(true);
    });
  });

  it('tiene 7 testimonios', () => {
    expect(testimonios).toHaveLength(7);
    testimonios.forEach((t) => {
      expect(t.texto.length).toBeGreaterThan(30);
      expect(t.autor).toBeTruthy();
    });
  });

  it('tiene 10 preguntas en FAQ', () => {
    expect(faq).toHaveLength(10);
    faq.forEach((f) => {
      expect(f.q).toMatch(/\?$/);
      expect(f.a.length).toBeGreaterThan(20);
    });
  });
});
