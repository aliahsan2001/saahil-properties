/* Contact: agent portraits float at slightly different depths and shift as you move the mouse.
   The form hands a ready-written message to WhatsApp. */

import { AGENTS } from '../data.js';
import { esc, waLink } from '../core/ui.js';
import { FINE, REDUCED } from '../core/env.js';
import { gsap } from '../core/motion.js';

const DEPTHS = [0.5, 1, 0.3, 0.8];

export async function mount(root) {
  const q = (s) => root.querySelector(s);
  const stage = q('[data-agents]');
  stage.innerHTML = AGENTS.map((a, i) => `
    <article class="agent-float" style="--d:${DEPTHS[i]}; z-index:${Math.round(DEPTHS[i] * 10)}">
      <div class="agent-card" style="--tone:${a.tone}">
        <div class="agent-portrait" aria-hidden="true"><span>${esc(a.name.split(' ').map((w) => w[0]).join(''))}</span></div>
        <div class="agent-meta"><small>${esc(a.role)}</small><b>${esc(a.name)}</b><p>“${esc(a.line)}”</p></div>
      </div>
    </article>`).join('');
  const floats = [...stage.children];

  let off = () => {};
  if (!REDUCED) {
    floats.forEach((el, i) => gsap.from(el, { y: 60 + DEPTHS[i] * 60, opacity: 0, duration: 1.4, delay: 0.15 + i * 0.1, ease: 'expo.out', clearProps: 'opacity' }));
    if (FINE && innerWidth >= 1000) {
      const movers = floats.map((el) => ({ x: gsap.quickTo(el, 'x', { duration: 1.2, ease: 'expo.out' }), y: gsap.quickTo(el, 'y', { duration: 1.2, ease: 'expo.out' }), r: gsap.quickTo(el, 'rotation', { duration: 1.4, ease: 'expo.out' }) }));
      const onMove = (e) => {
        const nx = e.clientX / innerWidth - 0.5, ny = e.clientY / innerHeight - 0.5;
        movers.forEach((m, i) => { const d = DEPTHS[i]; m.x(-nx * 70 * d); m.y(-ny * 50 * d); m.r(nx * 3 * (d - 0.6)); });
      };
      addEventListener('pointermove', onMove, { passive: true });
      off = () => removeEventListener('pointermove', onMove);
    }
  }

  /* ---------- the note, sent on WhatsApp ---------- */
  const form = q('[data-contact]');
  const RULES = {
    name: (v) => (v.trim().length < 2 ? 'Please add your name.' : ''),
    phone: (v) => (/^(\+?92|0)3\d{2}[\s-]?\d{7}$/.test(v.trim()) ? '' : 'Try a mobile like 03xx xxxxxxx.'),
  };
  const check = (n) => {
    const el = form.elements[n], msg = RULES[n](el.value);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (msg) el.setAttribute('aria-describedby', `ce-${n}`); else el.removeAttribute('aria-describedby');
    q(`#ce-${n}`).textContent = msg;
    return msg;
  };
  form.addEventListener('input', (e) => { if (e.target.getAttribute('aria-invalid') === 'true') check(e.target.name); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const bad = Object.keys(RULES).filter((n) => check(n));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const d = Object.fromEntries(new FormData(form));
    const text = [`Hello Saahil Properties, I'm ${d.name.trim()} (${d.phone.trim()}).`, `I'm looking to: ${d.about.toLowerCase()}.`, d.msg.trim()].filter(Boolean).join('\n');
    window.open(waLink(text), '_blank', 'noopener');
    q('[data-contact-note]').textContent = 'Opening WhatsApp with your message ready to send.';
  });

  return () => off();
}
