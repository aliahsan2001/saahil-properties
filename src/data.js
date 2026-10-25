/* Saahil Properties — site data. Listings, buildings and agents all live here.
   People, prices, numbers and addresses are placeholders for this concept. */

export const img = (id, w = 800) => `/img/p/${id}-${w > 700 ? 1280 : 640}.webp`;

export const CONFIG = {
  name: 'Saahil Properties',
  // Empty for the concept so WhatsApp lets the visitor choose a chat.
  whatsappNumber: '',
  phoneDisplay: '+92 21 3584 0000',
  phoneHref: 'tel:+922135840000',
  email: 'hello@saahil.example',
  address: 'Saahil House, 14-C Khayaban-e-Bukhari, DHA Phase 6, Karachi',
  hours: 'Mon – Sat, 11 am – 8 pm · Sunday by appointment',
};

/* Buildings that can be explored in 3D. kind: tower or house.
   twist: degrees each floor turns; plan: footprint width x depth. */
export const BUILDINGS = {
  'sea-crest': { name: 'Sea Crest Residences', kind: 'tower', floors: 32, twist: 0.9, plan: [3.2, 2.2], unitsPerFloor: 4 },
  'coral-point': { name: 'Coral Point Tower', kind: 'tower', floors: 28, twist: 0, plan: [3.6, 2.4], unitsPerFloor: 4 },
  villa: { name: 'Villa', kind: 'house', floors: 3, plan: [6, 4.2] },
  house: { name: 'House', kind: 'house', floors: 2, plan: [5, 3.6] },
};

export const TYPES = ['Apartment', 'House', 'Plot'];
export const AREAS = ['DHA', 'Clifton'];

/* price in rupees. size: sq ft for apartments, sq yd for houses and plots.
   travel: minutes by car to the beach, a school and a hospital. */
export const LISTINGS = [
  {
    id: 'sea-crest-2402', title: 'Sea-facing 3-bed on the 24th floor', type: 'Apartment', area: 'Clifton', locality: 'Clifton Block 2',
    price: 95000000, beds: 3, baths: 3, size: 2450, unit: 'sq ft', building: 'sea-crest', floor: 24, status: 'Ready',
    photos: ['1767055114909-1170503862f1', '1702830499141-a0634d87d6af', '1758448511322-8bfc73daf606', '1616594039964-ae9021a400a0', '1671197244266-73129c97c096'],
    travel: { beach: 4, school: 8, hospital: 10 },
    blurb: 'Floor-to-ceiling glass on three sides and the Arabian Sea from every room. A corner unit with a wraparound balcony, servant quarter and two parking spaces.',
    features: ['Corner unit', 'Wraparound balcony', 'Two parking spaces', 'Servant quarter', 'Gym and pool', 'Backup power'],
  },
  {
    id: 'sea-crest-1105', title: 'Two-bed with a sea balcony', type: 'Apartment', area: 'Clifton', locality: 'Clifton Block 2',
    price: 58000000, beds: 2, baths: 2, size: 1650, unit: 'sq ft', building: 'sea-crest', floor: 11, status: 'Ready',
    photos: ['1714919286244-6f3f6cce6e65', '1757924461488-ef9ad0670978', '1765862835260-47843a7bba45'],
    travel: { beach: 4, school: 8, hospital: 10 },
    blurb: 'A calm two-bed facing the water, with an open kitchen and a balcony big enough for breakfast. Ideal first home or rental.',
    features: ['Sea-facing balcony', 'Open kitchen', 'One parking space', 'Gym and pool', 'Backup power'],
  },
  {
    id: 'sea-crest-0603', title: 'One-bed with a view of the bay', type: 'Apartment', area: 'Clifton', locality: 'Clifton Block 2',
    price: 32000000, beds: 1, baths: 1, size: 980, unit: 'sq ft', building: 'sea-crest', floor: 6, status: 'Installments',
    photos: ['1689717887631-088197cdc2ca', '1628592102751-ba83b0314276'],
    travel: { beach: 4, school: 8, hospital: 10 },
    blurb: 'A compact one-bed on an easy installment plan. Bright, low-maintenance and a short walk to the promenade.',
    features: ['Installment plan', 'Bay view', 'Fitted wardrobes', 'Gym and pool'],
  },
  {
    id: 'coral-point-ph', title: 'Penthouse with a rooftop terrace', type: 'Apartment', area: 'DHA', locality: 'DHA Phase 8',
    price: 240000000, beds: 4, baths: 5, size: 5200, unit: 'sq ft', building: 'coral-point', floor: 28, status: 'Ready',
    photos: ['1776363116182-51694a04a1d5', '1776363284806-873eeef565a7', '1598928506311-c55ded91a20c', '1784653549288-07343300a44f'],
    travel: { beach: 3, school: 9, hospital: 12 },
    blurb: 'The whole top floor of Coral Point: four suites, a private lift lobby and a planted rooftop terrace looking across the sea and the city.',
    features: ['Private lift lobby', 'Rooftop terrace', 'Four suites', 'Three parking spaces', 'Concierge', 'Backup power'],
  },
  {
    id: 'coral-point-1601', title: 'Three-bed family apartment', type: 'Apartment', area: 'DHA', locality: 'DHA Phase 8',
    price: 115000000, beds: 3, baths: 4, size: 2800, unit: 'sq ft', building: 'coral-point', floor: 16, status: 'Installments',
    photos: ['1703224204050-695c5dffc734', '1680416124510-5eae1beca412', '1505693416388-ac5ce068fe85'],
    travel: { beach: 3, school: 9, hospital: 12 },
    blurb: 'A generous family layout on the 16th floor with a separate family lounge, two balconies and space for a study.',
    features: ['Family lounge', 'Two balconies', 'Study', 'Two parking spaces', 'Kids play area'],
  },
  {
    id: 'dha8-villa', title: '1,000-yard villa with a pool', type: 'House', area: 'DHA', locality: 'DHA Phase 8',
    price: 380000000, beds: 6, baths: 7, size: 1000, unit: 'sq yd', building: 'villa', status: 'Ready',
    photos: ['1613490493576-7fde63acd811', '1706808849780-7a04fbac83ef', '1600210491892-03d54c0aaf87', '1544984243-ec57ea16fe25'],
    travel: { beach: 5, school: 7, hospital: 11 },
    blurb: 'Architect-designed and newly finished: double-height living, a pool deck off the lounge and a basement with a home theatre.',
    features: ['Swimming pool', 'Basement', 'Home theatre', 'Double-height lounge', 'Solar system', 'Four-car porch'],
  },
  {
    id: 'dha6-house', title: 'Modern 500-yard house', type: 'House', area: 'DHA', locality: 'DHA Phase 6',
    price: 165000000, beds: 5, baths: 6, size: 500, unit: 'sq yd', building: 'house', status: 'Ready',
    photos: ['1721815693498-cc28507c0ba2', '1738168246881-40f35f8aba0a', '1600489000022-c2086d79f9d4'],
    travel: { beach: 7, school: 4, hospital: 8 },
    blurb: 'Clean lines on a quiet Phase 6 lane, a short drive from Khayaban-e-Ittehad. Five bedrooms, a family lounge upstairs and a landscaped lawn.',
    features: ['Lawn', 'Family lounge', 'Servant quarter', 'Two-car porch', 'Solar system'],
  },
  {
    id: 'dha7-house', title: '300-yard house, ready to move in', type: 'House', area: 'DHA', locality: 'DHA Phase 7 Extension',
    price: 90000000, beds: 4, baths: 5, size: 300, unit: 'sq yd', building: 'house', status: 'Ready',
    photos: ['1722421492323-eaf9c401befe', '1719887805632-de5be825f72b'],
    travel: { beach: 9, school: 5, hospital: 9 },
    blurb: 'A well-kept four-bed in a family street, with a separate drawing room and a rooftop that catches the evening breeze.',
    features: ['Drawing room', 'Roof terrace', 'One-car porch', 'Near a park'],
  },
  {
    id: 'clifton-bungalow', title: '600-yard bungalow in Block 4', type: 'House', area: 'Clifton', locality: 'Clifton Block 4',
    price: 210000000, beds: 6, baths: 6, size: 600, unit: 'sq yd', building: 'villa', status: 'Ready',
    photos: ['1602343168117-bb8ffe3e2e9f', '1600596542815-ffad4c1539a9', '1757924461488-ef9ad0670978'],
    travel: { beach: 6, school: 3, hospital: 5 },
    blurb: 'A rare bungalow on a tree-lined Clifton street, a few minutes from the best schools and hospitals in the city.',
    features: ['Corner plot', 'Mature trees', 'Annexe', 'Four-car porch', 'Swimming pool'],
  },
  {
    id: 'dha8-plot-1000', title: '1,000-yard residential plot', type: 'Plot', area: 'DHA', locality: 'DHA Phase 8, Zone A',
    price: 220000000, size: 1000, unit: 'sq yd', status: 'Transfer ready', plot: [100, 90],
    photos: ['1747854805840-9be7d5e360e6'],
    travel: { beach: 4, school: 10, hospital: 13 },
    blurb: 'A clear, transfer-ready plot two streets from the sea, in one of the most sought-after zones of Phase 8.',
    features: ['Transfer ready', 'Two streets from the sea', 'Park facing', 'All dues clear'],
  },
  {
    id: 'dha8-plot-500', title: '500-yard plot near the boulevard', type: 'Plot', area: 'DHA', locality: 'DHA Phase 8 Extension',
    price: 85000000, size: 500, unit: 'sq yd', status: 'Installments', plot: [50, 90],
    photos: ['1764223531702-1614efb82e40'],
    travel: { beach: 6, school: 11, hospital: 14 },
    blurb: 'A rectangular 500-yard plot close to the main boulevard. Payable in installments over two years.',
    features: ['Installment plan', 'Near the boulevard', 'West open', 'All dues clear'],
  },
  {
    id: 'clifton-commercial', title: 'Commercial plot in Block 5', type: 'Plot', area: 'Clifton', locality: 'Clifton Block 5',
    price: 140000000, size: 200, unit: 'sq yd', status: 'Transfer ready', plot: [30, 60],
    photos: ['1777268209440-296c2bb6facf'],
    travel: { beach: 7, school: 4, hospital: 4 },
    blurb: 'A commercial plot on a busy Block 5 road, approved for ground plus six. Suited to offices, a clinic or a showroom.',
    features: ['Commercial approval', 'Ground + 6 floors', 'Main road', 'Transfer ready'],
  },
];

export const AGENTS = [
  { name: 'Sameer Lakhani', role: 'Clifton apartments', years: 11, tone: '#c9a45c', line: 'I have walked every floor of every sea-facing tower in Clifton.' },
  { name: 'Ayesha Rahim', role: 'DHA houses', years: 9, tone: '#b8a48c', line: 'A good house is the street, the light and the neighbours. I show you all three.' },
  { name: 'Faraz Siddiqui', role: 'Plots and investment', years: 14, tone: '#8f9a8a', line: 'I check the file before I show you the plot. Every time.' },
  { name: 'Nida Qureshi', role: 'Valuations and selling', years: 7, tone: '#a8928a', line: 'Price it right on day one and it sells in weeks, not months.' },
];

export const STATS = [
  { value: 140, suffix: '+', label: 'live listings in DHA and Clifton' },
  { value: 12, label: 'years selling on the coast' },
  { value: 2300, suffix: '+', label: 'families moved in' },
  { value: 46, label: 'days, our average time to sell' },
];

// rupees as crore or lakh, the way buyers here say it
export function price(n) {
  if (n >= 1e7) return `Rs ${(n / 1e7).toFixed(2).replace(/\.?0+$/, (m) => (m.startsWith('.') ? '' : m)).replace(/(\.\d)0$/, '$1')} crore`;
  if (n >= 1e5) return `Rs ${(n / 1e5).toFixed(1).replace(/\.0$/, '')} lakh`;
  return 'Rs ' + Math.round(n).toLocaleString('en-PK');
}

export const sizeLabel = (l) => `${l.size.toLocaleString('en-PK')} ${l.unit}`;
