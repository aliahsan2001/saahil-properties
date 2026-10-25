/* Listings: filter and sort the whole inventory. Cards glide to their new places with GSAP Flip
   instead of jumping; the filters live in the URL so results can be shared. */

import { Flip } from 'gsap/Flip';
import { LISTINGS } from '../data.js';
import { gsap } from '../core/motion.js';
import { REDUCED } from '../core/env.js';
import { cardHTML, wireCards } from '../core/cards.js';

gsap.registerPlugin(Flip);

export async function mount(root) {
  const q = (s) => root.querySelector(s);
  const grid = q('[data-grid]');
  const form = q('[data-filters]');
  grid.innerHTML = LISTINGS.map(cardHTML).join('');
  const cards = new Map([...grid.children].map((el) => [el.dataset.card, el]));
  const stopCards = wireCards(grid);

  /* ---------- state from the URL ---------- */
  const params = new URLSearchParams(location.search);
  const state = { type: params.get('type') || '', area: params.get('area') || '', beds: params.get('beds') || '', max: params.get('max') || '', sort: params.get('sort') || 'featured' };
  form.elements.beds.value = state.beds;
  form.elements.max.value = state.max;
  form.elements.sort.value = state.sort;
  const syncSegs = () => root.querySelectorAll('[data-f]').forEach((seg) =>
    seg.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === state[seg.dataset.f]))));

  function results() {
    let list = LISTINGS.filter((l) =>
      (!state.type || l.type === state.type) &&
      (!state.area || l.area === state.area) &&
      (!state.beds || (l.beds || 0) >= Number(state.beds)) &&
      (!state.max || l.price <= Number(state.max)));
    const by = { low: (a, b) => a.price - b.price, high: (a, b) => b.price - a.price, beach: (a, b) => a.travel.beach - b.travel.beach }[state.sort];
    if (by) list = [...list].sort(by);
    return list;
  }

  let flip;
  function render(animate = true) {
    const list = results();
    const show = new Set(list.map((l) => l.id));
    const before = animate && !REDUCED ? Flip.getState([...cards.values()]) : null;
    list.forEach((l) => grid.appendChild(cards.get(l.id)));
    cards.forEach((el, id) => { el.hidden = !show.has(id); });
    q('[data-count-text]').textContent = `${list.length} ${list.length === 1 ? 'property' : 'properties'}${state.area ? ` in ${state.area}` : ''}`;
    q('[data-empty]').hidden = list.length > 0;
    if (before) {
      flip?.progress(1);
      flip = Flip.from(before, {
        duration: 0.9, ease: 'expo.inOut', stagger: 0.025, absolute: true, nested: true,
        onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.7, ease: 'expo.out', delay: 0.25 }),
        onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.92, duration: 0.4 }),
      });
      const f = flip;
      setTimeout(() => f.progress(1), 1600); // land in place even if frames stall
    }
    const p = new URLSearchParams(Object.entries(state).filter(([k, v]) => v && !(k === 'sort' && v === 'featured')));
    history.replaceState(history.state, '', `/listings${p.size ? '?' + p : ''}`);
  }

  form.addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]');
    if (!b) return;
    state[b.closest('[data-f]').dataset.f] = b.dataset.v;
    syncSegs();
    render();
  });
  form.addEventListener('change', (e) => {
    if (!(e.target.name in state)) return;
    state[e.target.name] = e.target.value;
    render();
  });
  q('[data-reset]').addEventListener('click', () => {
    Object.assign(state, { type: '', area: '', beds: '', max: '', sort: 'featured' });
    form.reset();
    syncSegs();
    render();
  });

  syncSegs();
  render(false);
  return () => { stopCards(); flip?.kill(); };
}
