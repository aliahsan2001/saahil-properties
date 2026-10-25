/* Over a property, the cursor becomes a "View" ring. Fine pointers only; the native cursor
   stays everywhere else. */

import { FINE, REDUCED } from './env.js';

export function initCursor() {
  if (!FINE) return;
  const ring = document.createElement('div');
  ring.className = 'view-ring';
  ring.setAttribute('aria-hidden', 'true');
  ring.innerHTML = '<span>View</span>';
  document.body.appendChild(ring);
  let x = -100, y = -100, tx = -100, ty = -100, raf = 0;
  const step = () => {
    x += (tx - x) * (REDUCED ? 1 : 0.22);
    y += (ty - y) * (REDUCED ? 1 : 0.22);
    ring.style.transform = `translate(${x}px, ${y}px)`;
    raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.3 ? requestAnimationFrame(step) : 0;
  };
  addEventListener('pointermove', (e) => {
    tx = e.clientX; ty = e.clientY;
    const over = e.target.closest?.('[data-view]');
    ring.classList.toggle('is-on', !!over);
    if (over) ring.querySelector('span').textContent = over.dataset.view || 'View';
    if (!raf) raf = requestAnimationFrame(step);
  }, { passive: true });
  document.addEventListener('pointerleave', () => ring.classList.remove('is-on'));
}
