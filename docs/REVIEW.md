# The Ranch Booking Engine — Creative Review

PROJECT: The Ranch booking-engine prototype  DATE: 2026-09-02  REVIEWER: creative-review

---

## Verdict: **Hold for fixes** — close, not clean

This is a strong pass. Wire fidelity is high across all seven steps, the design-token
discipline holds (zero stray hex in `src/`), voice is clean (no banned words, no invented
facts presented without a source-check), `npm run lint` and `npm run build` are green, and
the existing accessibility audit's fixes hold up under re-measurement — including one I
re-tested specifically because it looked like a regression and wasn't (see A2-recheck below).

But there are two P1s a client would notice and one P1 that's a real accuracy risk in a
hospitality confirmation, plus one accessibility regression the standing audit couldn't have
caught because it predates the content-integration pass. None of these are a rebuild — all
four have a one- or two-line fix already half-diagnosed by the codebase's own comments. Fix
the P1 list, re-run the axe pass on `/location` and `/confirmation` at 390px, and this ships.

---

## 1. Scope

Full walk of both properties (Malibu, Hudson Valley) at 1440 and 390, all seven steps plus
Landing, RoomDetail, and Confirmation; wire-by-wire comparison against `docs/figma/wires/*`
and style comparison against `docs/figma/styles/*`; axe-core on every route at both
viewports; keyboard walk of the Program calendar and Checkout's error state; config-panel
smoke test of "Single property" and "No upsells" presets; a warnings-audit pass against
`docs/PRODUCTION-NOTES.md` and `docs/ACCESSIBILITY-AUDIT.md` to find what's gone stale.
Reviewed against `docs/BRIEF.md`, `docs/DESIGN-TOKENS.md`, `docs/content/CONTENT-SOURCE.md`.

---

## 2. Findings

### P1 — should-fix before client

**F1 — The extension toggle changes the real stay dates but never changes the displayed dates, anywhere.**
Route: `/program` (both properties), rail on every subsequent step, `/confirmation`.
Evidence: `docs/screens/final/malibu/08a-checkout-desktop.png` — the rail's ENHANCEMENTS
line reads "1 guest, **Sep 5**, 9:00 AM" while the DATES row three lines above reads
"**Sep 6** – Sep 13 / + 1 pre-night." The guest's own add-on is dated a day before their
own listed check-in. Same pattern on Hudson: `docs/screens/final/hudson/04b-program-extension-desktop.png`
shows "Sep 6 – Sep 10 / + 1 extra night" with NIGHTS correctly at 5 — but nothing on screen
tells the guest their real departure is Friday the 11th, not Thursday the 10th.
Root cause, confirmed by reading the code: `src/stay.js` correctly models Malibu's
extension as a **pre-night** (arrival moves a day earlier) and Hudson's as a **post-night**
(departure moves a day later) — real day-of-week shifts, not abstract add-ons. But
`src/pages/Program.jsx`'s `toggleExtra()` only ever writes `state.extension` as a flag; it
never adjusts `state.checkIn`/`state.checkOut`. Every consumer — `StayRail.jsx`'s
`SummaryRows`, `src/pages/Confirmation.jsx` — renders the raw `state.checkIn`/`checkOut`
with a small "+1" sub-label bolted on, so the bold, primary date range on every screen in
the flow (including the guest's own emailed confirmation) is the *pre-extension* range.
This is a booking-accuracy problem, not a cosmetic one: a guest could show up on the date
printed on their confirmation and be a day early or a day short of the programme.
Fix: either (a) have `toggleExtra()` shift `checkIn`/`checkOut` by one day in the correct
direction so the primary date fields are always the true arrival/departure, with the
"+1" label repurposed to explain *why* (cleanest, matches what wire 03a/03b actually show —
their worked example's checkout date is `Mon Sep 14`, not `Sun Sep 13` — the wire itself
expects the shifted date), or (b) keep the core dates as the "programme" dates but add an
explicit "Arrival"/"Departure" pair that's visibly different from "Programme dates" so the
two concepts don't collide under one label. (a) is less work and matches the wire.
Severity: serious (content accuracy, hospitality-specific trust risk) · Effort: S (one
function in `Program.jsx`, verify `StayRail`/`Confirmation` still read the same field).

**F2 — Confirmation still renders the full "Your Stay" rail beside its own Reservation card.**
Route: `/confirmation`, both properties, both viewports.
Evidence: wire `docs/figma/wires/07-confirmation.png` has no rail at all — centred content
only. `docs/screens/final/malibu/09-confirmation-desktop.png` shows the rail rendering
alongside/below the Reservation card, repeating Property/Rooms/Guests/Dates/Nights/
Room/Enhancements/Taxes/Total a second time.
Already correctly diagnosed in `docs/PRODUCTION-NOTES.md` ("Confirmation still shows the
full StayRail…" under Design gaps) with the exact fix named: `Layout.jsx` renders
`<StayRail />`/`<StayRailMobile />` unconditionally; gate both on `pathname !== '/confirmation'`
the same way `Stepper.jsx` already self-hides. Re-flagging here because it's a direct wire
deviation with no BRIEF justification, not because it's newly found.
Severity: moderate (visual clutter + duplicate content, not a data-disagreement risk since
both currently source the same state) · Effort: XS (one conditional in `Layout.jsx`).

**F3 — Mobile stepper is a horizontally-scrolling region with no keyboard access.**
Route: every step, ≤1024px, confirmed by axe on `/location` and `/confirmation` (390×844):
`scrollable-region-focusable`, impact **serious**, target `<ol class="flex h-full items-center gap-1 overflow-x-auto...">`
in `src/components/Stepper.jsx`. This is new since `docs/ACCESSIBILITY-AUDIT.md` (dated
2 Sep, predates the content-integration pass per the task brief) — re-ran axe on all nine
routes at both viewports myself; desktop is still clean (0/9), mobile now fails on the two
routes where enough "upcoming" steps overflow the 390px stepper strip for axe to flag the
container.
Evidence: `docs/screens/final/malibu/03-location-mobile.png` — the stepper visibly truncates
at "3 EXTE…" with no scroll affordance (no fade, no arrow) hinting four more steps exist.
axe raw output captured to `docs/screens/review/axe-results.json` in this pass.
Why it's real and not an artifact: I checked whether the "done" steps (rendered as
`<button>`) are individually reachable by Tab regardless of scroll position — they are,
browsers auto-scroll a focused element into view. The defect axe is catching is narrower
but still real: the scrollable `<ol>` itself has no `tabindex`/keyboard-scroll path, so a
keyboard-only or switch-device user who wants to *scan* the region (not hunt-and-peck
through every interactive child) has no way to pan it. WCAG 2.1.1 (Keyboard).
Fix: `tabIndex={0}` (or `role="region" aria-label="Booking progress steps" tabIndex={0}`) on
the `<ol>`, matching the pattern axe's own rule doc recommends. One line.
Severity: serious (axe-rated) · Effort: XS.

**F4 — `docs/PRODUCTION-NOTES.md` names two bugs as open that are already fixed in the code.**
Not a code defect — a warnings-audit finding, listed here because it affects whether Troy
(or a client) can trust the file. Confirmed by reading the current source:
- "StayRail room-line price is wrong once a room is upgraded" (under "Rooms + Upgrade pass"):
  `StayRail.jsx`'s `SummaryRows` now reads `lineNightly(r.room)`, not `r.room.rate` — the
  fix the note itself prescribes is already in place.
- "`Rooms.jsx` still doesn't default missing dates... worth a redirect-to-`/program` guard"
  (under "Program pass"): `Rooms.jsx` line 36 is now `if (!state.checkIn || !state.checkOut)
  return <Navigate to="/program" replace />;` — confirmed live via Playwright (deep-linking
  to `/rooms` with empty `sessionStorage` lands on `/program`, not a 1-night mis-priced room list).
Fix: mark both resolved in `PRODUCTION-NOTES.md` with the date, per the file's own stated
rule ("a warning leaves this file only when it is resolved, and the resolution is noted").
Severity: low (documentation hygiene, not a shipped defect) · Effort: XS.

### P2 — polish, not blocking

**F5 — "Stay updated" / "X added to your stay" toast can overlap page content on mobile.**
`Chrome.jsx`'s `Toast` is `fixed bottom-24` (96px off the viewport bottom), 3.2s dwell
(`src/store.jsx`). On mobile, where the viewport is short relative to card content, this
lands mid-card rather than clear of it — `docs/screens/final/malibu/03-location-mobile.png`
shows it sitting directly over three lines of the Malibu location card's description. It
self-dismisses and doesn't block interaction, but it fires after nearly every state change
(every Continue, every add-on add) — in a live demo this is a toast appearing over body copy
repeatedly. Fix: anchor above the sticky button bar with real clearance on mobile specifically
(e.g., `bottom-[calc(var(--buttonbar-h)+16px)]` on `<1024px`), or move to a top-anchored
placement on small viewports only. Effort: S.

**F6 — Add-on prices format inconsistently between the Add-ons list and the rail/Confirmation.**
Already documented in `PRODUCTION-NOTES.md` ("Price-formatting mismatch between AddOns and
StayRail") and still current — confirmed by reading both files: `AddOns.jsx` calls
`money(total, 0)` (whole dollars, "$75"); `StayRail.jsx` and `Confirmation.jsx` call
`money(l.total)` / `money()` with no decimals arg, defaulting to 2 ("$75.00"). Same number,
different formatting, on adjacent screens in the same flow — reads as sloppy even though the
totals agree. Fix: one shared call signature. Effort: XS.

**F7 — Two room photos exceed the 500KB hero-image guideline; not previously flagged.**
`public/img/malibu/malibu-queen-cottage-02.jpg` (736KB) and `malibu-king-cottage-01.jpg`
(588KB) — both render on `/rooms`, an early, LCP-adjacent screen. `PRODUCTION-NOTES.md`'s
Performance section only names the 18MB hero video; these two stills were missed. Fix:
`sips -Z 1600 -s formatOptions 70` (matches the pipeline already used for the other 15
images per the Reproducibility note) to bring both under 500KB. Effort: XS.

**F8 — `HeroGallery.jsx` is dead code, not listed in the Dead Code section.**
Not imported anywhere (`grep -rn "HeroGallery" src/` returns only its own file and a comment
in `RoomDetail.jsx` explaining why it *isn't* used). `RoomDetail.jsx`'s real gallery
(inline thumbnail strip) is correctly built and correctly accessible — focus-visible ring
confirmed present and passing on every thumbnail button. `PRODUCTION-NOTES.md`'s Dead Code
section lists five removed files but not this one, which was never removed. Effort: XS
(delete, or add to the Dead Code list if it's being kept for a future gallery treatment).

**F9 — Config panel's "Extensions" help text is Hudson-only, stale since Malibu got its own extension model.**
`src/config.jsx`: `help: 'Offer an extra Friday night on stays that end on a Thursday.'` —
true for Hudson, wrong for Malibu (Saturday pre-night). Dev-tooling copy only, not
client-facing, but worth a one-line fix given it now describes half the properties
incorrectly. Effort: XS.

### Not a finding — checked and confirmed clean

- **Zero stray hex outside `index.css`** — grepped `src/**/*.{js,jsx}`; the three hits are
  code comments documenting contrast ratios, not live styles.
- **Zero banned words** (`Discover/Experience/Indulge/Elevate/Immerse`), zero exclamation
  marks in copy — full grep across `src/` and `docs/content/ranch-content.json`.
- **Focus ring "regression" — checked, false alarm.** An early keyboard-walk measurement of
  the Rooms "Select Room" button read `outline-color: rgb(116,90,59)` (#745a3b, the *old*,
  pre-fix accent colour) — looked exactly like Finding A2 from `ACCESSIBILITY-AUDIT.md` had
  regressed. Re-measured with a 400ms wait (the button has a documented 300ms
  `transition-colors`) and it resolved to `rgb(141,114,85)` (#8d7255, `accent-focus`, the
  correct fixed value) — the first reading was mid-transition, not a real defect. Source
  confirms too: `grep -rn "outline-accent\b" src/` (excluding `-focus`) returns nothing.
  Noting this because it's exactly the "instrument creates the finding" trap — worth
  recording that it was checked and cleared, not just silently dropped.
- **Config presets** — "Single property" (`?mp=0`) correctly removes the Location step
  entirely (stepper starts at "1 Program," not a skipped "1 Location"); drawer defaults to
  Malibu with no property picker. "No upsells" (`?up=0&am=0`) correctly collapses the
  stepper to 5 steps and Continue from Rooms lands directly on `/checkout`. Screenshots:
  `docs/screens/review/preset-single-property-after-checkrates.png`,
  `docs/screens/review/preset-no-upsells-after-rooms.png`.
- **Refresh persistence, deep-link guard (Rooms), checkout error-summary focus, calendar
  arrow-key navigation** — all live-tested via Playwright this pass, all pass. Checkout's
  failed-submit correctly moves focus to `role="alert"`; the calendar's roving-tabindex grid
  correctly moves focus and announces via `aria-label` on ArrowRight.
- **axe: 0 violations on 8/9 routes at both viewports** (only `/location` and
  `/confirmation` fail, both on the single shared cause in F3). Full run:
  `docs/screens/review/axe-results.json`.
- **`npm run lint` and `npm run build`** both green at time of review — no lint debt from
  the parallel-session hazard `PRODUCTION-NOTES.md` flagged earlier in the build.
- **Continue gating** matches spec everywhere checked: disabled until valid on
  Location/Program/Rooms, always-enabled on Upgrade (skippable per brief), Checkout's
  "Complete booking" blocks until required fields pass.
- **Voice/content accuracy** — checkout's deposit/cancellation copy on both properties
  correctly reflects the booking-engine's live figures (25% deposit, 40-day balance, 10%
  cancellation fee) per `docs/content/CONTENT-SOURCE.md`, not the FAQ's disagreeing figures
  — a defensible, documented choice, not a silent guess.

---

## 3. Accessibility check (delta over `docs/ACCESSIBILITY-AUDIT.md`)

The standing audit (2 Sep, pre-content-integration) is thorough and its fixes hold under
re-measurement. This pass re-ran axe-core on all nine routes at 1440×900 and 390×844 with a
seeded Malibu booking (see Reproducibility) to catch anything the content-integration pass
introduced.

| Route | Desktop | Mobile |
|---|---|---|
| `/` | 0 | 0 |
| `/location` | 0 | **1 — scrollable-region-focusable, serious** (F3) |
| `/program` | 0 | 0 |
| `/rooms` | 0 | 0 |
| `/room/:id` | 0 | 0 |
| `/upgrade` | 0 | 0 |
| `/add-ons` | 0 | 0 |
| `/checkout` | 0 | 0 |
| `/confirmation` | 0 | **1 — scrollable-region-focusable, serious** (F3, same root cause) |

Not re-verified this pass (still open from the standing audit, unchanged): no screen reader
run (NVDA/JAWS/VoiceOver); hero video contrast confirmed at two static frames only, not the
full 18MB loop; 200% zoom not separately tested.

---

## 4. Brand consistency score: **8/10**

| Criterion | /2 | Reasoning |
|---|---|---|
| Type (Times New Roman heading / Inter body) | 2 | Correct families, correct fallback stack, Light 300 gap on headings honestly documented (system has no Light in the Typekit kit — Regular renders, which is the right call over faking a synthetic weight). |
| Colour (tokens, contrast) | 2 | Zero off-token colour in components; the one dark-focus-ring failure from the standing audit is fixed and re-verified; Hudson green 300–900 sampled-not-confirmed values are disclosed, not silently used as fact. |
| Voice (no banned words, no invented facts as fact) | 2 | Clean grep; every unconfirmed figure in `data.js` is flagged `unverified: true` or renders "Price on request" rather than inventing a number — this is the house standard for "content accuracy" done right. |
| Layout/card anatomy vs wires | 1.5 | Location, Program (all three states), Rooms' horizontal card, Upgrade, Add-ons accordion, and guest-detail cards all match their wires closely including selected-state treatment. Docked half a point for F1 (dates) and F2 (Confirmation rail), both real wire deviations without a BRIEF-level justification. |
| Button/form/calendar component fidelity | 2 | Solid/ghost states, sweep hover, 50px/2px-radius fields, 32px calendar cells, brown range fill — all present and matching `docs/figma/styles/*`. No spot check failed. |
| Component polish (toast placement, dead code) | 0.5 | F5/F8/F9 are all real but minor — the kind of thing that reads fine in isolation and slightly less fine on a full walk-through. |

**8/10** — this is a well-executed build against a genuinely difficult spec (two properties
with materially different stay-length rules, real crawled content with documented
contradictions, a token system with no shortcuts taken). The deductions are concentrated,
not scattered: fix F1–F3 and this moves to a 9.

---

## 5. Pre-mortem — five ways this demo goes wrong in front of the client

1. **Someone toggles the extension checkbox and asks "wait, so do I arrive Saturday or
   Sunday?"** — F1. The single most likely failure: it's the kind of thing a hospitality
   client's ops team checks first, because it's their actual arrivals desk that eats the
   confusion. Mitigation: fix F1 before any client-facing walkthrough of Program step 3;
   if it can't land in time, brief whoever demos it to narrate the "+1" line explicitly
   rather than let the client read the date range at face value.
2. **Client scrolls the mobile stepper with a mouse/trackpad fine, tester with a keyboard-
   only setup or screen reader can't reach the later steps' region at all** — F3. Low
   probability in a live client meeting (most demos are sighted-mouse), higher probability
   if this goes to the client's own accessibility/legal review before launch. Mitigation:
   the one-line `tabIndex` fix is cheap enough to just take before it's asked about.
3. **Someone opens the confirmation on mobile and the rail total looks like it might not
   match the Reservation card total** (F2) — it currently *does* match (both read the same
   state), but the duplication invites exactly this doubt, and a genuinely nervous
   hospitality client (deposits, cancellation policy, real money) will stare at two totals
   on one screen longer than a design review would. Mitigation: the wire has no rail here
   for a reason; cut it.
4. **Client clicks into the config panel out of curiosity (`Cmd+.` is discoverable — it's
   in the brief), flips "No upsells," and the flow looks broken because they don't
   understand it's a demo-configuration tool, not a bug.** Tested this pass — it isn't
   broken, it correctly collapses the stepper — but the panel doesn't visibly explain
   itself as a *build configuration* tool versus a guest-facing setting. Mitigation: none
   needed for the build itself; brief whoever demos it that the panel exists and what it's
   for before a client finds it unprompted.
5. **Client asks about a room that doesn't exist yet** — Malibu's King/Double Queen Cottage
   rates and several Hudson mid-tier rates are extrapolated, not sourced (documented
   extensively in `PRODUCTION-NOTES.md`'s Content crawl section). If a Ranch team member
   who knows their own rate card sees "$1,700/night" for King Cottage and knows the real
   number, that's an on-the-spot credibility hit. Mitigation: this is already flagged
   plainly in the file the client would need to be walked through anyway — make sure
   whoever demos it leads with "these three rates are placeholders pending your
   confirmation," not something the client has to catch themselves.

---

## 6. Warnings audit

`docs/PRODUCTION-NOTES.md` is unusually thorough — better than most builds this size get —
but it has drifted in two places (F4: two fixed items still listed open) and is missing two
items this pass found (F7: two room images over 500KB; F8: `HeroGallery.jsx` dead code).
Everything else in the file was spot-checked against current source and still holds:

- **Licensing** — Typekit domain whitelisting, photography usage rights (17 images + the
  hero video, crawled from theranchlife.com at the client's request), and Figma-exported
  icon rights are all still open, all still correctly flagged as pre-launch blockers, not
  demo blockers. No change needed.
- **Content accuracy** — the extensive contradicted/unverified list (Malibu 6/7/8-night
  vs. the brief's original 3/4/7, Hudson rates starting at $1,675 not $950, invented room
  names replaced with real ones, three extrapolated room rates, deposit/cancellation
  figures) is current and matches what's actually in `src/data.js` — spot-checked several
  entries against `docs/content/CONTENT-SOURCE.md` directly.
- **Performance, unmeasured** — 18MB hero still unmeasured (confirmed file size: 17MB via
  `ls -lh`), no Lighthouse run. Add F7's two stills to this section.
- **Robustness** — checkout payment fields still local-state-only, non-persisted, format-
  only validation (no Luhn check) — confirmed by reading `Checkout.jsx`, unchanged.
- **Accessibility** — needs one addition: F3, found this pass, post-dates the audit's own
  timestamp exactly as the audit's "Not verified" section would predict for anything
  touched after 2 Sep.
- **Dead code** — add `HeroGallery.jsx` (F8) to the existing list of five.
- **Reproducibility** — this pass followed the same pattern (throwaway Playwright scratch
  project, not committed); axe results archived to `docs/screens/review/axe-results.json`
  for anyone who wants the raw per-route detail rather than the summary table above.

---

## 7. Screenshots from this pass

`docs/screens/review/`:
- `axe-results.json` — full per-route axe output, both viewports
- `home-desktop.png`, `deep-link-rooms-empty.png`, `checkout-error-focus.png`,
  `program-calendar-keyboard-focus.png`, `rooms-focus-visible.png`
- `preset-single-property-drawer.png`, `preset-single-property-after-checkrates.png`,
  `preset-no-upsells-after-rooms.png`
- `route-*-desktop.png` — per-route desktop captures used for the axe pass

---

## 8. Prioritised recommendations

1. **Fix F1** (extension dates) — highest-value fix in this list; real accuracy risk on the
   guest-facing confirmation. → `web-development-agent`.
2. **Fix F3** (mobile stepper keyboard access) — one line, serious axe rating. →
   `web-development-agent` or `accessibility-agent`.
3. **Fix F2** (Confirmation rail duplication) — one conditional, already-diagnosed. →
   `web-development-agent`.
4. **Update `PRODUCTION-NOTES.md`** for F4 (mark two items resolved) and add F7/F8. → whoever
   owns the file next; no code change required.
5. **F5/F6/F9** — batch into the next polish pass; none block a client walkthrough on their
   own. → `web-development-agent`.
6. **Re-run this review** after F1–F3 land, scoped to `/program`, `/confirmation`, and
   `/location` + `/confirmation` at 390px — don't re-walk the full flow, the rest is clean.

---

## Resolution — 2 Sep 2026

F1–F4 fixed and verified on a fresh, unseeded walk of both properties at 1440 and 390:

- **F1** DATES now shows the real arrival → departure with the programme dates as a sub-line
  (`stayRange()` in `src/store.jsx`). Measured: Malibu "Sep 5 – Sep 13 incl. 1 pre-night ·
  programme from Sep 6"; Hudson "Sep 6 – Sep 11 incl. 1 extra night · programme to Sep 10".
- **F2** No "Your stay" rail on `/confirmation` at either breakpoint (count 0).
- **F3** Stepper scroll region focusable; `scrollable-region-focusable` = 0 at 390.
- **F4** `docs/PRODUCTION-NOTES.md` stale entries marked resolved.
- axe: 0 violations on all 9 routes × 2 properties × 2 breakpoints (36 runs). Console: clean.

Verdict updated: **ship to Troy.** Final screenshots in `docs/screens/final/{malibu,hudson}/`.
