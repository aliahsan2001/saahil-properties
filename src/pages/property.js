/* Property detail. "Explore in 3D" opens the building as a model: hover a floor, click it to see
   its units. The installment calculator is tied to it: drag the down payment and the floors fill
   with warm gold light, showing at a glance what share you pay now and what stays in installments.
   Phones and lighter devices get a tappable floor diagram that fills the same way; plots get a
   plot outline. */

import { LISTINGS, BUILDINGS, AGENTS, img, price, sizeLabel } from '../data.js';
import { esc, idle, waLink } from '../core/ui.js';
import { LITE, REDUCED } from '../core/env.js';
import { gsap } from '../core/motion.js';
import { cardHTML, wireCards } from '../core/cards.js';

const hash = (a, b) => { const x = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return x - Math.floor(x); };

function agentFor(l) {
  if (l.type === 'Plot') return AGENTS[2];
  if (l.type === 'House') return AGENTS[1];
  return AGENTS[0];
}

// what's on a floor: units for towers, rooms for houses
function floorInfo(l, b, f) {
  if (b.kind === 'house') {
    const rooms = [
      ['Ground floor', 'Drawing room, dining, kitchen, guest bedroom and powder room'],
      ['First floor', 'Master suite, two bedrooms and a family lounge'],
      ['Second floor', 'Suite with a private terrace, and the roof garden'],
    ][f] || ['Level', ''];
    return { title: rooms[0], html: `<p>${esc(rooms[1])}</p>` };
  }
  const top = f === b.floors - 1;
  const units = top ? [{ name: 'PH', beds: 4, size: 5200 }] : [0, 1, 2, 3].map((i) => ({ name: `${f + 1}${'ABCD'[i]}`, beds: [3, 2, 2, 3][i], size: [2450, 1650, 1600, 2400][i] }));
  const mine = l.floor - 1 === f;
  return {
    title: `Floor ${f + 1}${top ? ' · Penthouse' : ''}`,
    html: `<ul class="units">${units.map((u, i) => {
      const own = mine && i === 0;
      const r = hash(f, i);
      const status = own ? 'This listing' : r < 0.45 ? 'Sold' : r < 0.6 ? 'Reserved' : 'Available';
      return `<li class="unit${own ? ' is-mine' : ''}" data-status="${status}"><b>${u.name}</b><span>${u.beds} bed · ${u.size.toLocaleString('en-PK')} sq ft</span><em>${status}</em></li>`;
    }).join('')}</ul>`,
  };
}

export async function mount(root) {
  const cleanups = [];
  const q = (s) => root.querySelector(s);
  const id = new URLSearchParams(location.search).get('id');
  const l = LISTINGS.find((x) => x.id === id) || LISTINGS[0];
  if (id !== l.id) history.replaceState(history.state, '', `/property?id=${l.id}`);
  document.title = `${l.title}, ${l.locality} · Saahil Properties`;

  /* ---------- gallery ---------- */
  const gallery = q('[data-gallery]');
  gallery.innerHTML = `
    <div class="g-main"><img src="${img(l.photos[0], 1280)}" alt="${esc(l.title)}" data-g-main><span class="l-status">${esc(l.status)}</span></div>
    ${l.photos.length > 1 ? `<div class="g-thumbs" role="group" aria-label="Photos">${l.photos.map((p, i) => `<button type="button" class="g-thumb" data-g="${i}" aria-pressed="${i === 0}" aria-label="Photo ${i + 1} of ${l.photos.length}"><img src="${img(p, 640)}" alt="" loading="lazy"></button>`).join('')}</div>` : ''}`;
  gallery.addEventListener('click', (e) => {
    const t = e.target.closest('[data-g]');
    if (!t) return;
    const main = q('[data-g-main]');
    gallery.querySelectorAll('[data-g]').forEach((b) => b.setAttribute('aria-pressed', String(b === t)));
    main.classList.add('is-swapping');
    setTimeout(() => { main.src = img(l.photos[Number(t.dataset.g)], 1280); main.classList.remove('is-swapping'); }, 260);
  });

  /* ---------- the facts ---------- */
  const agent = agentFor(l);
  const enquiry = `Hello Saahil Properties, I'm interested in "${l.title}" in ${l.locality} (ref ${l.id}), listed at ${price(l.price)}. Is it still available?`;
  const specs = l.type === 'Plot'
    ? [['plot', sizeLabel(l), 'Plot size'], ['doc', l.status, 'Status']]
    : [['bed', `${l.beds}`, 'Bedrooms'], ['bath', `${l.baths}`, 'Bathrooms'], ['area', sizeLabel(l), l.type === 'House' ? 'Plot size' : 'Covered area'], ...(l.floor ? [['building', `${l.floor} of ${BUILDINGS[l.building].floors}`, 'Floor']] : [])];
  q('[data-info]').innerHTML = `
    <p class="label">${esc(l.locality)} · ${esc(l.type)}</p>
    <h1 class="display prop-title">${esc(l.title)}</h1>
    <p class="prop-price">${price(l.price)}</p>
    <dl class="prop-specs">${specs.map(([icon, v, k]) => `<div><dt><svg aria-hidden="true"><use href="#i-${icon}"/></svg>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
    <div class="prop-actions">
      <a class="btn btn-gold" href="${waLink(enquiry)}" target="_blank" rel="noopener"><svg aria-hidden="true"><use href="#i-wa"/></svg>Ask about this home</a>
      <a class="btn btn-line" href="#explore" data-jump><svg aria-hidden="true"><use href="#i-${l.type === 'Plot' ? 'plot' : 'cube'}"/></svg>${l.type === 'Plot' ? 'Plan &amp; payments' : 'Explore in 3D'}</a>
    </div>
    <div class="agent-mini">
      <span class="avatar" style="--tone:${agent.tone}">${esc(agent.name.split(' ').map((w) => w[0]).join(''))}</span>
      <span><b>${esc(agent.name)}</b><small>${esc(agent.role)} · replies within the hour</small></span>
    </div>`;
  q('[data-info]').addEventListener('click', (e) => {
    const a = e.target.closest('[data-jump]');
    if (!a) return;
    e.preventDefault();
    import('../core/motion.js').then(({ scrollToEl }) => scrollToEl(q('#explore'), -90));
  });

  q('[data-blurb]').textContent = l.blurb;
  q('[data-features]').innerHTML = l.features.map((f) => `<li><svg aria-hidden="true"><use href="#i-check"/></svg>${esc(f)}</li>`).join('');
  q('[data-travel]').innerHTML = [['wave', l.travel.beach, 'to the beach'], ['school', l.travel.school, 'to a school'], ['hospital', l.travel.hospital, 'to a hospital']]
    .map(([icon, m, t]) => `<li><svg aria-hidden="true"><use href="#i-${icon}"/></svg><b><span data-count="${m}">${m}</span> min</b><span>${t}</span></li>`).join('');

  /* ---------- explore: model, floor stack or plot ---------- */
  const b = l.building ? BUILDINGS[l.building] : null;
  const floors = b ? b.floors : 0;
  const mine = l.floor ? l.floor - 1 : -9;
  const stage = q('[data-stage]');
  const panel = q('[data-floor-panel]');
  const tip = q('[data-tip]');
  let model = null, fill = 0.3;

  function showFloor(f) {
    if (!b || f < 0) return;
    const info = floorInfo(l, b, f);
    panel.innerHTML = `<p class="label">${esc(b.name)}</p><h3 class="display">${esc(info.title)}</h3>${info.html}`;
    stack.querySelectorAll('[data-floor]').forEach((el) => el.setAttribute('aria-pressed', String(Number(el.dataset.floor) === f)));
    if (!REDUCED) gsap.fromTo(panel.children, { y: 12, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, clearProps: 'all' });
  }

  const stack = q('[data-stack]');
  if (b) {
    stack.innerHTML = Array.from({ length: floors }, (_, i) => floors - 1 - i).map((f) =>
      `<button type="button" class="fs-floor${f === mine ? ' is-mine' : ''}" data-floor="${f}" aria-pressed="false" aria-label="Floor ${f + 1}${f === mine ? ', this listing' : ''}">${(f + 1) % 5 === 0 || f === 0 || f === mine ? `<span>${f + 1}</span>` : ''}</button>`).join('');
    stack.classList.add(b.kind === 'house' ? 'is-house' : 'is-tower');
    stack.addEventListener('click', (e) => { const f = e.target.closest('[data-floor]'); if (f) showFloor(Number(f.dataset.floor)); });
    panel.innerHTML = `<p class="label">${esc(b.name)}</p><h3 class="display">${b.kind === 'house' ? `${b.floors} levels` : `${b.floors} floors, ${b.unitsPerFloor} units each`}</h3><p class="panel-hint">${b.kind === 'house' ? 'Pick a level to see what\'s on it.' : 'Pick a floor to see which units are free.'}${mine >= 0 ? ' This listing is on the glowing floor.' : ''}</p>`;
    if (mine >= 0) setTimeout(() => showFloor(mine), 50);
    const use3D = !LITE && innerWidth >= 760;
    stage.classList.toggle('is-3d', use3D);
    if (!use3D) {
      q('[data-ex-eyebrow]').textContent = b.kind === 'house' ? 'Level by level' : 'Floor by floor';
      q('[data-ex-lead]').textContent = `Tap a ${b.kind === 'house' ? 'level' : 'floor'} to see what's on it. Then move the down payment slider: the ${b.kind === 'house' ? 'levels' : 'floors'} fill with gold to show what you pay up front.`;
    }
    if (use3D) {
      idle().then(async () => {
        if (!root.isConnected) return;
        try {
          const { mountModel } = await import('../three/model.js');
          if (!root.isConnected) return;
          model = mountModel(q('[data-model]'), {
            spec: b, mine,
            onHover: (f, e) => {
              if (f < 0) { tip.hidden = true; return; }
              tip.hidden = false;
              tip.textContent = b.kind === 'house' ? floorInfo(l, b, f).title : `Floor ${f + 1}`;
              const r = stage.getBoundingClientRect();
              if (e) tip.style.transform = `translate(${e.clientX - r.left + 16}px, ${e.clientY - r.top - 12}px)`;
            },
            onSelect: showFloor,
          });
          model.setFill(fill, true);
          cleanups.push(() => model.dispose());
        } catch (err) {
          console.warn('3D model unavailable, using the floor diagram', err);
          stage.classList.remove('is-3d');
        }
      });
    }
  } else {
    // plots: an outline that fills with gold
    const [w, d] = l.plot;
    const W = 300, H = Math.round((300 * d) / w);
    const plot = q('[data-plot]');
    plot.hidden = false;
    stage.classList.add('is-plot');
    plot.innerHTML = `<svg viewBox="-40 -40 ${W + 80} ${H + 80}" aria-hidden="true">
        <defs><clipPath id="plotClip"><rect x="0" y="0" width="${W}" height="${H}"/></clipPath></defs>
        <rect class="plot-fill" x="0" y="${H}" width="${W}" height="0" clip-path="url(#plotClip)" data-plot-fill/>
        <rect class="plot-line" x="0" y="0" width="${W}" height="${H}" pathLength="1"/>
        <text x="${W / 2}" y="-14" text-anchor="middle">${w} ft</text>
        <text x="${W + 16}" y="${H / 2}" text-anchor="middle" transform="rotate(90 ${W + 16} ${H / 2})">${d} ft</text>
        <text class="plot-road" x="${W / 2}" y="${H + 30}" text-anchor="middle">Road</text>
      </svg>`;
    panel.innerHTML = `<p class="label">${esc(l.locality)}</p><h3 class="display">${esc(sizeLabel(l))} plot</h3><p class="panel-hint">${w} by ${d} feet, ${esc(l.status.toLowerCase())}. Move the slider and the plot fills with gold to show your down payment.</p>`;
    q('[data-ex-eyebrow]').textContent = 'Plan & payments';
    q('[data-ex-title]').innerHTML = 'The plot,<br><em>and how to pay for it.</em>';
    q('[data-ex-lead]').textContent = 'See the plot\'s shape and frontage, then work out an installment plan that suits you.';
  }

  /* ---------- the installment calculator ---------- */
  const calc = q('[data-calc]');
  let years = 3;
  calc.innerHTML = `
    <div class="calc-head"><h3 class="display">Installment plan</h3><span class="calc-price">${price(l.price)}</span></div>
    <div class="calc-row">
      <label for="dp" class="label">Down payment</label>
      <output for="dp" data-dp-out></output>
    </div>
    <input type="range" id="dp" name="dp" min="10" max="60" step="5" value="30" class="range" data-dp>
    <div class="calc-row"><span class="label">Pay the rest over</span></div>
    <div class="seg seg-years" role="group" aria-label="Years">${[1, 2, 3, 4, 5].map((y) => `<button type="button" data-y="${y}" aria-pressed="${y === years}">${y} yr</button>`).join('')}</div>
    <dl class="calc-out">
      <div><dt>Paid up front</dt><dd data-o-dp></dd></div>
      <div><dt>In installments</dt><dd data-o-rest></dd></div>
      <div class="calc-month"><dt data-o-n></dt><dd data-o-month></dd></div>
    </dl>
    <p class="calc-legend"><span class="swatch" aria-hidden="true"></span><span data-legend></span></p>
    <p class="calc-note">An illustrative plan with no markup. Final terms depend on the seller or developer.</p>`;
  const dp = calc.querySelector('[data-dp]');
  const shown = { month: 0 };
  function update() {
    const pct = Number(dp.value);
    fill = pct / 100;
    const upfront = l.price * fill, rest = l.price - upfront, n = years * 12, monthly = rest / n;
    calc.querySelector('[data-dp-out]').textContent = `${pct}% · ${price(upfront)}`;
    calc.querySelector('[data-o-dp]').textContent = price(upfront);
    calc.querySelector('[data-o-rest]').textContent = price(rest);
    calc.querySelector('[data-o-n]').textContent = `${n} monthly installments of`;
    dp.style.setProperty('--fill', `${((pct - 10) / 50) * 100}%`);
    const out = calc.querySelector('[data-o-month]');
    const fmtM = (v) => 'Rs ' + Math.round(v).toLocaleString('en-PK');
    if (REDUCED) out.textContent = fmtM(monthly);
    else gsap.to(shown, { month: monthly, duration: 0.6, ease: 'expo.out', overwrite: true, onUpdate: () => (out.textContent = fmtM(shown.month)), onComplete: () => (out.textContent = fmtM(monthly)) });
    clearTimeout(update.t); update.t = setTimeout(() => (out.textContent = fmtM(monthly)), 800);
    // what lights up: gold floors, gold bars, or a gold share of the plot
    const litFloors = Math.round(fill * floors);
    calc.querySelector('[data-legend]').textContent = b
      ? `Gold ${b.kind === 'house' ? 'levels' : 'floors'}: the ${pct}% you pay up front (${litFloors} of ${floors}). The rest is spread over ${years} year${years > 1 ? 's' : ''}.`
      : `Gold: the ${pct}% you pay up front. The rest is spread over ${years} year${years > 1 ? 's' : ''}.`;
    model?.setFill(fill);
    stack.querySelectorAll('[data-floor]').forEach((el) => el.classList.toggle('is-lit', Number(el.dataset.floor) < fill * floors - 0.001));
    const pf = q('[data-plot-fill]');
    if (pf) { const H = Number(pf.getAttribute('y')) + Number(pf.getAttribute('height')); pf.setAttribute('y', H * (1 - fill)); pf.setAttribute('height', H * fill); }
  }
  dp.addEventListener('input', update);
  calc.addEventListener('click', (e) => {
    const y = e.target.closest('[data-y]');
    if (!y) return;
    years = Number(y.dataset.y);
    calc.querySelectorAll('[data-y]').forEach((x) => x.setAttribute('aria-pressed', String(x === y)));
    update();
  });
  calc.addEventListener('submit', (e) => e.preventDefault());
  update();

  /* ---------- similar ---------- */
  const similar = LISTINGS.filter((x) => x.id !== l.id && (x.type === l.type || x.area === l.area)).sort((a, c) => Math.abs(a.price - l.price) - Math.abs(c.price - l.price)).slice(0, 3);
  q('[data-similar]').innerHTML = similar.map(cardHTML).join('');
  cleanups.push(wireCards(q('[data-similar]')));

  return () => cleanups.forEach((fn) => fn());
}
