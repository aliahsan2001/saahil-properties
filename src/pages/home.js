/* Home: the architect's sketch of a sea-facing tower becomes a finished evening render as you
   scroll, and the search bar rises from the waterline. Phones and lighter devices scrub through
   pre-rendered frames of the same sequence. */

import barba from '@barba/core';
import { LISTINGS, STATS, img } from '../data.js';
import { esc, idle } from '../core/ui.js';
import { LITE, REDUCED } from '../core/env.js';
import { ScrollTrigger } from '../core/motion.js';
import { cardHTML, wireCards } from '../core/cards.js';

const FRAMES = 10;

export async function mount(root, ctx) {
  const cleanups = [];
  const q = (s) => root.querySelector(s);

  /* ---------- content below the hero ---------- */
  q('[data-stats]').innerHTML = STATS.map((s) => `
    <div class="stat" data-reveal><b><span data-count="${s.value}">${s.value}</span>${s.suffix || ''}</b><span>${esc(s.label)}</span></div>`).join('');
  const featured = ['sea-crest-2402', 'dha8-villa', 'coral-point-ph'].map((id) => LISTINGS.find((l) => l.id === id));
  q('[data-featured]').innerHTML = featured.map(cardHTML).join('');
  cleanups.push(wireCards(q('[data-featured]')));
  const areas = [
    { name: 'Clifton', photo: '1756828791052-5cd529e650b5', line: 'Sea-facing towers, old bungalows on tree-lined blocks, and the city on your doorstep.' },
    { name: 'DHA', photo: '1613490493576-7fde63acd811', line: 'Family houses, quiet lanes and the plots everyone is building on next.' },
  ];
  q('[data-areas]').innerHTML = areas.map((a, i) => {
    const n = LISTINGS.filter((l) => l.area === a.name).length;
    return `<a class="area" href="/listings?area=${a.name}" data-view="Browse" data-reveal>
      <div class="area-media"><img src="${img(a.photo, 1280)}" alt="" loading="lazy" data-depth="${i ? 0.12 : 0.18}"></div>
      <div class="area-body"><h3 class="display">${a.name}</h3><p>${esc(a.line)}</p><span class="label">${n} listings</span></div>
    </a>`;
  }).join('');
  // area photos drift at different depths as you scroll
  if (!REDUCED) ctx.add(() => root.querySelectorAll('[data-depth]').forEach((im) => {
    ScrollTrigger.create({ trigger: im.parentElement, start: 'top bottom', end: 'bottom top', scrub: true,
      onUpdate: (s) => (im.style.transform = `translateY(${(s.progress - 0.5) * Number(im.dataset.depth) * 100}%) scale(1.2)`) });
  }));

  /* ---------- search rises from the waterline ---------- */
  q('[data-search]').addEventListener('submit', (e) => {
    e.preventDefault();
    const params = new URLSearchParams([...new FormData(e.target)].filter(([, v]) => v));
    barba.go(`/listings${params.size ? '?' + params : ''}`);
  });

  /* ---------- the hero ---------- */
  const hero = q('[data-hero]');
  const steps = [...root.querySelectorAll('[data-hero-steps] li')];
  let scene = null, last = -1;
  function apply(p) {
    scene?.setProgress(p);
    hero.classList.toggle('is-dusk', p > 0.32);
    hero.classList.toggle('is-late', p > 0.6);
    hero.classList.toggle('is-done', p > 0.8);
    // the header sits on paper until the sky arrives
    document.documentElement.classList.toggle('hdr-ink', p <= 0.32);
    const s = Math.min(3, Math.floor(p * 4.2));
    if (s !== last) { steps.forEach((li, i) => li.classList.toggle('is-on', i <= s)); last = s; }
    hero.style.setProperty('--p', p.toFixed(3));
  }

  if (!LITE) {
    idle().then(async () => {
      if (!root.isConnected) return;
      try {
        const { mountHero } = await import('../three/hero.js');
        if (!root.isConnected) return;
        scene = mountHero(q('[data-hero-canvas]'), { small: innerWidth < 760 });
        cleanups.push(() => scene.dispose());
        apply(ScrollTrigger.getById?.('hero')?.progress || 0);
      } catch (err) {
        console.warn('Hero 3D unavailable, using frames', err);
        document.documentElement.classList.add('lite');
        frames();
      }
    });
  } else frames();

  // lighter devices: the same sequence as pre-rendered stills, crossfaded as you scroll
  function frames() {
    const set = innerWidth / innerHeight < 1 ? 'p' : 'l';
    const box = q('[data-hero-frames]');
    box.innerHTML = Array.from({ length: FRAMES }, (_, i) => `<img src="/img/hero/${set}${i}.webp" alt="" ${i > 1 ? 'loading="lazy"' : ''} decoding="async">`).join('');
    const imgs = [...box.children];
    const show = (p) => {
      const f = p * (FRAMES - 1), a = Math.floor(f), t = f - a;
      imgs.forEach((im, i) => (im.style.opacity = i === a ? 1 : i === a + 1 ? t : 0));
    };
    show(0);
    scene = { setProgress: show };
  }

  // dev only: ?heroP=0.5 jumps the hero to a point in the sequence, for screenshots
  const devP = import.meta.env.DEV && new URLSearchParams(location.search).get('heroP');
  if (devP) { const p = Number(devP); setTimeout(() => apply(p), 50); setInterval(() => scene && apply(p), 500); return () => cleanups.forEach((fn) => fn()); }
  if (REDUCED) apply(1);
  else ctx.add(() => {
    ScrollTrigger.create({ id: 'hero', trigger: hero, start: 'top top', end: 'bottom bottom', scrub: 0.8, onUpdate: (s) => apply(s.progress) });
  });
  apply(0);

  cleanups.push(() => document.documentElement.classList.remove('hdr-ink'));
  return () => cleanups.forEach((fn) => fn());
}
