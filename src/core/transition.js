/* Page transition: a vertical blind. Slats swing shut one after another across the screen,
   then swing open the same way, each one revealing a slice of the next page.
   CSS does the motion; timers resolve the promises, so a stalled frame never hangs navigation. */

import { REDUCED } from './env.js';

const SLATS = 9;
let el;

function build() {
  el = document.createElement('div');
  el.className = 'blinds';
  el.setAttribute('aria-hidden', 'true');
  el.innerHTML = Array.from({ length: SLATS }, (_, i) => `<span style="--i:${i}"></span>`).join('');
  document.body.appendChild(el);
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const SWING = 520, STAGGER = 45;
const total = () => (REDUCED ? 260 : SWING + STAGGER * (SLATS - 1));

export async function cover() {
  if (!el) build();
  el.classList.remove('is-open');
  el.classList.add('is-active');
  void el.offsetWidth; // start from the open position before swinging shut
  el.classList.add('is-shut');
  await wait(total());
}

export async function reveal() {
  if (!el) return;
  el.classList.add('is-open');
  el.classList.remove('is-shut');
  await wait(total());
  el.classList.remove('is-active', 'is-open');
}
