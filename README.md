# The Ranch — Booking Engine Prototype

A configurable booking flow for The Ranch (Malibu, CA · Hudson Valley, NY), built on the
Dolli white-label base (React 19, Vite, Tailwind 4) and restyled to the client's Figma
"Web Build 2026" system. Wireframes come from the Figma "Booking Engine wires" file.

## Run it

```bash
npm install
npm run dev
```

Other scripts: `npm run build`, `npm run preview`, `npm run lint`.

## The flow

Home → *(Location)* → Program (rooms & guests, fixed-block dates, extra night) → Rooms →
*(Upgrade)* → *(Add-ons)* → Checkout (guest details, payment) → Confirmation.

Bracketed steps exist only when the configuration asks for them — the route is not
registered and the component is not mounted.

## Configuring it

The config panel is hidden by default. Reveal it with **Ctrl/Cmd + `.`** or `?config=on`.
Every switch is mirrored into the URL so a configuration can be shared as a link.
Presets: **Ranch full flow** (default) · **Single property** · **No upsells**.

## Where things are

| Path | Role |
| --- | --- |
| `docs/BRIEF.md` | The build brief: flow, screen specs, data, definition of done |
| `docs/DESIGN-TOKENS.md` | Colour, type, spacing, component specs extracted from Figma |
| `docs/PRODUCTION-NOTES.md` | Warnings list — licensing, unverified content, gaps |
| `docs/figma/` | Frame renders and design-context dumps used for the build |
| `docs/screens/` | Verification screenshots per step |
| `src/index.css` | Tailwind `@theme` — the single source of truth for tokens |
| `src/data.js` | Ranch catalogue: properties, rooms, add-ons, retreats, fees |
| `src/stay.js` | Stay-block rules (check-in days, valid check-outs, extra night) |
| `src/store.jsx` | Booking state (sessionStorage), pricing, multi-room helpers |
| `src/config.jsx` | Option schema, presets, URL encoding, flow steps |
| `src/components/ui/` | Button, Field, Counter, Chip, Checkbox, Accordion, Modal |
| `src/components/Calendar.jsx` | `RanchCalendar` |
| `src/pages/` | One component per step |

Booking state lives in `sessionStorage` under `dolli-booking`, config under `dolli-config`.
