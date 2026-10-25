/* Sell: a four-step valuation. Each finished step draws another part of the house outline:
   walls, roof, doors and windows, then the finishing touches. At the end the windows light up
   and the visitor gets a price range and a reference. */

import { AGENTS, price } from '../data.js';
import { esc, waLink } from '../core/ui.js';
import { REDUCED } from '../core/env.js';
import { gsap } from '../core/motion.js';

// rough rates for the concept: per sq ft for apartments, per sq yd for houses and plots
const RATE = {
  Apartment: { DHA: 40000, Clifton: 38000 },
  House: { DHA: 320000, Clifton: 345000 },
  Plot: { DHA: 210000, Clifton: 260000 },
};
const COND = { new: 1.08, good: 1, work: 0.88 };

export async function mount(root) {
  const q = (s) => root.querySelector(s);
  const form = q('[data-val]');
  const steps = [...root.querySelectorAll('.val-step')];
  const labels = [...root.querySelectorAll('[data-val-steps] li')];
  const segs = [...root.querySelectorAll('[data-house] [data-seg]')];
  const back = q('[data-back]'), next = q('[data-next]');
  let step = 0;

  function draw(done) {
    segs.forEach((s, i) => s.classList.toggle('is-drawn', i < done));
    labels.forEach((li, i) => { li.classList.toggle('is-done', i < done); li.classList.toggle('is-now', i === done); });
  }

  // the size field follows the property type
  function syncType() {
    const t = form.elements.type.value;
    q('[data-size-label]').textContent = t === 'Apartment' ? 'Covered area (sq ft)' : 'Plot size (sq yd)';
    form.elements.size.placeholder = t === 'Apartment' ? 'e.g. 1,800' : t === 'House' ? 'e.g. 500' : 'e.g. 1,000';
    q('[data-not-plot]').hidden = t === 'Plot';
  }
  form.addEventListener('change', (e) => { if (e.target.name === 'type') syncType(); });
  syncType();

  const RULES = {
    loc: (v) => (v.trim().length < 2 ? 'Which phase or block? Even a rough answer helps.' : ''),
    size: (v) => (!Number(v) || Number(v) < 50 ? 'Add the size so we can price it.' : ''),
    name: (v) => (v.trim().length < 2 ? 'Please add your name.' : ''),
    phone: (v) => (/^(\+?92|0)3\d{2}[\s-]?\d{7}$/.test(v.trim()) ? '' : 'Try a mobile like 03xx xxxxxxx.'),
  };
  const STEP_FIELDS = [['loc'], ['size'], [], ['name', 'phone']];
  function check(name) {
    const el = form.elements[name];
    const msg = RULES[name](el.value);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) el.setAttribute('aria-describedby', `e-${name}`); else el.removeAttribute('aria-describedby');
    q(`#e-${name}`).textContent = msg;
    return msg;
  }
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') check(e.target.name); });

  function go(n) {
    const from = steps[step], to = steps[n];
    step = n;
    from.hidden = true;
    to.hidden = false;
    q('[data-val-progress]').textContent = `Step ${n + 1} of 4`;
    back.hidden = n === 0;
    next.innerHTML = n === 3 ? 'Get my valuation <svg aria-hidden="true"><use href="#i-arrow"/></svg>' : 'Next <svg aria-hidden="true"><use href="#i-arrow"/></svg>';
    if (!REDUCED) gsap.fromTo(to, { x: 24, opacity: 0 }, { x: 0, opacity: 1, duration: 0.7, clearProps: 'all' });
    to.querySelector('input:not([type=radio]):not([type=checkbox]), select')?.focus({ preventScroll: true });
  }

  back.addEventListener('click', () => { if (step > 0) { draw(step - 1); go(step - 1); } });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = STEP_FIELDS[step].map((n) => [n, check(n)]).filter(([, m]) => m);
    if (bad.length) {
      form.elements[bad[0][0]].focus();
      if (!REDUCED) gsap.fromTo(steps[step], { x: -8 }, { x: 0, duration: 0.5, ease: 'elastic.out(1, 0.3)' });
      return;
    }
    draw(step + 1);
    if (step < 3) go(step + 1);
    else finish();
  });

  function finish() {
    const d = Object.fromEntries(new FormData(form));
    const extras = new FormData(form).getAll('extra');
    const size = Number(d.size);
    let mid = RATE[d.type][d.area] * size * COND[d.cond] * (1 + extras.length * 0.03);
    if (d.type === 'Plot' && size <= 300 && d.area === 'Clifton') mid *= 1.8; // small Clifton plots are usually commercial
    const lo = Math.round((mid * 0.93) / 1e5) * 1e5, hi = Math.round((mid * 1.07) / 1e5) * 1e5;
    const ref = 'SV-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    const agent = AGENTS[3];
    const first = d.name.trim().split(' ')[0];
    const msg = [`Valuation request ${ref}`, `${d.type} in ${d.area}, ${d.loc}`, `Size: ${size} ${d.type === 'Apartment' ? 'sq ft' : 'sq yd'}`, d.type !== 'Plot' && `Bedrooms: ${d.beds}`,
      extras.length && `Extras: ${extras.join(', ')}`, `Estimate shown: ${price(lo)} – ${price(hi)}`, `Name: ${d.name}`, `Mobile: ${d.phone}`, `Best time: ${d.time}`].filter(Boolean).join('\n');
    q('[data-house]').classList.add('is-lit');
    const done = q('[data-val-done]');
    done.innerHTML = `
      <p class="label">Estimated value · ref ${ref}</p>
      <p class="val-range">${price(lo)} <span>to</span> ${price(hi)}</p>
      <p>Thanks, ${esc(first)}. That's a first estimate from recent sales nearby. ${esc(agent.name)}, who handles valuations, will call ${d.time === 'Any time' ? 'today' : `this ${esc(d.time.toLowerCase())}`} to refine it after a short visit.</p>
      <div class="val-actions">
        <a class="btn btn-gold" href="${waLink(msg)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Send to ${esc(agent.name.split(' ')[0])} on WhatsApp</a>
        <button type="button" class="btn btn-line" data-again>Value another property</button>
      </div>
      <p class="val-note">A concept site: nothing was sent, and the estimate uses sample rates.</p>`;
    form.hidden = true;
    done.hidden = false;
    done.focus();
    if (!REDUCED) gsap.from(done.children, { y: 18, opacity: 0, duration: 0.8, stagger: 0.08, clearProps: 'all' });
  }

  q('[data-val-done]').addEventListener('click', (e) => {
    if (!e.target.closest('[data-again]')) return;
    form.reset();
    syncType();
    form.querySelectorAll('[aria-invalid]').forEach((el) => el.setAttribute('aria-invalid', 'false'));
    q('[data-house]').classList.remove('is-lit');
    q('[data-val-done]').hidden = true;
    form.hidden = false;
    draw(0);
    steps.forEach((s, i) => (s.hidden = i !== 0));
    step = 0;
    go(0);
  });

  draw(0);
  return () => {};
}
