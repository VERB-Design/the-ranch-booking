# The Ranch — Booking Engine Build Brief

**Client:** The Ranch (Malibu, CA · Hudson Valley, NY) — a structured wellness-retreat programme,
sold in fixed-length stays with everything included.
**Base:** cloned from `white-label-booking/dolli` (React 19 + Vite + Tailwind 4, react-router 7,
sessionStorage store, config panel). Keep the white-label machinery: config panel, URL config
params, session store, `ConfigSync`, route-gating by config, toasts.
**Wires:** Figma "The Ranch — Booking Engine wires" node 370:5151 — renders in `docs/figma/wires/`.
**Style:** `docs/DESIGN-TOKENS.md` + `docs/figma/styles/`.
**Voice:** warm, confident, quietly upscale. No "Discover / Experience / Indulge / Elevate", no
exclamation marks.

---

## 1. The flow

**Config switch `entry` (URL param `entry`), default `drawer`.** Revised 3 Sep 2026: Location,
Program's rooms & guests, and its fixed-block dates all moved into the booking drawer
(`ReserveDrawer`), so the flow itself now depends on which entry mode is set. The stepper is still
the spec for whichever mode is live — `flowSteps(config)` in `src/config.jsx` is the one source
both the Stepper and the Continue buttons read.

**`entry=drawer` (default) — 4 steps.** Location, rooms & guests, and dates are all chosen in the
drawer before the flow starts; `/location` and `/program` are not registered as routes at all (the
Dolli rule — a route that does not exist rather than one that exists and redirects), so a stray
link to either falls through to the catch-all and returns home.

| # | Step | Route | Notes |
|---|---|---|---|
| 1 | Rooms | `/rooms` | Horizontal cards, one selection per room in the booking. **Most important.** |
| 2 | Upgrades | `/upgrade` | One better room offered as "$25 more / night". Skippable. Config `showUpgrades`. |
| 3 | Add-ons | `/add-ons` | Accordion of treatments/experiences with day · time · party size. Config `showAmenities`. |
| 4 | Checkout | `/checkout` → `/confirmation` | Guest details per guest + payment, then confirmation. |

**`entry=pages` — the original 7 steps**, unchanged in behaviour:

| # | Step | Route | Wire | Notes |
|---|---|---|---|---|
| 1 | Location | `/location` | 01 | Two cards: Malibu, Hudson Valley. Only when `multiProperty` on. |
| 2 | Program select | `/program` | 02a–c | Rooms & guests + fixed-block date picker. **Most important.** |
| 3 | Extensions | `/program#extension` | — | No wire frame. Lives inside step 2 as the "+ 1 extra night" option (stays ending Thursday). Stepper shows it as a step that is auto-completed with step 2. Config switch `extensions` on/off. |
| 4 | Room select | `/rooms` | 03a–b | Horizontal cards, one selection per room in the booking. **Most important.** |
| 5 | Upgrades | `/upgrade` | 04 | One better room offered as "$25 more / night". Skippable. Config `showUpgrades`. |
| 6 | Add-ons | `/add-ons` | 05a–d | Accordion of treatments/experiences with day · time · party size. Config `showAmenities`. |
| 7 | Checkout | `/checkout` → `/confirmation` | 06, 07 | Guest details per guest + payment, then confirmation. |

Landing (`/`) stays as the entry in both modes: a Ranch hero with a "Book now" button that opens
the styled vertical booking widget (Figma "Booking Widgets" — now Location, Rooms & Guests, Promo,
Check-in/Check-out, calendar, CHECK RATES — see section 3, "Drawer entry"). Submitting always
lands on `flowSteps(config)[0].path` — `/rooms` in drawer mode, `/location` or `/program` in pages
mode — so the drawer never disagrees with what the Stepper calls step 1.

The **Rooms and Upgrade steps are the priority** (drawer mode's steps 1–2; pages mode's steps 4–5).
Get the drawer → Room → Upgrade pixel-faithful before polishing add-ons and checkout.

## 2. Page shell (every step)

```
Header   80px · wordmark left (public/brand/the-ranch.svg, ~150px wide) · optional phone right
Stepper  full-width band, background/light, 1px border top+bottom, 7 numbered items
         current: filled dark circle + dark label · done: outlined dark circle, muted label
         upcoming: outlined #999 circle, muted label · done steps are links back
Content  max 1440, px 160 at xl · grid: main (flex-1) + right rail 320px · gap 32 · py 32
Rail     "YOUR STAY" summary card (title band, rows PROPERTY / ROOMS / GUESTS / DATES / NIGHTS,
         then ROOM, ENHANCEMENTS, TAXES & FEES as they exist, TOTAL band at the bottom)
         + "Every Stay Includes" card (4 icon rows). Rail is sticky under the chrome.
Footer   Button bar: border-top, "← Back" text button left, "Continue →" primary right,
         sticky to the viewport bottom on desktop, always visible on mobile.
         Continue is disabled (30% opacity) until the step is valid.
```
Mobile (<1024): rail collapses to a "Your stay · $4,379" bar above the button bar that expands
into a sheet; cards stack; calendar is single-month.

## 3. Step specs

### 1 · Location (wire 01)
H1 "Choose your location" + sub "Select the property you would like to book." Two cards
(image 258px, name, "Malibu, California" / "Hudson Valley, New York" category line, one-line
description). Clicking a card selects it and continues. Use the property lockup logos on the cards.

### 2 · Program select (wires 02a–02c v2) — PRIORITY
Revised 3 Sep 2026 against the v2 wires — a flow change, not a restyle; every token and component
below is the same one the v1 pass built, doing more in the right order. Two sections separated by
a rule, plus a property-aware header.

**Header** — once a property is chosen (from Program onward, and on Confirmation), the wordmark
becomes that property's own lockup (`the-ranch-malibu.svg` / `the-ranch-hudson-valley.svg`, alt =
the property's full name). Home and Location, where no property is chosen yet, keep the plain
wordmark. The footer wordmark follows the same rule.

**ADD ROOMS & GUESTS** (eyebrow) — helper "Maximum 2 adult guests per room. For more information,
call +1 555 555-5555." Room chips: "ROOM 01" with a Guests counter (min 1, max 2), "ROOM 02" …,
plus a dashed "+ Add Room" tile (max 4 rooms). Removing a room is an "×" on the chip. Guests are
adults only (no children — the Ranch is adults-only). This replaces Dolli's ReserveDrawer party
picker for this step. Unchanged from v1.

**CHOOSE YOUR DATES** (eyebrow) — helper: "Stays run in blocks of 3 nights, 4 nights, and 7
nights. Guests can add an extra night to stays ending on Thursdays."
- **State A "Select check-in"**: single calendar, only valid check-in days are enabled (Sundays
  and Thursdays at Hudson; Saturdays and Sundays at Malibu). Available days render as a **brown
  tint** (`brown-100` fill + a thin `accent-focus` border — never grey; the client was confused by
  it), disabled days stay plain `disabled` text with no fill. A retreat check-in day carries the
  same tint with a heavier 2px `accent` border in place of the thin one. Legend: "check-in
  available" / "special retreat — see details below," swatches matching the cell fills exactly.
  Every retreat at the property landing in the visible month renders as a card stacked below the
  calendar (bordered, accent hairline, a date-range chip, the name, "Learn more") — not a click
  popover. Multiple retreats stack; the list re-renders on month change.
- **State B "Select check-out"**: check-in shown as a filled date field above; valid check-outs
  from that check-in are enabled, same tint/border treatment. A check-out date carries the retreat
  marker when the *resulting stay* would pass through a retreat check-in, not only when check-out
  lands on the retreat day itself. Legend: "check-in date" (solid `accent` fill — the chosen day),
  "check-out available," "dates include special retreat — see below for details." The same retreat
  cards remain stacked below the calendar. Picking any date, retreat or not, commits immediately —
  no interruption; "Learn more" is the only way into the retreat's own modal (name, dates,
  one-line description, "Choose these dates" — sets check-in, and check-out too when this check-in
  day has exactly one 3-night option).
- **State C both chosen**: Check-in and Check-out fields **side by side**, no calendar. Beneath
  them, a summary card replaces the bare nights line: an h5 serif heading ("{N}-night stay"), a
  one-line description built from `D.includes` ("{N}-night stay at {property} — includes daily
  massage, daily hikes, and all meals."), and — only when the stay contains a retreat — "Includes
  a special retreat." followed by that retreat's own card, nested. The property's extension
  checkbox (Malibu's Saturday pre-night / Hudson's Friday post-night, when
  `canExtend(pid, checkIn, checkOut)`) lives inside this same card, below the description; ticking
  it updates both the heading and the rail's NIGHTS.
- Continue enables only when both dates are set.
- Rail shows PROPERTY, ROOMS, GUESTS before dates are set; DATES and NIGHTS join once both are
  picked.

Calendar visuals follow Figma Booking Widgets: Inter, 32px cells, `accent` range/chosen fill,
`brown-100` available tint, `disabled` text with no fill for blocked days. Month heading Inter
Light 20 with arrow controls. Full contrast values, the Hudson retreat data added for this pass,
and the fee-modal copy discrepancy are in the build report for this task, not restated here.

### 4 · Room select (wires 03a–03b) — PRIORITY
H1 "Select your room" + sub "Choose the room you want to stay in."
**Card = horizontal**: square image (aspect 1:1, ~394px) left; right: name (h-ish 20px) + detail
line ("King bed · 450 sq ft · Garden view"); price block right-aligned: "$567/night", "Or $4,567
total", "inc. taxes & fees" (underlined, opens a fee breakdown modal); description (2–3 lines);
amenity chips (bordered, 12px); ghost "Select Room" button. Selected: card gets a 2px dark
border + light fill, button becomes solid "Selected". Multi-room: "Choosing room 1 of 2" banner
from Dolli remains; a selected card per room. Rooms list is filtered to the chosen property.
Keep Dolli's `card` config option but make `horizontal-drawer` the Ranch default; the rate is
the programme rate (one rate per room), so no rate drawer — clicking Select assigns the room.
Room detail page (`/room/:id`) survives as "View details" link on the name.

### 5 · Upgrades (wire 04)
H1 "Upgrade your stay" + sub. One card in the same horizontal layout for the next room category
up: price shows "$25 more / night" + "Or $4,567 total"; button "Upgrade" → "Upgraded". Continue
always enabled (skip is fine). Rail gains the ROOM row ("Standard King · $1,234/night").

### 6 · Add-ons (wires 05a–05d)
H1 "Enhance your stay" + sub "Add treatments and enhancements." Accordion list in one bordered
card: row = name (20px), detail line, price "$35 per person" or a "FREE" chip, chevron.
Expanded panel (light grey fill): one-line description; DAY chips (dates of the stay); TIME
chips; PARTY SIZE stepper; summary line "Experience name · Thu, Aug 13 · 12:00 PM · Party of 2 ·
$70" + "Add to plan" primary. Added items appear in the rail under ENHANCEMENTS with
"1 guest, 7 Aug, 4:00 PM" and can be removed.

### 7 · Checkout (wire 06) and Confirmation (wire 07)
H1 "Guest Details" + sub "Please enter contact details for all guests." "Primary Contact" card:
First/Last, Email/Phone, Address, City/State, Country/Zip. Then one card per additional guest
("Guest 2") with checkbox "This is a gift – don't contact this guest" that hides email/phone.
Then payment (Dolli's card fields, restyled to the Fieldset spec) and "Complete booking".
Confirmation: centred, "Booking Confirmed", "A confirmation has been sent to {email}", reference
chip, "RESERVATION" card with all lines and TOTAL PAID band, "Make another booking" ghost button.

### Drawer entry — added 3 Sep 2026
`entry=drawer` (default) folds Location, Program's "rooms & guests," and "choose your dates" into
`ReserveDrawer` (`src/components/drawer/ReserveDrawer.jsx`, refactored out of the old flat
`src/components/ReserveDrawer.jsx`). Top to bottom, against the Figma "Vertical Booking Widget"
shell (460px right drawer, `--color-light`, CLOSE × top right, hairline rules, full-width primary
button):

- **Location** — the custom select, required first when `multiProperty` is on; changing it clears
  `checkIn`/`checkOut`/`extension` (the two properties run different stay rules) but keeps
  rooms/guests. No select at all when `multiProperty` is off — the single property is set.
- **Rooms & guests** — `RoomChips` (`src/components/booking/RoomChips.jsx`), the exact component
  the Program step renders: one bordered chip per room ("ROOM 01," a Guests counter, min 1 max 2),
  a dashed "+ Add Room" tile up to 4 rooms when `multiRoom` is on, an "×" to drop rooms past the
  first. At the drawer's 396px inner content width (460px panel − 64px `md:px-8` padding), two
  190px chips + one 16px gap land at exactly 396px — the two-per-row layout falls out of the
  existing sizing with no drawer-specific variant.
- **Promo code** with Apply, unchanged from the prior drawer.
- **Dates** — `DatePicker` (`src/components/booking/DatePicker.jsx`), the same three-state machine
  (A: bare calendar + stacked retreat cards; B: filled Check-in field + a check-out-restricted
  calendar; C: both fields side by side + the summary card with the nested retreat card and the
  property's extension checkbox) driven off the drawer's own local draft state instead of the
  store directly — Program.jsx drives the identical component off store state. One component, one
  place the state machine lives, for both entry modes. `RetreatModal` (opened from "Learn more")
  is a real nested dialog inside the drawer for the first time; the drawer's own Escape/Tab-trap
  handlers now check whether a nested `[role="dialog"]` holds focus before acting, so the two
  focus traps don't fight (see PRODUCTION-NOTES, "Accessibility").
- **CHECK RATES** — enabled once property + both dates are set and every room has ≥1 guest.
  Submitting writes property/rooms/dates/extension to the store (clearing room assignments only
  when the property changed) and navigates to `flowSteps(config)[0].path` — `/rooms` in drawer
  mode, `/location` or `/program` in pages mode, so Location and Program stay reachable through
  ordinary navigation in pages mode rather than only a typed URL.

Header's "Edit stay" opens the same drawer, pre-filled from the store, everywhere in the flow.
`/location` and `/program` pages (pages mode) import `RoomChips`/`DatePicker` from
`src/components/booking/` rather than duplicating them — the drawer and the step pages have never
had two copies of the room-chip layout or the date state machine to drift apart.

## 4. Data
Replace Dolli's placeholder catalogue with Ranch content in `src/data.js`:
- Properties: `malibu` (The Ranch Malibu, Malibu, California; transfer LAX) and `hudson`
  (The Ranch Hudson Valley, Sloatsburg, New York; transfer EWR). Each: 4–5 room categories with
  names, bed, sq ft, view, 3 amenities, description, nightly programme rate (Malibu ≈ $1,150–1,650;
  Hudson Valley ≈ $950–1,450), 1–2 images (placeholder blocks are fine, keep `.ph-img`).
- "Every Stay Includes": Daily massage · All meals and beverages · Hikes and daily classes ·
  Return transfer to EWR / LAX.
- Add-ons: 6–8 (Facial, Deep-tissue massage, Private yoga, Nutrition consult, Cold plunge
  session (FREE), Equine session (Hudson), Surf lesson (Malibu)…).
- Retreat dates: 2–3 flagged check-ins per property with a name ("Women's Retreat", "Founders
  Week").
- Fees: taxes & fees line, deposit and cancellation copy.

## 5. Config
Keep every existing switch. Add/adjust: `extensions` (extra night on/off), `retreats`
(special-retreat dates on/off), `maxGuestsPerRoom` fixed at 2, `card` default `horizontal`.
Remove `activities`/`dining`/`spa` experience routes (the Ranch programme is all-inclusive; the
Add-ons step covers it) — or leave them off by default and hidden from the panel. Presets: "Ranch
full flow" (default), "Single property", "No upsells".

## 6. Definition of done
- All seven steps render and link, Continue gating works, state survives refresh.
- Tokens live in `src/index.css` `@theme`; no hard-coded hex in components.
- Desktop (1440) and mobile (390) screenshots of every step in `docs/screens/`.
- `npm run build` passes; `npm run lint` passes.
- Warnings kept current in `docs/PRODUCTION-NOTES.md`.
