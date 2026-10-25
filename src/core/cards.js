/* Listing cards, shared by Home, Listings and Property. Photos sit in soft organic window
   shapes that morph on hover; travel times to the beach, a school and a hospital count up. */

import { img, price, sizeLabel } from '../data.js';
import { esc } from './ui.js';
import { REDUCED } from './env.js';

const TRAVEL = [['beach', 'wave', 'beach'], ['school', 'school', 'school'], ['hospital', 'hospital', 'hospital']];

export function cardHTML(l, i = 0) {
  const specs = l.type === 'Plot'
    ? `<li><svg aria-hidden="true"><use href="#i-plot"/></svg>${esc(sizeLabel(l))}</li><li>${esc(l.status)}</li>`
    : `<li><svg aria-hidden="true"><use href="#i-bed"/></svg>${l.beds} bed</li><li><svg aria-hidden="true"><use href="#i-bath"/></svg>${l.baths} bath</li><li><svg aria-hidden="true"><use href="#i-area"/></svg>${esc(sizeLabel(l))}</li>`;
  return `
    <article class="l-card" data-card="${l.id}" style="--shape:${i % 4}">
      <a class="l-link" href="/property?id=${l.id}" data-view>
        <div class="l-media">
          <img src="${img(l.photos[0], 640)}" srcset="${img(l.photos[0], 640)} 640w, ${img(l.photos[0], 1280)} 1280w" sizes="(max-width: 760px) 92vw, 420px" alt="" loading="lazy" decoding="async">
          <span class="l-status">${esc(l.status)}</span>
        </div>
        <div class="l-body">
          <p class="label">${esc(l.locality)} · ${esc(l.type)}</p>
          <h3 class="l-title">${esc(l.title)}</h3>
          <p class="l-price">${price(l.price)}</p>
          <ul class="l-specs">${specs}</ul>
          <ul class="l-travel" aria-label="Travel times by car">
            ${TRAVEL.map(([k, icon, word]) => `<li><svg aria-hidden="true"><use href="#i-${icon}"/></svg><b data-mins="${l.travel[k]}">${l.travel[k]}</b> min <span>${word}</span></li>`).join('')}
          </ul>
        </div>
      </a>
    </article>`;
}

// travel minutes count up from zero whenever a card is hovered
export function wireCards(root) {
  if (REDUCED) return () => {};
  const timers = new Map();
  const onEnter = (e) => {
    const card = e.target.closest?.('.l-card');
    if (!card || timers.has(card)) return;
    const nums = [...card.querySelectorAll('[data-mins]')];
    const start = performance.now();
    const tick = () => {
      const p = Math.min(1, (performance.now() - start) / 700);
      const e2 = 1 - Math.pow(1 - p, 3);
      nums.forEach((n) => (n.textContent = Math.round(Number(n.dataset.mins) * e2)));
      if (p < 1) timers.set(card, requestAnimationFrame(tick));
      else timers.delete(card);
    };
    timers.set(card, requestAnimationFrame(tick));
    // never leave a half-counted number if frames stall
    setTimeout(() => { nums.forEach((n) => (n.textContent = n.dataset.mins)); timers.delete(card); }, 900);
  };
  root.addEventListener('pointerover', onEnter);
  return () => root.removeEventListener('pointerover', onEnter);
}
