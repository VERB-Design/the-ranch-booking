# Accessibility Audit — The Ranch Booking Engine

Target: **WCAG 2.2 AA** (2.2-only criteria marked below; the common legal baseline for a US
hospitality client is 2.1 AA under the ADA — everything here also holds at 2.1, the 2.2 additions
are the ones marked `[2.2]`). Audited: 2 Sep 2026. Auditing + remediating in the same pass — fixes
are in place, not just reported. Scope: every route (`/`, `/location`, `/program`, `/rooms`,
`/room/:id`, `/upgrade`, `/add-ons`, `/checkout`, `/confirmation`) plus shared chrome (header,
stepper, sticky button bar, stay rail, drawer, toast) and `src/components/ui/` primitives. The
dev-only config panel was brought to the same floor at lower priority, per the brief.

**Method:** read every file under `src/` before touching anything; ran the app via
`npm run dev -- --port 5190`; verified with a headless Chromium + Playwright + `@axe-core/playwright`
scratch project (not added to the repo — see Reproducibility below), seeding
`sessionStorage['the-ranch-booking']` with `property: 'malibu'`, `checkIn: '2026-09-06'`,
`checkOut: '2026-09-13'`, one room `{ roomId: 'malibu-casita', adults: 2 }` (first id from
`D.roomsFor('malibu')`, per `src/store.jsx`'s actual shape). axe ran against all nine routes tagged
`wcag2a, wcag2aa, wcag21a, wcag21aa, wcag22aa`. Manual passes followed the SKILL's nine-part method:
structure, keyboard, semantics, contrast/colour, dynamic behaviour, forms, motion, adaptation,
media — axe catches roughly a third of real defects and nearly all of it is the cheap third.

## Summary

| | Before | After |
|---|---|---|
| axe violations (routes × rules) | 6 | **0** |
| axe failing nodes | 19 | **0** |
| Manual findings (structure/keyboard/semantics/motion) | — | ~15 found and fixed |

axe's 6 violations were all `color-contrast` / serious, and all one root cause manifesting across
six routes (see Finding A1). The single most important fix in this pass is **A2** — the focus ring
used everywhere in the app failed 3:1 against every dark-background control, including the primary
Continue/Complete-booking button on every step. `npm run lint` and `npm run build` are green after
every change in this pass.

## Axe results — before

```
home            0 violations
location        1 violation  (color-contrast, serious) — 6 nodes
program         1 violation  (color-contrast, serious) — 4 nodes
rooms           1 violation  (color-contrast, serious) — 3 nodes
room-detail     1 violation  (color-contrast, serious) — 3 nodes
upgrade         1 violation  (color-contrast, serious) — 2 nodes
add-ons         1 violation  (color-contrast, serious) — 1 node
checkout        0 violations
confirmation    0 violations
```
Every node: `Element has insufficient color contrast of 2.06 (foreground #b0b0b0, background
#fcf9f4, font size 12px, weight normal). Expected 4.5:1.` — the Stepper's "upcoming" step label.
Node counts track exactly how many stepper steps are still upcoming from that route (6 from
Location, down to 1 from Add-ons), confirming one root cause, not six.

## Axe results — after

```
home            0 violations
location        0 violations
program         0 violations
rooms           0 violations
room-detail     0 violations
upgrade         0 violations
add-ons         0 violations
checkout        0 violations
confirmation    0 violations
```

## Contrast table

Computed WCAG 2.x relative-luminance ratios (not screenshots). "Large text" = 24px regular or
18.66px bold, checked at the size that actually renders.

| Pair | Ratio | Verdict |
|---|---|---|
| `text-muted` #6d6d6d on `bg-light` #fcf9f4 | 4.93:1 | Pass (body text, 4.5 floor) |
| `text-muted` #6d6d6d on `bg-page` #f8f1e6 | 4.61:1 | Pass |
| `text-disabled` #b0b0b0 on `bg-light` #fcf9f4 | 2.07:1 | **Fails** 4.5:1 — acceptable *only* where the control is genuinely disabled (native `disabled` attribute) or a calendar day marked `aria-disabled` + unclickable. Real content read as "disabled" styling but not an actual disabled control is a defect — see Finding A1. |
| `text-disabled` #b0b0b0 on `bg-page` #f8f1e6 | 1.93:1 | Same rule |
| `text-disabled` #b0b0b0 on white | 2.17:1 | Same rule |
| `text-body` #4f4d4d on `bg-light` | 7.99:1 | Pass |
| `text-body` #4f4d4d on `bg-page` | 7.48:1 | Pass |
| `text-strong` #313030 on `bg-light` | 12.53:1 | Pass |
| `accent` #745a3b on `bg-page` (links) | 5.73:1 | Pass |
| `accent` #745a3b on `bg-light` | 6.12:1 | Pass |
| `accent` #745a3b on white | 6.43:1 | Pass |
| **`accent` #745a3b outline on `bg-dark` #262525 (old focus ring)** | **2.38:1** | **Fails** 3:1 (1.4.11, non-text UI) — this was the app-wide focus-ring colour. See Finding A2. |
| `accent-focus` #8d7255 on `bg-dark` #262525 (new focus ring) | 3.40:1 | Pass |
| `accent-focus` #8d7255 on `bg-page` | 4.01:1 | Pass |
| `accent-focus` #8d7255 on `bg-light` | 4.28:1 | Pass |
| `accent-focus` #8d7255 on white | 4.50:1 | Pass |
| `btn-text` #ebebeb on `btn` #262525 | 12.82:1 | Pass |
| `btn-text` #ebebeb on `btn-hover` #4f4d4d | 7.04:1 | Pass |
| `brown-25` #f7f4f1 chip text on `accent` #745a3b fill (selected chip) | 5.86:1 | Pass |
| `error` #d12828 on `bg-page` | 4.63:1 | Pass |
| `error` #d12828 on `bg-light` | 4.94:1 | Pass |
| `ink` #111111 on `bg-page` (headings) | 16.83:1 | Pass |
| `border-line` #d6c3b2 on `bg-page` | 1.52:1 | Informational — decorative rule/border only, not a text pair. Non-text 3:1 (1.4.11) applies to *meaningful* UI boundaries; input borders here are reinforced by the fill colour + focus ring, not solely this line. Not a violation, flagged for awareness only. |
| "Book now" #f2ebdf on hero video, sampled at poster/paused frame | 4.85–6.02:1 (before/after scrim change) | Pass at the sampled frames — see Finding A6. No per-frame guarantee across the full loop. |
| Nav wordmark (logo image) on hero video, brightest sampled point | as low as ~1.7:1 | Exempt — WCAG 1.4.3 excludes text that is part of a logo. Strengthened anyway alongside the CTA fix since the scrim change helps both. |
| 30%-opacity disabled primary button (native `disabled`) | not computed | Exempt — WCAG places no contrast requirement on a disabled UI component (`button:disabled`). Confirmed the button uses the real `disabled` attribute, not a styled-to-look-disabled enabled control. |

## Findings

### Serious · 1.4.3 Contrast (Minimum) — Finding A1
**Where** — `src/components/Stepper.jsx` (upcoming step label + step-number badge), `src/pages/Rooms.jsx` (multi-room "Not chosen" badge).
**What happens** — A low-vision user reading the stepper cannot make out which steps remain; axe measured 2.06:1 against a 4.5:1 floor. This is live navigational and status text, not a disabled control, so the WCAG contrast exemption for disabled UI does not apply — `text-disabled` (#b0b0b0, "greyscale 300 — disabled days/inputs" per `DESIGN-TOKENS.md`) was reused here for a state ("hasn't happened yet") that isn't the same as "can't be used."
**Fix** — Both now use `text-muted` (#6d6d6d), which the token doc already scopes to "form labels, inactive" — the correct semantic fit, not a new colour. 4.61–4.93:1 across every ground it renders on.

### Serious · 1.4.11 Non-text Contrast — Finding A2 (the most important fix in this pass)
**Where** — every `focus-visible:outline-accent` occurrence, 31 instances across `src/components/**` and `src/pages/**` — every button, chip, calendar cell, card, and text link in the build.
**What happens** — A keyboard-only user tabbing to any primary button (Continue, Complete booking, Upgrade, Select Room…) or any other dark-background control gets a focus ring at 2.38:1 against the button's own fill — well under the 3:1 floor and close to invisible in normal lighting. Troy's own patterns name this exact failure mode: "a ring tuned on the page body will vanish on the dark hero."
**Fix** — Swapped the ring colour token from `--color-accent` (#745a3b) to `--color-accent-focus` (#8d7255) everywhere. `accent-focus` already existed in `DESIGN-TOKENS.md` and `index.css`, documented as "brown 500 — focus border," but nothing in the build actually used it — every component reached for the plain `accent` token instead. This passes 3:1+ against every ground the app renders it on: dark button 3.40, page 4.01, light 4.28, white 4.50. No new colour, no design decision required — an existing, already-named token was pointed at the job its own doc comment said it was for. Verified by measurement, not screenshot: `getComputedStyle().outlineColor` settles to `rgb(141,114,85)` (#8d7255) after the button's own 300ms `transition-colors` completes.

### Serious · 4.1.2 Name, Role, Value / 2.4.1 Bypass Blocks — Finding A3
**Where** — no skip link anywhere in the app (`App.jsx`, `Layout.jsx`, `Landing.jsx` all checked); Landing's hero `<section>` (including the page's one `<h1>`) sat as a sibling of `<main>`, not inside it.
**What happens** — A keyboard user has no way to bypass the header/stepper/nav on every route before reaching the content. On Landing specifically, a screen-reader user jumping by landmark lands directly on `PropertyBand`, skipping the hero copy and its `<h1>` entirely — they never hear "A Return to What Matters" unless they read linearly from the top.
**Fix** — Added `<SkipLink>` (`src/components/Chrome.jsx`), rendered once in `App.jsx` ahead of every route so it's the first tab stop regardless of which page's own header renders; targets `id="main-content"` + `tabIndex={-1}` on every page's `<main>` (Layout's shared one and Landing's own). Landing's hero `<section>` now lives inside `<main>`, alongside `PropertyBand`.

### Moderate · 2.4.2 Page Titled — Finding A4
**Where** — `index.html` has one static `<title>`; nothing in the SPA ever changed it per route.
**What happens** — Every route — Program, Rooms, Checkout, Confirmation — announced and displayed the same browser tab title ("The Ranch — Reserve Your Stay"), giving a screen-reader user or anyone with many tabs open no way to tell routes apart without reading content.
**Fix** — `src/usePageTitle.js`, called once per page with its own name (`"Select Your Room — The Ranch"`, etc.); `RoomDetail` uses the specific room's name. Landing calls it with `null`, which resolves to the site default.

### Moderate · 1.3.1 Info and Relationships (heading order) — Finding A5
**Where** — `RoomDetail.jsx` (Amenities/Policies sections), `RoomCard.jsx`'s `RoomCardFrame` (every room-card title on `/rooms` and `/upgrade`), `AddOns.jsx` (accordion rows when nothing has been added yet), `Confirmation.jsx` (no h2 anywhere).
**What happens** — A screen-reader user navigating by heading list encounters an h1 followed directly by an h3 with nothing at h2 — the page's structure reads as flatter/differently organized than it visually is, and a jump-by-level navigation command skips content unexpectedly.
**Fix** — `RoomDetail.jsx`'s "Amenities include" and "Policies" are now h2. `RoomCardFrame`'s room-name heading is now h2 (was h3) on both `/rooms` and `/upgrade`, where the page h1 has nothing else between it and the card. `AddOns.jsx` always renders an h2 above the enhancement list now ("Available enhancements" / "Add more enhancements"), not only when something has already been added. `Confirmation.jsx`'s "Reservation" (previously a styled `<span>`) and "Before you arrive" are now h2, as siblings under the one h1.

### Moderate · 1.3.1 Info and Relationships (ARIA structure) — Finding A6
**Where** — `src/components/Calendar.jsx`, the date grid.
**What happens** — `role="grid"` requires `role="row"` elements owning `role="gridcell"` children; the calendar had six weeks of bare gridcell buttons with no row wrapping them at all — a structural ARIA violation that a screen reader's grid navigation commands depend on, even though this calendar's own keyboard handling (roving tabindex + arrow keys) doesn't rely on native row/column traversal.
**Fix** — Wrapped each week of 7 cells in a `role="row"` `<div className="contents">` — `display: contents` keeps every cell a direct participant in the same CSS grid track layout, so the fix is structural only; nothing about how it renders changed.

### Moderate · 4.1.3 Status Messages — Finding A7
**Where** — `Calendar.jsx` month heading (Previous/Next buttons); `Rooms.jsx`'s "Choosing Room X of Y" banner.
**What happens** — Clicking Previous/Next month moves no focus, so a screen-reader user gets no indication the visible month — and therefore every date in the grid — just changed. Same gap on the multi-room banner: picking a room updates "Choosing Room 1 of 2" to "Choosing Room 2 of 2" with nothing announcing it.
**Fix** — Month `<h3>` is now `aria-live="polite" aria-atomic="true"`. The multi-room banner container is now `role="status" aria-live="polite"`.

### Moderate · 4.1.2 Name, Role, Value — Finding A8
**Where** — `src/components/program/DatePicker.jsx`'s `DateField` (the filled Check-in/Check-out button once a date is picked).
**What happens** — The visible "Check-in" / "Check-out" caption is a sibling `<span>`, not programmatically tied to the button. A screen-reader user tabbing to it hears only the date ("6 September 2026, button") with no indication which field it is or that activating it resets the selection.
**Fix** — `aria-labelledby` combining the caption's id and the value's id, so the computed name is "Check-in 6 September 2026" — the visible text remains a substring (2.5.3 Label in Name).

### Moderate · 1.3.1 Info and Relationships (heading-in-button) — Finding A9
**Where** — `src/components/ui/Accordion.jsx`.
**What happens** — Each accordion row's `<h3>` sat inside the `<button>` that toggles it. Headings are not valid content inside a button (button accepts phrasing content only; headings are flow content), and browsers/screen-reader heading-navigation commands handle a heading nested inside an interactive control inconsistently.
**Fix** — Rebuilt to the APG accordion pattern: the heading now wraps the button (`<h3><button aria-expanded>…</button></h3>`), not the reverse. `Accordion` takes a `headingLevel` prop (default `h3`, `null` to omit). `AddOns.jsx`'s row name changed from `<h3>` to `<span>` inside the trigger, since Accordion now supplies the heading itself. **Trade-off, not left broken:** the heading's accessible text is now the whole trigger's content (name + detail + price), not just the row name — correct per the pattern (a heading can't sit inside the button, so it has to wrap all of it), but a screen-reader user navigating by heading hears the price and duration as part of the heading. Noted as an open design question, not a defect.

### Moderate · 2.4.7 Focus Visible / APG Listbox — Finding A10
**Where** — `ReserveDrawer.jsx`'s Location dropdown (`role="listbox"`, `aria-haspopup="listbox"`).
**What happens** — The two options (Malibu, Hudson Valley) were reachable by Tab and had `aria-selected`, but had no visible focus ring at all, and none of the arrow-key/Home/End behaviour the `listbox` role and `aria-haspopup="listbox"` promise.
**Fix** — Added focus-visible styling to each option and Up/Down/Home/End navigation within the open listbox; Escape closes it.

### Moderate · 1.4.3 Contrast (text over video, best-effort) — Finding A11 · not fully closable
**Where** — `src/pages/Landing.jsx`, the hero video/poster.
**What happens** — "Book now" (`TextCta`, #f2ebdf) sits over real footage. Pixel-sampled against the poster frame: as low as 4.85:1 — just over the 4.5:1 floor with almost no margin — and the clip loops through brighter moments than any single frame can confirm. This is the exact case Troy's patterns name: "text over photography has no ratio, only one per frame; the only durable answers are a scrim, a solid caption panel, or a gradient with a measured worst-case stop."
**Fix** — Added a dedicated top-anchored gradient behind the nav row, layered on top of the existing full-frame wash and bottom gradient (`bg-dark/15` → `bg-dark/20`, plus a new `h-40` top gradient). Resampled at 5.43–6.02:1 at the same points after. **Left open:** this raises the floor, it doesn't prove every frame of an 18MB looping clip clears 4.5:1 — flagged as unverified below, and in `PRODUCTION-NOTES.md`. `prefers-reduced-motion` guests never see the moving footage at all (autoplay is suppressed; they land on the static poster), so their contrast is fully static and checkable — confirmed passing.

### Minor · 2.5.8 Target Size Minimum `[2.2]` — checked, no fix needed
Calendar gridcells 32×32, counter ± buttons 24×24 (the floor, not generous — would fail if the
design shrank further), day/time chips on Add-ons ~100×31. All measured via
`getBoundingClientRect()`, not eyeballed.

### Not a finding — confirmed already correct
- `RanchCalendar`'s roving-tabindex + arrow-key grid, including crossing month boundaries at the
  grid edge.
- `ui/Modal.jsx`'s focus trap, Esc-to-close, and focus-restore to the opener (`FeeModal`,
  `RetreatPopover`).
- `ReserveDrawer`'s own focus trap, Esc, focus-restore, and body-scroll lock.
- `Checkout.jsx`'s error summary (`role="alert"`, focus moves to it on a failed submit) and every
  invalid field's `aria-invalid` + `aria-describedby`.
- `aria-current="step"` on the Stepper; `aria-selected` / `aria-disabled` on calendar cells.
- Colour independence: selected states change fill *and* the button label text ("Select Room" →
  "Selected", "Upgrade" → "Upgraded") *and* a check icon — never colour alone.
- 320px reflow — checked on `/`, `/program`, `/rooms`, `/checkout` with `scrollWidth`/`clientWidth`
  equality (no horizontal scroll), and again with a WCAG 1.4.12 text-spacing override
  (line-height 1.5, letter-spacing 0.12em, word-spacing 0.16em, paragraph 2em) applied — no
  clipping, no overlap, confirmed by resizing the real viewport to the page's own scroll height and
  screenshotting (not `fullPage: true`, which this repo's own prior passes already documented as
  producing a stale composite around this app's sticky header/footer).
- `prefers-reduced-motion` on the button sweep hover (`.btn-sweep`, `src/index.css`) and the
  `TextCta` hairline sweep — both already correctly resolved to an instant colour swap, no motion.
- Alt text: logos carry `alt="The Ranch"` (Header, Footer) or the property name (`PropertyBand`);
  every decorative icon carries `alt="" aria-hidden="true"`.
- The hero video: `muted`, `playsinline`, `aria-hidden="true"`, a poster that stands alone, and a
  working keyboard-operable pause control (`aria-pressed`, `aria-label` swap, real `<button>`).
  `prefers-reduced-motion` suppresses autoplay entirely.

## Not verified

- **No screen reader was run** — NVDA, JAWS, and VoiceOver are all outside this environment. Every
  finding above is DOM structure, computed ARIA state, and measured contrast (axe-core +
  Playwright), which is necessary but not sufficient — the accessibility skill's own standard names
  this exact gap. Treat this audit as "the accessibility tree is correct," not "confirmed sounding
  right in a real AT."
- **Hero video contrast is confirmed at two static points only** (the poster frame, and one paused
  mid-loop frame) — not across the full clip. See Finding A11.
- **`ConfigPanel`** (dev-only tooling) was brought to the same floor — focus trap, reduced motion,
  visible focus on every control — but audited at lower priority per the brief; not walked with the
  same route-by-route rigor as the seven flow steps.
- **Device zoom/200%** was not separately tested in this pass (only 320px reflow + text-spacing
  overrides); the fluid `clamp()` type scale and percentage-based layout make a failure here
  unlikely but it is an assumption, not a measurement.

## Reproducibility

Playwright + `@axe-core/playwright`, installed into a throwaway scratch project at
`/private/tmp/claude-504/.../scratchpad/pw-a11y` (not added to this repo, matching the pattern
every prior screenshot pass in `PRODUCTION-NOTES.md` already used). Seed key confirmed by reading
`src/store.jsx` before writing to it: `the-ranch-booking`.
