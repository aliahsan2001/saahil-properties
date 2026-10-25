# Saahil Properties: "From blueprint to skyline"

Concept project 4 of 8 for the Aqoa Systems portfolio. A fictional real estate agency selling apartments, houses and plots in DHA and Clifton, Karachi.

## What's in it
| Page | Signature moment |
|---|---|
| Home | A pencil sketch of a sea-facing tower draws itself on drafting paper. As you scroll, colour climbs the tower from the ground up, the paper becomes sky and sea, the glass picks up reflections and the evening lights come on. The search bar rises from the waterline. |
| Listings | Photos sit in soft arch and leaf-shaped windows that morph on hover. Changing a filter makes cards glide into their new order (GSAP Flip) instead of jumping. Travel times to the beach, a school and a hospital count up when you hover a card. |
| Property | "Explore in 3D" shows the building as a model you can turn. Hover a floor to highlight it and click it to see its units, including which are sold, reserved or free. Plots get a plot outline instead. |
| Sell | A four-step valuation. Each finished step draws more of a house outline, the windows light up at the end, and the visitor gets a price range and a reference. |
| Contact | Agent portraits float at slightly different depths and shift as you move the mouse. Text sharpens from a blur as you read. |
| 404 | A house sketch draws itself: "This page isn't on the plans." |

**Signature interaction:** the installment calculator is tied to the 3D building. Drag the down-payment slider and floors fill with warm gold light, showing at a glance what share you pay up front and what stays in installments.

Also included:
- A vertical-blind page transition: slats swing shut and open, each revealing a slice of the next page.
- A "View" cursor ring over properties.
- A WhatsApp enquiry on every property, with the listing already named.

The site has no sound, by design.

## Stack
Vite · Three.js · GSAP (ScrollTrigger, Flip) · Lenis · Barba.js · SplitType

The buildings are procedural, so there are no model files. One shader draws both the pencil sketch (paper, hatching, graphite lines) and the finished render (stone, reflective glass, window lights).

## Run it
From a terminal:
```bash
npm install
npm run dev
```
The site uses ES modules, so it needs a server. Opening `index.html` by double-clicking won't work. Testing flags: `?lite` forces the lighter version, `?full` forces 3D.

## Deploy on Vercel
Import the repo, leave **Root Directory** at the repository root (`./`), and keep the detected **Vite** preset. `vercel.json` turns on clean URLs. Property pages use `/property?id=…`.

## Phones and lighter devices
- **Home hero:** the sketch-to-skyline reveal plays as pre-rendered frames scrubbed by scroll. There are 10 portrait and 10 landscape frames in `public/img/hero/`.
- **Property page:** the 3D building becomes a tappable floor diagram that fills with gold in the same way.

Reduced-motion visitors get the finished hero and simple fades.

## Before publishing
- Search "Saahil Properties Karachi" on Google to check no real agency uses the name.
- Listings, buildings, prices, agents and the address are placeholders. Everything lives in `src/data.js`.
- Unit availability and the valuation rates are sample data. A real agency would add an admin panel to add listings and mark them sold, and a CRM for leads, as the brief suggests.
- Agents are shown as monogram portraits rather than stock photos, since they're fictional people.

Photos from Unsplash (free licence), self-hosted as WebP in `public/img/p/`.
