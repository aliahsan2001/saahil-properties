/* Thin-line icon sprite, injected once outside the page container. */

const P = {
  arrow: ['M4 12h16M14 6l6 6-6 6'],
  back: ['M20 12H4M10 6l-6 6 6 6'],
  close: ['M6 6l12 12M18 6L6 18'],
  check: ['M5 12.5l4.5 4.5L19 7.5'],
  plus: ['M12 5v14M5 12h14'],
  phone: ['M5 3h3.5l1.7 4.4-2.3 1.4a11 11 0 0 0 7.3 7.3l1.4-2.3L21 15.5V19a2 2 0 0 1-2 2A16 16 0 0 1 3 5a2 2 0 0 1 2-2z'],
  wa: ['M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.8 21.2l4.6-1.2A9.2 9.2 0 1 0 12 2.8z', 'M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1a5 5 0 0 1-2.9-2.9l1-1-1-2-1.6 1z'],
  mail: ['M3 6h18v12H3z', 'M3 7l9 6 9-6'],
  pin: ['M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z', 'M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'],
  clock: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z', 'M12 7v5l3 2'],
  bed: ['M3 18V7M3 13h18v5M21 18v-3a4 4 0 0 0-4-4h-7v2', 'M7 11a2 2 0 1 0 0-.01'],
  bath: ['M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2z', 'M6 12V6a2 2 0 0 1 4 0', 'M7 19l-1 2M17 19l1 2'],
  area: ['M4 4h16v16H4z', 'M4 9h3M4 14h3M9 4v3M14 4v3'],
  wave: ['M2 15c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2', 'M2 19c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2', 'M15 4a4 4 0 0 1 4 4'],
  school: ['M2 9l10-5 10 5-10 5z', 'M6 11v5c3 2.5 9 2.5 12 0v-5', 'M22 9v6'],
  hospital: ['M4 4h16v16H4z', 'M12 8v8M8 12h8'],
  search: ['M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z', 'M20 20l-4-4'],
  building: ['M6 21V4h9v17', 'M15 9h4v12', 'M3 21h18', 'M9 8h3M9 12h3M9 16h3'],
  home: ['M3 11l9-7 9 7', 'M5 10v10h14V10', 'M10 20v-6h4v6'],
  plot: ['M4 4h16v16H4z', 'M4 12h16M12 4v16'],
  rotate: ['M20 12a8 8 0 1 1-2.3-5.6', 'M20 4v5h-5'],
  layers: ['M12 3l9 5-9 5-9-5z', 'M3 13l9 5 9-5'],
  cube: ['M12 3l8 4.5v9L12 21l-8-4.5v-9z', 'M12 12l8-4.5M12 12v9M12 12L4 7.5'],
  key: ['M14 10a4 4 0 1 0-1.2 2.8L20 20M17 17l2-2'],
  doc: ['M6 3h9l4 4v14H6z', 'M14 3v5h5', 'M9 13h7M9 17h5'],
  spark: ['M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18'],
};

export function injectIcons() {
  if (document.getElementById('i-arrow')) return;
  const symbols = Object.entries(P).map(([n, ds]) =>
    `<symbol id="i-${n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${ds.map((d) => `<path d="${d}"/>`).join('')}</symbol>`).join('');
  document.body.insertAdjacentHTML('afterbegin', `<svg xmlns="http://www.w3.org/2000/svg" style="display:none">${symbols}</svg>`);
}
