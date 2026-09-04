# The Ranch Booking Engine — Production Notes & Warnings

Living list. A warning leaves this file only when it is resolved, and the resolution is noted.

## Licensing
- **Times New Roman** — *resolved 2 Sep 2026*: the client supplied an Adobe Fonts kit
  (`use.typekit.net/sva0dtq.css`, Regular/Bold + italics) and the build loads it; the system face
  is the fallback. The kit is tied to the client's Adobe account and its allowed domains — confirm
  the booking-engine domain is whitelisted in Typekit before launch. Light 300 is not in the kit.
- **Inter** is loaded from Google Fonts (OFL) — fine for web.
- **Imagery** — *resolved 2 Sep 2026, content-integration pass*: real photography is wired into every property card, room card and room gallery (17 images, `docs/content/IMAGES.md`); see "Licensing" under "Content crawl" below for the usage-rights caveat, which still stands. `.ph-img` remains as the fallback for any record with no image (none currently, kept for robustness).
- **Logos and icons** were exported from the client's Figma file; confirm usage rights extend to
  the booking-engine domain.

## Content accuracy
*Resolved 2 Sep 2026, content-integration pass* — `src/data.js` now carries the real content
crawled from theranchlife.com and its booking engine, not the wireframe's invented catalogue. Room
names, rates, stay rules, fees, policies, the phone number and retreat dates below are all sourced;
see the detailed "Content accuracy — what the site confirmed, contradicted, and left unverified"
entry under "Content crawl of theranchlife.com" further down for the full before/after and what
is still open. Two points worth surfacing at the top level:
- Taxes & fees is now a per-property all-in multiplier (1.24 Malibu / 1.26 Hudson) with a real
  breakdown in `D.fees`, not the old flat 11.8%. See the entry below for the source math.
- Every field that could not be confirmed from a live search carries `unverified: true` (rooms) or
  `price: null` → "Price on request" (add-ons) rather than an invented number — see below for which
  ones and why.

## Design gaps
- Hudson Valley greens 300–900, greyscale 400–900 and the success green were rendered swatches in
  Figma, not variables; hex values in `docs/DESIGN-TOKENS.md` marked ≈ are sampled and need
  designer confirmation.
- No wire exists for step 3 "Extensions"; it is folded into step 2 as the extra-night toggle.
- No wire exists for payment on the checkout page; Dolli's payment block is restyled and kept.
- Times New Roman Light (300) is called for in the type spec but no system Light exists; Regular
  is rendered.
- Mobile layouts were not wired; they are inferred from the desktop frames.
- **Foundation pass (this build):** `src/pages/Program.jsx`, `Upgrade.jsx`, and `AddOns.jsx` are
  placeholders per the build brief — the primitives they need (`RanchCalendar`, `Counter`, `Chip`,
  `Accordion`, `src/stay.js`, `D.addonsFor`, `D.upgradeFor`) exist, but the real UI is not built.
  Program seeds a default stay on mount so downstream steps have real data to price against —
  remove that effect once the real page sets its own dates. — *resolved (Program pass, this
  build)*: `Program.jsx` now sets its own dates through `DatePicker`; the auto-seed effect is
  gone. `Program.jsx` still defaults `state.property` on mount (mirroring `Rooms.jsx`'s own
  default) so a deep link or a `multiProperty: false` config that skips `/location` still has a
  property to key the retreat lookups and rail off — that one default was kept, only the fake
  date-seeding was removed.
- `upsellPlacement: 'checkout'` has no inline UI on `Checkout.jsx` yet. With the Ranch default
  (`page`), Upgrades and Add-ons are their own steps and Checkout never needed them; switching the
  config to `checkout` currently makes both upsells unreachable rather than folding them in —
  build the inline sections before shipping that configuration.
- `RanchCalendar` does not render a blackout strike-through — there is no per-date blackout data
  source in `src/data.js`, only the weekday rules in `src/stay.js`. The Figma spec's "blackout =
  disabled with a diagonal strike" is unimplemented until real availability data exists.
- Mobile's `StayRailMobile` is not persistently double-stacked directly above the sticky
  `ButtonBar` (per BRIEF section 2) — it renders inline after the page content, above the footer,
  which is simpler and reads fine but is not the same fixed pairing the wire describes.
- `RoomDetail.jsx` dropped the Dolli-era Reviews / Location map / FAQs / Other rooms sections
  outright rather than adapting them — they were built on data this model no longer has (guest
  reviews, rate plans). Re-add against real content when the Ranch actually has it.
- **`upsellPlacement: 'checkout'` is still unreachable.** Confirmed again on this pass
  (`AddOns.jsx`, `Checkout.jsx`, `Confirmation.jsx` build) — `Checkout.jsx` still has no inline
  Upgrades/Add-ons section. With the Ranch default (`page`) this never mattered; switching the
  config to `checkout` still needs that inline UI built before it ships. Left as a documented
  TODO in `Checkout.jsx` rather than attempted in this pass, per the build brief.
- **Confirmation still shows the full StayRail beside/below its own RESERVATION card.**
  `Layout.jsx` renders `<StayRail />` (desktop) and `<StayRailMobile />` (mobile) unconditionally
  for every route inside its shell; neither self-hides for `/confirmation` the way `Stepper.jsx`
  already does (it returns `null` when `stepIndexFor` can't place the current path in
  `flowSteps()`). `Confirmation.jsx` centres its own content as far as it can from inside
  Layout's flex column, but on desktop the "YOUR STAY" rail still sits to the right repeating
  Property/Rooms/Guests/Dates/Nights/Room/Enhancements/Taxes/Total that the RESERVATION card
  already states; on mobile it appears as a collapsed "Your stay · $total" bar below the page
  content. See `docs/screens/checkout/confirmation-desktop.png` and `-mobile.png`. Not fixed here
  — `Layout.jsx` and `StayRail.jsx` are owned by another pass; the fix is almost certainly a
  route check (e.g. `pathname !== '/confirmation'`) gating both rail exports in `Layout.jsx`.
- **One booking per add-on id.** `AddOns.jsx` treats an add-on as either "available" or "added" —
  booking one moves it out of the selectable list into its own "Added to your stay" card (per
  wire 05d) and there is no path back to adding a second instance of the same add-on at a
  different day/time. `state.addons` itself has no such restriction (it's a plain array of
  `{id, day, time, party}` entries), so this is a UI decision, not a store limitation — a future
  pass wanting "book the same massage twice" needs to key the "added" list on something other
  than add-on id, or offer an explicit "add another" action per row.
- **Price-formatting mismatch between AddOns and StayRail.** `AddOns.jsx` renders whole-dollar
  prices (`money(x, 0)` → "$75") to match the wires; `StayRail.jsx`'s enhancement line and Total
  band call `money()` with no decimals argument, which defaults to 2 (`money()` in `src/utils.js`
  — "$75.00"). Both are correct calls to the same shared helper, they just pass different
  arguments. Visible in `docs/screens/checkout/addons-added-desktop.png` ("$75" in the card vs.
  "$75.00" in the rail). Not changed — `StayRail.jsx` is out of scope for this pass; worth a
  single decision (probably: always 2 decimals, or always 0, everywhere prices render) rather
  than a per-page call.

## Performance, unmeasured
- No Lighthouse or bundle profiling has been run on the restyled build.
- Google Fonts is a third-party request on first paint (Dolli self-hosted Roboto to avoid this).

## Robustness
- Calendar stay-block rules are computed client-side from weekday logic; a real availability feed
  will replace them.
- `sessionStorage` state is per-tab; a shared link does not carry the booking, only the config.
- *Resolved 2 Sep 2026:* upgrade pricing is no longer a flat surcharge — with the real catalogue
  each room carries its own per-person rate and the Upgrade step prices the actual difference.
- Add-on day/time slots (`D.addons[].times`) are not checked against real capacity — any time
  shows as available. The Dolli base had deterministic fake availability for this
  (`unavailableSlots()` in `src/utils.js`); it was removed rather than carried forward since the
  Ranch add-on model (`state.addons: [{ id, day, time, party }]`) is shaped differently. Re-add
  once there is a real slots API to check against.
- **Checkout payment fields are validated but never persisted.** `Checkout.jsx` keeps card
  number, name, expiry and CVC in local component state only; `bookNow()` writes `guest` and
  `guests` to the booking store but deliberately never includes `payment`, so nothing card-shaped
  reaches `sessionStorage` or the Confirmation page. A real integration replaces this local state
  entirely with a payment processor's own hosted fields/tokenization — this prototype's version
  should not be mistaken for PCI-appropriate handling.
- **Checkout validation is format-only.** Card number checks length (13–19 digits) and digit
  content, not a Luhn check; expiry checks the month is 01–12 and both fields are present, not
  whether the date has already passed; CVC checks 3–4 digits. None of this substitutes for a
  payment gateway's own validation.

## Accessibility

**Audited 2 Sep 2026 against WCAG 2.2 AA** — full route-by-route findings, the axe results before
and after, and the contrast table live in `docs/ACCESSIBILITY-AUDIT.md`. Method: axe-core via
Playwright on all nine routes with a seeded booking, plus a manual pass (structure, keyboard,
semantics, contrast, motion, reflow, forms) per `~/Documents/Claude/skills/accessibility/SKILL.md`.
Summary below; the audit doc is the source of truth.

**Before → after.** axe found 6 rule violations (19 failing nodes, all `color-contrast`, all
`serious`) across `/location`, `/program`, `/rooms`, `/room/:id`, `/upgrade`, `/add-ons`. After
fixes: 0 violations on all nine routes. Manual review found and fixed a further ~15 issues axe
cannot see — see the audit doc for the full list. Categories fixed:

- **Contrast — real defect, not the documented decorative-disabled exemption.** The Stepper's
  "upcoming" step label and Rooms' "Not chosen" room badge both used `text-disabled` (#b0b0b0),
  measuring 2.06:1 on `bg-light` against a 4.5:1 floor — this is live navigational/status text, not
  a disabled control, so the WCAG exemption for disabled UI doesn't apply. Both now use
  `text-muted` (#6d6d6d, 4.61–4.93:1 across every ground it renders on). `text-disabled` itself is
  correct and kept where it *is* a disabled control or a genuinely inert calendar day — see the
  contrast table in the audit doc.
- **Focus ring failed 3:1 on every dark-background control.** Every `focus-visible:outline-accent`
  ring (#745a3b) measured 2.38:1 against the primary button's own `#262525` fill — under the 3:1
  floor for non-text UI (1.4.11) and the exact failure Troy's patterns name ("a ring tuned on the
  page body will vanish on the dark hero"). The design tokens already carried the right answer
  unused: `--color-accent-focus` (#8d7255, "brown 500 — focus border" in `DESIGN-TOKENS.md`) passes
  3:1+ against *every* ground in the app — dark button 3.40, page 4.01, light 4.28, white 4.50, and
  it's the one focus colour that also survives the hero video's darker frames. Swapped globally (31
  occurrences, `src/components/**`) from `outline-accent` to `outline-accent-focus`. No new colour;
  an existing token was just pointed at the job its own name and doc comment already said it was for.
- **No skip link, and Landing's hero (including its own h1) sat outside any landmark.** Added
  `<SkipLink>` (`src/components/Chrome.jsx`), rendered once in `App.jsx` ahead of every route, first
  in the tab order, targeting `id="main-content"` on every page's own `<main>`. Landing's hero
  `<section>` — previously a sibling of `<main>`, not inside it — now lives inside `<main>` with
  `PropertyBand`, so the page's one landmark actually contains its one heading.
- **Static `<title>` on every route.** `src/usePageTitle.js`, called once per page with its own
  name ("Select Your Room — The Ranch", etc.); `RoomDetail` uses the room's own name.
- **Heading order.** Three real level-skips (h1 straight to h3, no h2 between): `RoomDetail.jsx`'s
  Amenities/Policies sections, every `RoomCardFrame` card title (Rooms + Upgrade), and `AddOns.jsx`
  when no add-on has been booked yet. `Confirmation.jsx` had no h2 anywhere between its h1 and its
  one h3. All now contiguous — see the per-route heading dump in the audit doc.
- **Accordion heading nested inside its own trigger button.** `ui/Accordion.jsx` put an `<h3>`
  inside the `<button>` it was labelling — invalid content model (headings aren't phrasing content)
  and inconsistent for a screen-reader user navigating by heading. Rebuilt to the APG pattern: the
  heading now wraps the button, not the reverse (`headingLevel` prop, defaults `h3`).
  `AddOns.jsx`'s row name is a `<span>` inside the trigger; the heading is Accordion's, not the row's.
- **Calendar grid was gridcells with no rows.** `role="grid"` requires `role="row"` owning
  `role="gridcell"` — `Calendar.jsx` had six weeks of bare gridcells with nothing wrapping them.
  Fixed with `display: contents` row wrappers so the CSS grid layout is untouched. Month navigation
  (Previous/Next) also had no announcement for a screen-reader user, since clicking moves no focus —
  the month heading is now `aria-live="polite"`.
- **`DateField` (Program's Check-in/Check-out button) had no accessible name tying it to its
  visible "Check-in"/"Check-out" caption** — a screen reader heard only the date. Fixed with
  `aria-labelledby` combining both.
- **`prefers-reduced-motion` gaps.** `ReserveDrawer`'s slide-in transform and its overlay fade had
  no reduced-motion handling (Troy's patterns: parallax and large-field movement are the actual
  vestibular trigger reduced motion exists to remove). Both now resolve instantly under
  `prefers-reduced-motion: reduce` — the open/closed end state is unchanged, only the 400ms
  transition is gone. Same fix applied to the (dev-only) `ConfigPanel` modal, which also gained the
  focus trap + Esc + focus-restore contract `ui/Modal.jsx` already had and this dialog never did.
- **Hero video scrim strengthened.** Pixel-sampled against the poster frame: "Book now" measured as
  low as 4.85:1 in the brightest part of the loop — just over the 4.5:1 floor with almost no margin,
  and the video moves through brighter moments than any one frame can confirm (per Troy's patterns,
  "text over photography has no ratio, only one per frame"). Added a dedicated top-anchored gradient
  behind the nav row (on top of the existing full-frame wash and bottom gradient); resampled at
  5.43–6.02:1 after. Not a guarantee for every frame of a looping 18MB clip — flagged as such in the
  audit doc, same standing gap the Home-page-pass note below already named.
- **Locations listbox in `ReserveDrawer`** (`role="listbox"`, `aria-haspopup="listbox"`) had no
  arrow-key navigation and no visible focus ring on its options — reachable by Tab, but not
  conformant to the pattern its own ARIA promised. Added Up/Down/Home/End + focus-visible.

**Confirmed working, not changed:** the roving-tabindex + arrow-key grid on `RanchCalendar`; the
real focus trap + Esc + focus-restore on `ui/Modal.jsx`; `aria-live="polite"` on the toast and
every counter's live value; `aria-current="step"` on the Stepper; `aria-invalid`/`aria-describedby`
+ focus-on-submit-error on `Checkout.jsx`; 320px reflow (no horizontal scroll on any route, checked
with and without a WCAG 1.4.12 text-spacing override applied); target sizes (calendar cells 32×32,
counter ± buttons 24×24 — the floor, not generous — day/time chips ~100×31).

**Not verified — say so plainly:** no screen reader was run (NVDA/JAWS/VoiceOver) — every finding
above is DOM/AOM/computed-style verification (axe-core + Playwright), which is necessary but not
sufficient; the SKILL's own standard names this gap explicitly. Hero video contrast is confirmed
only at the poster frame and one paused mid-loop frame, not across the full 18MB clip.
`ConfigPanel` is dev-only tooling and was brought to the same floor as everything else but audited
at lower priority per the brief.

- The room card's fee-breakdown link and the "View Details" link sit close together with similar
  styling (both underlined `label-sm`/`text-xs`) — worth a visual pass to confirm they read as two
  distinct targets at a glance, not just structurally distinct in the DOM. Not an axe finding;
  carried forward as a manual-review note.
- **Checkout's validation is submit-time, not live.** `Checkout.jsx` shows no field errors until
  the guest clicks "Complete booking"; a failed attempt renders an `role="alert"` error-count
  summary above Primary Contact, moves focus to it, and marks every invalid `Field`/`ExpiryField`
  with `aria-invalid` + `aria-describedby` pointing at its own error text. Confirmed working this
  pass (focus lands on the summary, `role="alert"` fires). Re-typing a field does not clear its
  error live; the guest has to submit again to see it resolved, which is a real UX gap worth
  fixing before this ships (debounced per-field re-validation on change, once a field has already
  been marked invalid once).
- **`AddOns.jsx`'s accordion heading text is now the whole trigger button's content** (name +
  detail line + price/FREE chip), not just the row name — a direct consequence of the APG fix
  above: the heading has to wrap the entire disclosure button, since a heading can't sit inside one.
  Correct per spec, but a screen-reader user navigating by heading hears the price and duration as
  part of the heading text. Left as-is (this is the pattern's own trade-off, not a defect) —
  worth a design conversation if it reads as noisy in practice.

## Dead code
- Removed outright rather than adapted, since they were built on data/features this rewrite
  doesn't have: `src/pages/Enhancements.jsx`, `Experience.jsx`, `src/components/ItineraryDrawer.jsx`,
  `ItineraryOverview.jsx`, `RoomSections.jsx`. Also removed from `src/config.jsx`: `activities`,
  `dining`, `spa` (Dolli experience routes — the Ranch programme is all-inclusive), and `beds`,
  `reviews`, `locationMap`, `faqs`, `otherRooms`, `membership`, `urgency` (built on rate-plan /
  bed-choice / review data the Ranch single-rate model doesn't carry). If any of these turn out to
  be wanted after all, they need rebuilding against the current data shape, not un-commenting.

## Reproducibility
- Figma asset export: `docs/figma/` holds the frame renders and design-context dumps used for
  this build; asset URLs from Figma expire after 7 days, so re-export from the file if needed.
- The verification screenshots in `docs/screens/foundation/` were taken with Playwright, installed
  into a throwaway scratch project (this repo has no `@playwright/test` dependency and none was
  added, to keep it out of the production bundle). There is no committed screenshot script — add
  `@playwright/test` as a devDependency and a `scripts/screenshot.js` if this needs to be
  repeatable rather than re-authored each time.
- Same pattern for `docs/screens/checkout/` (add-ons + checkout + confirmation, this pass) — a
  second throwaway Playwright scratch project, not committed. Its seed script wrote directly to
  `sessionStorage['the-ranch-booking']`, the real key `src/store.jsx` uses. (A brief for this pass
  named the seed key `dolli-booking` — stale, from the Dolli base this was cloned from; the
  current store key is `the-ranch-booking`, confirmed by reading `src/store.jsx` before seeding.)

## Rooms + Upgrade pass (this build) — `src/pages/Rooms.jsx`, `src/components/RoomCard.jsx`,
`src/pages/Upgrade.jsx`, `src/pages/RoomDetail.jsx`, `src/components/FeeModal.jsx`

- *Resolved 2 Sep 2026* — the rail now reads `lineNightly()` and shows the charged rate. Original note:
  **StayRail room-line price is wrong once a room is upgraded** (`src/components/StayRail.jsx`,
  not touched here — owned by another pass). `SummaryRows` reads `r.room.rate` for the "ROOM" row's
  sub-label, which is the *upgraded room's own listed rate* ($1,250/night for Garden View, in the
  worked example). The rate actually charged is `lineNightly()` in `src/store.jsx` — the original
  room's rate plus the flat `$25` surcharge ($1,175/night) — and the rail's own `Total`/`Taxes &
  fees` figures already use that correct number via `pricing()`. Only the small per-room sub-label
  disagrees with the total beneath it. Fix is one line in `StayRail.jsx`'s `SummaryRows`: read the
  matching line from `pricing(state).lines` (which carries `nightly`) instead of `r.room.rate`.
  Flagging rather than fixing since StayRail is out of scope for this pass.
- **Upgrade step applies to the first booked room only** (`state.rooms[0]`), regardless of
  `multiRoom`. The wire (04) carries no "Room 1 of 2" banner and the placeholder this replaced was
  already scoped to "the single-room upgrade offer" — there is no spec for upgrading a multi-room
  booking. If multi-room + upgrades both ship, this needs a real per-room decision (offer once per
  room? per room only if all rooms match the same base type?) before it's correct.
- **"Or $X total" on the Upgrade card is the incremental cost** (`D.upgradeNightlyDiff × nights`),
  not the full upgraded room's cost — read literally from the wire's own pattern (nightly figure ×
  nights = "total" figure), applied to the $25 surcharge rather than the room's sticker rate. This
  is an interpretation, not a sourced number; flag for confirmation alongside the other flat-rate
  upgrade assumptions already noted above under Robustness.
- **Room card image width is a fixed 300px** at desktop (was 220px), sized off a pixel measurement
  of wire 03a (image ≈38% of the ~767px card at 1440) rather than a token — no design-tokens value
  covers card image width. Revisit if the real card width at 1440 drifts from ≈768px.
- **Price numerals moved off the heading serif onto Inter Medium** (room card, upgrade card,
  RoomDetail sidebar) per the build brief's explicit call-out that the price is data, not display
  type. Room/heading names stay on `h-serif` (Times New Roman) as before.
- **RoomDetail's static "Taxes and fees calculated at checkout" line was replaced** with the same
  underlined `FeeModal` link every room/upgrade card now uses, for one consistent fee-disclosure
  pattern across the flow rather than two (a link everywhere else, plain text here).
- **Testing note, not a build issue:** seeding session state via `/program` was unreliable during
  this pass because another agent was actively rebuilding that page (and touching shared
  `index.css`) in parallel — Vite's HMR full-reload fired mid-navigation and silently dropped the
  seeded `sessionStorage` write often enough to be worth naming. Verification screenshots were
  re-taken seeding via `/` (Landing) instead, with a read-back-and-retry loop. Not an app bug; a
  hazard of testing against a codebase with concurrent live edits.

## Program pass (this build) — `src/pages/Program.jsx`,
`src/components/program/{RoomChips,DatePicker,RetreatPopover}.jsx`

- **The "Select your earliest possible check-in date" helper renders above the calendar, not
  between the month heading and the weekday row** the way wire 02a places it. `Calendar.jsx` is a
  shared, read-only component with no slot at that position — it renders month heading, weekday
  row, and grid as one fixed block — so `DatePicker` prints the helper immediately above the whole
  calendar card instead. Same content, one row earlier than the wire. Revisit if `Calendar.jsx`
  ever grows a `beforeGrid` slot.
- **Legend visibility follows the check-in/check-out split, not a separate switch:** `Calendar.jsx`
  already ships its own "Check-in available" / "Special retreat" legend (`legend` prop, on by
  default). `DatePicker` passes `legend={false}` on the check-in calendar (state A, matches wire
  02a — no legend shown) and leaves it on for the check-out calendar (state B, matches wire 02b).
  Retreat dates are still visually dotted and carry the "special retreat" wording in their
  `aria-label` in state A even without the legend spelling it out — the popover confirms the name
  when one is actually picked.
- **Retreat dates are only ever check-in-flagged** — every entry in `D.retreats` lands on a Sunday
  or Thursday (a valid check-in day), so in practice the retreat popover only fires from the
  check-in calendar. The same `retreatFor()` lookup also runs on the check-out calendar so a future
  retreat date that happened to coincide with a valid checkout would still be caught, but nothing
  in the current data exercises that path.
- *Resolved 2 Sep 2026* — `Rooms.jsx` now redirects to `/program` when the stay has no dates. Original note:
  **`Rooms.jsx` still doesn't default missing dates**, only a missing `property`. Landing on
  `/rooms` via a deep link that skips `/program` entirely leaves `state.checkIn`/`checkOut` null;
  `nights(state)` returns `0`, and `RoomCard` calls `Math.max(1, nights(state))`, so every room
  quietly prices at 1 night rather than surfacing that no stay has been chosen. Not fixed here —
  `Rooms.jsx` was not one of this pass's files — but worth a redirect-to-`/program` guard (the same
  shape as its existing `!state.property` default) before this ships.
- **`page.screenshot({ fullPage: true })` produces a stale composite on every step page**, this one
  included — confirmed by comparing `getBoundingClientRect()` measurements (correct) against the
  fullPage PNG (cropped mid-component, missing the calendar's last row and its legend after the
  retreat modal closed). The sticky header (`top-0`) and sticky footer `ButtonBar` (`bottom-0`)
  are the likely cause — a known Chromium/Playwright interaction where a post-paint height change
  under a sticky element isn't picked up by the fullPage stitch. Screenshots in
  `docs/screens/program/` were taken by reading `document.body.scrollHeight`, resizing the real
  viewport to it, and taking a normal (non-fullPage) screenshot instead — verified against an
  element-level screenshot of the same node. Any future screenshot script for this repo should do
  the same rather than trust `fullPage: true` on a step page.
- **MAX_ROOMS is guarded in two places now.** `RoomChips` only renders the "+ Add Room" tile below
  `MAX_ROOMS`, and `Program.jsx`'s `addRoom()` also no-ops past the limit — belt-and-braces since
  the store itself (`newRoomSlot`) doesn't enforce a ceiling.
- **Operational, not a code issue:** while verifying this build, a `pkill -f "vite --port 5181"`
  run to clean up this session's own dev server matched and killed a *different* dev server
  already listening on port 5181 — this repo's `npm run dev -- --port 5181` had silently fallen
  back to port 5183 because 5181 (and 5182) were already taken, almost certainly by another agent
  working on this same project in parallel. Flagging so whoever owned that server knows it was
  killed and can restart it; the fix going forward is to kill by PID captured at spawn time, never
  by a command-line pattern that can match another session's process.

## Home page pass (this build) — `src/pages/Landing.jsx`, `src/components/ReserveDrawer.jsx`,
`src/components/home/{HeroNav,TextCta,PropertyBand}.jsx`, `src/index.css`

- **Shared-file touch: `.btn-sweep` in `src/index.css` had a real geometry bug, fixed here.**
  `inset: 0` sets `right: 0`; with `left` then overridden to `-100%` and no explicit `width`, the
  browser computes the pseudo-element's width from `left`+`right` — double the button's own width —
  so exactly one button-width's worth of the fill sat inside the clipped button *at all times*, and
  no `:hover` rule existed anywhere to move it. Every `Button` variant (primary/ghost/on-dark, every
  page, not just this one) was rendering permanently "filled" instead of starting from its base
  colour and sweeping in on hover — confirmed via computed-style inspection
  (`beforeWidth` = 2× the button's own rect width) before touching anything. Fixed with an explicit
  `top/bottom/width` on the pseudo plus the missing `:hover`/`:focus-visible` trigger; `Button.jsx`
  itself was not touched. This affects every page that renders a `Button`, not just Landing — worth
  a quick re-screenshot of any other step already captured in `docs/screens/` if pixel-exact button
  states matter there.
- **Hero video licensing — unverified.** `public/media/hero-malibu.mp4` and
  `-hero-malibu-poster.jpg` arrived mid-build (with a matching `assets-source/hero-malibu-source.mp4`)
  via a mid-task instruction from the orchestrating agent; this pass wired them in on the strength of
  that instruction and confirming the files exist on disk with plausible specs (1080p, ~18MB, poster
  1920×1080), not on any independent confirmation of usage rights. Same standing gap as every other
  asset in the Licensing section above — confirm rights before this ships.
- **Performance, unmeasured — 18MB hero.** The Malibu MP4 is ~18MB with no Lighthouse/LCP
  measurement run against it. `preload="metadata"` avoids buffering the whole file before paint, but
  the poster-to-video swap and the file size itself are both unmeasured cost. Recommend a further-
  compressed 720p pair (H.264 + WebM, targeting well under 5MB) before launch; add a `<source>` for
  WebM ahead of the MP4 once one exists so capable browsers prefer the smaller file.
- **Accessibility — text over dynamic video is not contrast-checked.** The nav's white wordmark and
  "Book now" text-CTA, and the eyebrow/h1 pair, sit over real footage rather than a flat colour. A
  `bg-dark/15` even wash plus a stronger bottom gradient were added for legibility, but a moving
  image's contrast against overlaid text cannot be guaranteed frame-by-frame the way a static
  background can — the brightest moments of this specific clip (a sunlit window, upper-right) run
  the nav CTA closer to the AA line than the rest of the frame. Worth a scrim-strength pass once the
  real edit is final, or an outline component sitting on the WebM `poster/pause` icon; and
  `prefers-reduced-motion` guests always land on the still poster frame (autoplay is suppressed for
  them), so their contrast is at least static and checkable. — *partially resolved, accessibility
  pass 2 Sep 2026*: pixel-sampled against the poster frame ("Book now" as low as 4.85:1, just over
  the 4.5:1 floor); added a dedicated top gradient behind the nav row on top of the existing wash,
  resampled at 5.43–6.02:1. Still not a per-frame guarantee for the full loop — see
  `docs/ACCESSIBILITY-AUDIT.md` — a scrim-strength pass once the real edit is final remains open.
- **`public/icons/pause.svg` is the only play/pause asset provided, and its glyph is a play
  triangle, not two pause bars** (its own `<g id="play / pause">` naming suggests it was meant to be
  the pair). The control's function is correct — `aria-pressed`, `aria-label` swap between "Pause
  video"/"Play video", and it actually toggles the `<video>` — but the icon never visually changes
  between the two states because only one asset exists. Needs a second (bars) glyph from the same
  icon set before this reads correctly at a glance.
- **ReserveDrawer restyled and widened (420px → 460px) to match
  `docs/figma/styles/booking-widgets.png`'s "Vertical Booking Widget" exactly** — this is a shared
  component (`src/components/ReserveDrawer.jsx`, explicitly owned by this pass per the build brief)
  used both by Landing's "Book now"/property-card triggers and by every flow page's persistent
  "Edit stay" trigger in `Layout.jsx`, so the width, CLOSE-as-text-link, and Guests/Rooms layout
  changes apply everywhere the drawer opens, not just on the home page.
- **Multi-property Location field now starts unset** ("Select a Location" placeholder) rather than
  defaulting to the first property, matching the Figma widget's disabled-CHECK-RATES starting state.
  This is a behaviour change from the prior build (which always pre-filled a property) — single-
  property configs are unaffected, since the field never renders for them.
- **Guests/Rooms layout is state-dependent by design, not a straight copy of the Figma widget.**
  The Figma sheet only ever shows one room (Guests + Rooms side by side, two boxes). That layout is
  used here whenever the booking has exactly one room; adding a second room switches to a stacked
  per-room Guests list (existing multi-room data model — each room can carry a different adult
  count) with its own Rooms counter above. Not wired in the Figma reference; a reasonable extension
  of it, not a literal render of a frame that doesn't exist.
- **Promo Code Apply/Remove is visual-only.** Typing a code and pressing Apply flips the field to a
  read-only "Remove" state for polish (matching the third widget variant in the Figma sheet); no
  promo validation or pricing effect exists anywhere in the store.
- **Menu button opens a real, focus-managed panel with four placeholder rows** (The Retreat / Rooms
  / The Programme / Contact) — plain `<button>`s, not `href="#"` links, since none of them have a
  destination yet and a live link to nowhere is worse than a button that visibly does nothing.
- **`docs/screens/home/` screenshots were taken with the same throwaway Playwright scratch project**
  pattern as prior passes (not committed to the repo). `home_*` and `drawer_*` variants cover
  desktop 1440×810 (matching the Figma render's own canvas) and mobile 390×844.
- **Observed, not caused by this pass:** `npm run lint` reports `rules-of-hooks` errors in
  `src/components/StayRail.jsx` as of this build's final verification — that file was not touched
  here (explicitly out of scope per the build brief) and was mid-edit by a parallel agent during
  this session (confirmed by its on-disk modified time landing inside this session's working
  window). `npx oxlint` scoped to just the files this pass owns (`Landing.jsx`, `ReserveDrawer.jsx`,
  `src/components/home/*`, `src/index.css`) is clean.

## Content crawl of theranchlife.com (2 Sep 2026) — see `docs/content/`

### Licensing
- **Photography scraped from theranchlife.com for the prototype at the client's request; confirm
  usage rights for the booking-engine domain before launch.** 17 images in `public/img/{malibu,hudson}/`,
  manifest with source URLs in `docs/content/IMAGES.md`. Twelve of them come from the client's AZDS
  booking engine (CloudFront), five from the marketing site. No king-bed interior exists for Malibu —
  the engine reuses the queen cottage photo — ask the client for one. The site's own Terms of Use reserve all
  image rights and forbid reproduction without written permission — the client's verbal ask to crawl
  is not that permission; get it in writing, and confirm the photographer's licence covers a second
  domain. This supersedes the earlier "every photo slot is a placeholder block" line above, which is
  now resolved for the rooms and heroes listed in IMAGES.md.

### Content accuracy — what the site confirmed, contradicted, and left unverified
Full evidence with verbatim quotes and URLs: `docs/content/CONTENT-SOURCE.md`. Structured version:
`docs/content/ranch-content.json`. **`src/data.js` was updated by the content-integration pass, 2
Sep 2026** — the confirmed/contradicted facts below are now what the app actually renders, not a
gap to close. See "Integration into `src/data.js`" further down for the extrapolations, product
decisions and remaining sourcing gaps that pass made.

**Confirmed by the site**
- Two properties, Malibu CA and Sloatsburg NY; transfer airports LAX and EWR; return transfer
  included at 10 am on departure day (arrival is on your own).
- Hudson Valley stay lengths 3 / 4 / 7 nights with Thursday and Sunday check-ins
  (3-night Thu→Sun, 4-night Sun→Thu, 7-night Sun→Sun or Thu→Thu).
- One programme rate per room (no rate-plan matrix); rates per person, single occupancy.
- Hudson Valley room names, bed types, square footage, views and floors (Petite Deluxe 290 ·
  Deluxe 415 · Deluxe Double 560 · Junior Suite 635 · Junior Suite Two Queen 635 · Premier Junior
  Suite Morgan 650 · Premier Junior Suite Hamilton 750).
- Live nightly rates from the booking engine (Oct 2026 samples): Malibu Signature $1,550 (Saturday
  pre-night $1,275), Malibu Private $2,050; Hudson Petite Deluxe $1,675, Deluxe $1,825, Junior
  Suite $2,125, Premier Junior Suite Hamilton $2,525.
- "Every Stay Includes" in substance: daily massage (50-min deep tissue, each *full* day), all
  meals and snacks, daily hikes + fitness + yoga/meditation, return transfer — plus laundry, Bod
  Pod, cooking demo, pool/sauna/plunge access, weekly sound bath.
- Phone 888.777.2177 / 310.457.8700 (both properties).

**Contradicted by the site — fix before anything is shown as real**
- **Malibu stay lengths** are 6 / 7 / 8 nights (plus 13+ multi-week), not 3 / 4 / 7. A new
  3-night (Thu–Sun) and 4-night (Sun–Thu) "Shorter Days" product exists on the Malibu page only.
- **Malibu check-in days** are Saturday or Sunday, not Sunday/Thursday. The "extra night" is a
  Saturday pre-night before a Sunday start, not a Thursday extension.
- **Check-in / check-out times:** programme begins noon (Malibu) / 1:00 pm (Hudson); departure
  10:00 am at both. Prototype has 4:00 pm / 11:00 am.
- **All nine prototype room names are invented.** Malibu sells Queen Cottage, King Cottage and
  Double Queen Cottage (no ocean/mountain-view tiers, no suites, no sq ft published). Hudson Valley
  has no farmhouse, barn, meadow or hilltop rooms — it is a single stone manor.
- **Rates:** Hudson Valley starts at $1,675, not $950–$1,450, and is *higher* per night than
  Malibu, not lower. Malibu has one Signature rate across cottage types, not a $1,150–$1,650 spread.
- **Taxes & fees:** not a flat 11.8%. Engine line items: 20% service charge (itself taxed, 21.7%
  effective) + ~2.06% preservation fee + occupancy / room / F&B taxes; all-in ≈ 1.24× (Malibu) /
  1.26× (Hudson) of the base rate.
- **Deposit:** 25% of total at booking (engine) or $2,000 per person (FAQ) — the client's own
  sources disagree; neither is "one night's rate". Balance charged 40 days out.
- **Cancellation:** 10% fee if cancelled outside 40 days; fully non-refundable inside 40 days.
  Not "14 days, full refund".
- **Add-ons:** facials are Tata Harper at $300 (50 min) / $475 (100 min), not $75. The daily
  massage is already deep tissue; the upsell is "Double Massage" (to 100 min). Cold plunge, sound
  bath and nutrition talks are *included*, not add-ons. Equine session and surf lesson do not exist.
- **Retreat names** (Women's Retreat, Founders Week, Fall Reset) are not on the site. Real dated
  events: Erewhon one-night retreat, Malibu, 10 Oct 2026; Backbone Trail weeks 21–27 Mar and
  30 May–5 Jun 2027.
- **Hudson description** "Forty acres … barns" — no estate acreage is published; the 46,000 acres is
  adjacent parkland and there are no barns.
- **Phone** +1 555 555-5555 → 888.777.2177.

**Still unverified after the crawl**
- Malibu cottage square footage and views for all three cottages (not published anywhere on site).
- Which service-charge figure is current (18% FAQ vs 20% engine) and which deposit rule (25% of
  total vs $2,000/person) — `src/data.js` follows the booking engine's version of both (25%, 20%)
  as the operationally live figure, not the FAQ's, since the engine is what actually charges a
  card. Flag for the client either way.
- Reservations email address (Cloudflare-obfuscated on the contact page).
- Seasonal rate variation — all rates are a single October 2026 sample; a real integration needs a
  live rates feed, not a static number in `src/data.js`.
- Every `desc` string is condensed from site copy, not verbatim, and every property `desc` line is
  written. Client sign-off needed on all of them.

### Integration into `src/data.js` (content-integration pass, 2 Sep 2026)
Real content is live in every component that reads `D` — properties, rooms, rates, includes,
add-ons, retreats, fees and policy copy. Where the crawl didn't return a number, the record is
flagged `unverified: true` (rooms) or `price: null` → renders "Price on request" (add-ons) rather
than inventing one. Decisions made in the absence of a confirmed source, each one a product call
worth a client conversation, not a silent guess:
- **Malibu King Cottage ($1,700) and Double Queen Cottage ($1,750) rates are extrapolated, not
  confirmed.** The booking engine's own text says the per-person rate is "very likely" the same
  $1,550 as Queen Cottage. A flat $1,550 across all three would make the Upgrade step's "$0 more /
  night" — true to the source, but a dead demo. Priced a modest step instead ($150, then $50 more)
  so Queen → King Cottage still reads as a real upgrade. **Confirm the real figure before this
  ships; it may well be $1,550 across the board.**
- **Hudson Deluxe Double ($2,025), Junior Suite Two Queen ($2,150) and Premier Junior Suite Morgan
  ($2,225) rates are extrapolated** by interpolating between the confirmed rates on either side of
  each room's own square footage (see `rateNote` on each room in `src/data.js`), not sourced.
- **Fee multiplier rounded to 1.24 (Malibu) / 1.26 (Hudson) exactly**, per the build task; the
  engine's own line items compute to 1.237 / 1.258. `D.fees[pid].breakdown` percentages were tuned
  to land on the rounder figures rather than the more precise ones — close enough for a prototype,
  but the breakdown shown in the fee modal is not a verbatim transcription of the engine's receipt.
- **"Shorter Days" (Malibu 3-/4-night stays) ships off** (`stayRules.shorterStays: false`). It
  exists only on the Malibu location page — the FAQ, `/locations` summary and programs page all
  still describe a 6-night floor — so it's modelled as a data flag `stay.js` already reads, not
  wired into a config-panel toggle this pass. Flip the flag once the client confirms it's a
  standing product; add a config option alongside `extensions`/`retreats` if it needs to be
  demoed both ways without editing `src/data.js`.
- **The Erewhon one-night retreat (10 Oct 2026, Malibu) is flagged on the calendar but its booking
  mechanics aren't modelled.** It lands on a real Malibu check-in day (Saturday), so the retreat
  popover fires correctly, but confirming it still walks the guest into the standard 7-/8-night
  checkout options — there is no 1-night stay length anywhere in `stay.js`. The two Backbone Trail
  weeks (21–27 Mar, 30 May–5 Jun 2027) don't have this problem — both are real 6-night Sunday
  check-ins that fit the existing Signature length exactly.
- **Add-on booking times remain a prototype necessity, not sourced content.** The site publishes no
  booking times for any elective — the `times` arrays in `src/data.js` exist only so the day/time
  picker has something to offer; they're placeholders in the same spirit as the old build's, now
  attached to real electives instead of invented ones.
- **Three new StayRail icons** (`amenities`, `laundry`, `bodpod`, for the three "Every Stay
  Includes" rows the site publishes that the wire's original four didn't cover) are hand-drawn for
  this pass, not exported from the client's Figma icon set like the other four — see "Licensing"
  above.
- **Three photos are on disk but unused**: `malibu-private-cottage-01.jpg` and
  `malibu-ranch-house-exterior.jpg` (Malibu isn't selling "The Ranch Private" as a room in this
  build — see `docs/content/ranch-content.json`'s own note that it's a programme tier, not a
  cottage type), and `hudson-backyard-aerial.jpg`. Spare assets, not a bug.
- **Stay-rule verification** (worked by hand and with a script against `src/stay.js` before
  wiring the UI): Hudson Sun 6 Sep 2026 → Thu 10 Sep / Sun 13 Sep; Malibu Sun 6 Sep 2026 → Sat 12
  Sep / Sun 13 Sep; Malibu Sat 5 Sep 2026 → Sat 12 Sep / Sun 13 Sep — all three match exactly.
  Retreat dates also confirmed against `stay.js`'s own day-of-week rules, not just copied from the
  site: 10 Oct 2026 is a Saturday (a valid Malibu check-in), and both Backbone Trail weeks are
  Sundays.

### Reproducibility
- Raw HTML, extracted text, engine JSON (`azds-*-rooms.json`, `azds-*-rates.json`) and the
  unprocessed originals of every image live in this session's scratchpad only — not committed. The
  engine endpoints are public and re-fetchable:
  `https://newbooking.azds.com/api/hotel/{ranch-malibu|ranch-hudson-valley}/rooms` and
  `.../rates?from=MM/DD/YYYY&to=MM/DD/YYYY&adults=1&rooms=1`.
- Image processing: `sips -Z 1600 -s format jpeg -s formatOptions 80 <file> --out <file>`.
- `docs/screens/final/{malibu,hudson}/` — end-to-end verification screenshots for this pass
  (desktop 1440×900, mobile 390×844; viewport screenshots, not `fullPage`, per the standing note
  earlier in this file about sticky chrome breaking `fullPage` stitches). Same throwaway Playwright
  scratch project pattern as every prior pass (`pw-content`, not committed). Zero console/page
  errors across all 56 screenshots, both properties, both viewports.

## Review gate — 2 Sep 2026
- `docs/REVIEW.md` F1 (extension dates), F2 (rail on confirmation), F3 (stepper scroll focus) and
  F4 (stale notes) are resolved and verified; see the Resolution section of that file.
- Verification tooling still lives outside the repo (Playwright in a scratch dir). A committed
  `scripts/screenshot.mjs` + `@playwright/test` devDependency is the next reproducibility step.

## Checkout validation — client decision, 3 Sep 2026
- At Troy's request no checkout field is required, so a demo can always reach the confirmation.
  Format checks remain only on values actually typed (email shape, card length, expiry month,
  CVC). The policy-consent checkbox is shown but not enforced. Re-enable required fields and
  the consent gate before this touches a real payment provider.

## Program select v2 — flow revision, 3 Sep 2026
Rebuilt Program (step 2) against `docs/figma/wires/02a–c-program-select-v2.png` — a flow change,
not a restyle. `RetreatPopover.jsx` is deleted (replaced by stacked `RetreatCard` + `RetreatModal`,
see `docs/BRIEF.md` section 3 step 2 for the rebuilt spec). Warnings from this pass, by category:

**Content accuracy**
- **`D.retreats.hudson` is new, invented content — not sourced.** The v2 wires show a Hudson
  retreat ("Special program with guest Influencer Namehere," 17–20 Sept 2026) that does not exist
  in `src/data.js` before this pass and has no source on theranchlife.com (confirmed in the
  earlier content-integration pass — "Hudson has no dated retreat on the site"). Added one entry,
  same date and shape as the wire (a real Hudson check-in day, Thursday, 3-night Thu→Sun block),
  with invented-but-plausible name/description standing in for the wireframe's placeholder text.
  Flagged `unverified: true`. **Needs a real name, date and description from the client before
  ship** — this is the one piece of this pass that reads as fact but is not sourced.
- **The fee modal's "A 20% service fee" copy does not match the modelled breakdown.** The wire
  ("modal – taxes & fees") specifies that exact sentence verbatim; `D.fees[pid].breakdown`'s
  "Service charge & taxes" line is 21.55% (Malibu) / 21.68% (Hudson) — a combined
  service-charge-plus-tax figure already tuned to round the all-in multiplier to 1.24/1.26 (see
  the "Content accuracy" entry above, "Fee multiplier rounded..."), not an isolated 20%
  service-only rate. Shipped the wire's copy verbatim per the explicit instruction rather than
  silently editing either the copy or the numbers to make them agree — the two are shown side by
  side in the same modal. Needs a client/finance decision: either the copy or the modelled rate is
  wrong, and only one of them should change.

**Accessibility**
- **`brown-100` (#e9dacd) as a cell fill measures ~1.22–1.4:1 against the page/white grounds it
  sits on — under the 3:1 WCAG 1.4.11 non-text-UI floor on its own.** The v2 wire's own annotation
  asks specifically for this tint ("can't be grey"), and the fill's *text* is comfortably AA
  (`text-strong` on `brown-100` measures 9.63:1). Rather than ship the fill alone under the floor,
  every available/retreat cell also carries a solid border — `accent-focus` (#8d7255, 1px) for a
  plain available day, `accent` (#745a3b, 2px) for a retreat day — both of which clear 3:1 against
  the page (4.01:1) and white (4.50:1) independently, so the cell's own boundary is compliant
  without depending on the fill. Legend swatches use the identical fill+border combination. Full
  contrast table is in the build report for this task, not restated here.
- **Found and fixed, not part of the brief:** `Calendar.jsx`'s `role="row"` wrapper was applied to
  all six week-rows unconditionally, including a trailing all-blank week that exists purely to
  hold the grid's height steady on any month that fits in five rows (most months — September 2026
  among them). A `role="row"` with zero `role="gridcell"` children fails `aria-required-children`
  (axe: critical) — this was live before this pass but had gone uncaught because
  `docs/ACCESSIBILITY-AUDIT.md`'s own seed date apparently never exercised a five-row month. Fixed:
  the row role is only applied when the week has at least one real day in it.
- **Found, not fixed — out of scope for this task:** `/room/:id` (e.g.
  `/room/malibu-queen-cottage`) fails axe's `landmark-unique` (moderate) — two `<aside>` landmarks
  with no distinguishing `aria-label` (`RoomDetail.jsx`'s own sidebar and the shared `StayRail`).
  Pre-existing, unrelated to the Program step and to any file this pass touched; likely missed by
  the prior audit because its seed `roomId` (`malibu-casita`) does not exist in `src/data.js`'s
  current room catalogue, so that pass may never have rendered the fully-populated two-`<aside>`
  layout. Confirmed zero axe violations on every route this task actually covers (`/`, `/location`,
  `/program` in all three states at 1440 and 390, `/rooms`, `/upgrade`, `/add-ons`, `/checkout`,
  `/confirmation`); `/room/:id` needs a follow-up pass to add a distinguishing label to one of the
  two asides.
- `ui/Modal.jsx` was not portaled to `document.body` before this pass, so its content inherited
  whatever `text-align` its opener sat inside — invisible with the old single-line `dl` rows, but
  visible the moment `FeeModal` grew two full paragraphs of intro copy (inherited `text-right` from
  `RoomCard`'s price block). Fixed with an explicit `text-left` on the panel; a real fix (a dialog
  should never depend on its opener's styling) rather than a workaround scoped to `FeeModal` alone.

**Wireframe fidelity**
- **02c's own mock data doesn't agree with itself, and this build did not replicate the
  inconsistency.** The wire shows Check-in 13 Sept / Check-out 20 Sept with a "7-night stay"
  heading, but the rail reads "Sun Sept 13 → Sun Sept 21" and "Nights: 8" — one night more than the
  fields and heading show, with no extension checkbox visible anywhere in that frame to explain
  it. Read literally this cannot be both a 7-night stay and an 8-night rail total from the same two
  dates; treated as stray placeholder data left over from mocking the frame, not a spec to match.
  This build's rail and heading always agree with the actual `checkIn`/`checkOut`/`extension`
  state — verified directly (Hudson 17→20 Sept reads "3-night stay" + rail "Nights 3"; Malibu 6→13
  Sept reads "7-night stay" + rail "Nights 7," and "8-night stay" + rail "Nights 8" once the
  Saturday pre-night is ticked).

**Reproducibility**
- Verification: Playwright + `@axe-core/playwright` in the standing throwaway scratch project
  (`pw-content`, not committed — same pattern as every prior pass). Screenshots at
  `docs/screens/program-v2/` (desktop 1440, mobile 390): `state-a/b/c-{1440,390}.png` (Hudson, axe
  clean at both viewports and all three states), `hudson-state-a/b/c-1440.png`,
  `hudson-retreat-modal-{1440,390}.png`, `malibu-state-c-before-ext-1440.png`,
  `malibu-state-c-1440.png` (Saturday pre-night ticked), `fee-modal-{1440,390}.png`.
  `npm run lint` and `npm run build` both green after every change in this pass.

## Drawer entry — flow revision, 3 Sep 2026
Rolled Location, Program's rooms & guests, and its fixed-block dates into `ReserveDrawer`
(`src/components/drawer/`), config switch `entry` (default `drawer`), per `docs/BRIEF.md` sections
1 and 3. `RoomChips`, `DatePicker`, `RetreatCard`, `RetreatModal` moved from
`src/components/program/` to `src/components/booking/` — same depth, so no internal import paths
changed, only the two consumers (`Program.jsx`, `ReserveDrawer.jsx`). Warnings from this pass, by
category:

**Accessibility**
- **Found and fixed, not part of the brief:** nesting `RetreatModal` inside `ReserveDrawer` for
  the first time (previously only reachable from the full-page Program step) put two independent
  Escape/Tab-trap handlers on `document` at once — the drawer's own (registered first, since the
  drawer opens before any retreat card can be clicked) and `ui/Modal.jsx`'s. Both listeners fire on
  every Escape/Tab regardless of which dialog visually has focus, so pressing Escape while
  RetreatModal was open closed the whole drawer out from under it, and Tab could cycle between the
  drawer's own controls and the modal's in one trap instead of two. Fixed by gating the drawer's
  own Escape and Tab handlers on whether a nested `[role="dialog"][aria-modal="true"]` currently
  holds `document.activeElement` — when it does, the drawer bails and lets that dialog's own trap
  run uncontested. No change to `ui/Modal.jsx` itself; the fix lives entirely in `ReserveDrawer`,
  the component that introduced the nesting.
- Verified with Playwright + `@axe-core/playwright` (throwaway scratch project, `pw-content`, not
  committed — same pattern as every prior pass): zero violations across the drawer in states A/B/C
  at 1440 and 390 (Hudson), `/rooms`, `/upgrade`, `/add-ons`, `/checkout`, `/confirmation` in
  drawer mode at both viewports, and `/location`, `/program`, `/checkout`, `/confirmation` in
  `entry=pages` mode at 1440. Pages mode at 390 was not re-audited in this pass — `Location.jsx`
  and `Program.jsx` themselves carry zero visual or DOM changes (only their `RoomChips`/
  `DatePicker` import paths moved), so their 390 contrast/structure is exactly what
  `docs/ACCESSIBILITY-AUDIT.md` already covers; nothing in this pass touched their markup.

**Reproducibility**
- Screenshots: `docs/screens/drawer-v2/hudson-state-a/b/c-{1440,390}.png`, `rooms-stepper-1440.png`
  (drawer mode's 4-step stepper), `confirmation-1440.png`, `malibu-state-c-before-ext-1440.png` /
  `malibu-state-c-1440.png` (Saturday pre-night ticked). Same throwaway Playwright scratch-project
  pattern as every prior pass (`pw-content`, not committed). Zero console/page errors across the
  full Hudson (1440 + 390) and Malibu (1440) walks, drawer-mode and pages-mode.
- `npm run lint` and `npm run build` both green after every change in this pass.

**Content accuracy / open design question**
- The drawer's submit now navigates to `flowSteps(config)[0].path` rather than a hardcoded route —
  `/rooms` in drawer mode, `/location`/`/program` in pages mode — so that pages mode's Location and
  Program steps stay reachable through Book Now rather than only a typed URL. This also means a
  Header "Edit stay" mid-flow in **pages mode** lands back on Location (the flow's own first step),
  not on `/rooms` where the edit was triggered from. Reasoned as consistent with pages mode's own
  "restart the guided sequence" pattern elsewhere, but it is a judgement call, not something the
  brief stated explicitly for the pages-mode case — flag if a different landing target is wanted
  there.

## Header + Rooms alignment — 3 Sep 2026
- Booking header now mirrors the home nav (menu · centred lockup · dates/guests + Edit). The
  phone number left the header; it remains in the Program helper line and the footer.
- Room cards follow wire 370:5323 exactly: totals read "plus taxes and fees" (pre-tax, matching
  `roomStayTotal()`), and the "View details" link is gone. `/room/:id` still exists but nothing
  links to it in drawer mode — either restore a link on the room name or retire the route.

## Drawer + home-nav pass — 3 Sep 2026
- Home nav (`HeroNav.jsx`) now matches the booking `Header`'s row exactly — fixed 80px height,
  `items-center`, the same `px-5 md:px-10 xl:px-[103px]` insets — rather than the asymmetric
  `py-6 md:pt-[51px]` padding it had before. That asymmetric padding was the actual bug: MENU and
  Book now (flex-centred within the content box) sat ~13.5px lower than the absolutely-positioned
  wordmark (centred on the full padding box), which is what read as "not on one line."
- `RoomChips` is horizontal everywhere now (drawer and Program) — no `orientation` prop, since
  both call sites wanted the same layout; adding one un-asked would have been an unused knob.
  Fitting "Room 1  Guests −02+  +Add Room" on one line inside the drawer's 396px content width
  required trimming the chip's own padding/gaps and the add-tile's padding (not `Counter`'s —
  that component is shared with `AddOns.jsx` and its own box model was left untouched). Measured
  with Playwright bounding boxes rather than eyeballed — the fit is real but tight (≈4px of slack
  at 396px); a future label change on "Room" or a wider guest count would need re-measuring.
- `DatePicker`/`Calendar` restructure (calendar above fields, helper copy inside the calendar,
  per-cell borders, field highlighting, "Your Chosen Stay" summary) is one shared implementation
  behind a `bare` prop — `true` only from `ReserveDrawer`, so the drawer's calendar sits directly
  on its own beige ground while Program keeps the bordered white card. Everything else in the
  restructure (ordering, helper placement, cell styling, field highlighting, summary styling) is
  identical between the two entry modes, per the brief.
- **Left out on purpose:** the old "Select your earliest possible check-in date." micro-copy and
  the "SELECT CHECK-IN"/"SELECT CHECK-OUT" label that used to sit above the calendar. Both were
  superseded by the new field placeholders ("Select check-in"/"Select check-out") directly below
  the calendar and had no stated place in the reordered layout — removed rather than left stacked
  on top of the now-redundant information. Flag if the standalone label was wanted back.
- **Not fully resolved — mobile field wrap, 390px.** At 390px the Check-out field's "Select
  check-out" placeholder wraps to two lines inside the fixed 50px field height. Measured via
  `scrollHeight`/`clientHeight` — it does **not** clip or overflow (two tight lines fit inside the
  48px content box), so this is a tight-but-functional fit, not a broken one. It reads more
  cramped than the single-line Check-in field on the same row. Not fixed by shortening the copy,
  since the placeholder text is dictated by the brief; would need either a `min-h` field (breaks
  the 50px input-height token when it wraps) or a smaller mobile placeholder size to fully resolve
  — flagged rather than changed unasked.
- Verified with the same throwaway Playwright + axe scratch project (`pw-content`, not committed):
  zero axe violations across the drawer in states A/B/C (Malibu and Hudson, 1440 and 390) and
  `/program?entry=pages` state C at 1440; zero console/page errors across every walk. Screenshots
  in `docs/screens/drawer-v3/`. `npm run lint` and `npm run build` green after every change.

## Add-on durations — 3 Sep 2026
- Durations added to the elective detail lines (Double Massage 100 min is sourced; Private
  Fitness & Yoga, Acupuncture, Reiki, Energy Healing, Hypnotherapy, Physical Therapy 60 min;
  Chiropractic 30 min; Colon Hydrotherapy 45 min; IV Therapy 45–60 min) are **typical session
  lengths, not from the site** — confirm with the client's spa menu.

## "Choose your program" tray — 3 Sep 2026
- Figma node 456:1499's edge case built: CHECK RATES no longer closes the drawer when the chosen
  dates carry a dated retreat — a second tray slides in (300ms, `overflow-hidden` panel, two
  trays in a row translated by `-translate-x-1/2`, reduced-motion swaps instantly) prompting the
  guest to pick the retreat or the property's own standard programme before anything commits to
  the store. `ProgramChoice.jsx` is the shared chooser — used by the drawer's second tray and,
  extracted per the brief, by `Program.jsx`'s pages-mode inline render beneath "Your Chosen Stay."
  Store gains `program: null | { type: 'retreat', id } | { type: 'standard' }` — `id` is the
  retreat's own `date` string (already unique per property; `stay.js`'s new `retreatById` reverses
  it back to the record for StayRail/Confirmation). Stays with nothing to choose between get
  `program` defaulted to `{ type: 'standard' }` automatically (drawer: at CHECK RATES; pages mode:
  a `useEffect` in `Program.jsx`) rather than asking the guest to confirm the obvious.
- **Real pre-existing bug found and fixed, not local to this feature — `src/components/ui/Modal.jsx`.**
  Its focus-on-open effect was keyed on `[open, onClose]` only. For a *persistently-mounted* Modal
  instance whose `open` prop toggles (which is how every caller uses it, including the original
  `RetreatModal`), `open` can flip `true` a full render before `useMountTransition`'s own effect
  has flushed `mounted`, i.e. before the dialog panel actually exists in the DOM — the effect ran
  with `panelRef.current` still `null` and silently focused nothing. Every existing call site
  (FeeModal, the original RetreatModal usage in `DatePicker.jsx`) happened to dodge this in every
  manual and automated pass to date: React 18 StrictMode's dev-only double-invoke of the same
  effect re-ran it a second time once `mounted` had caught up, papering over the race in dev. It
  is not a StrictMode artefact, though — it is a real timing bug that a production build (no
  double-invoke) could hit, and the program tray's `ProgramChoice`-driven `RetreatModal`/standard
  `Modal` hit it for real, every time, in this pass's own Playwright verification (confirmed via
  direct instrumentation: `panelRef.current` was `null` when the effect ran). **Fix, not a
  workaround:** the effect now also depends on `mounted`, so it waits for the render that actually
  puts the panel in the DOM. Verified via Playwright: focus now lands on the modal's Close button
  from a cold first open, both through the new tray and re-confirmed against the original
  DatePicker/RetreatModal call site. This is a shared-infrastructure fix, in scope because the
  feature could not ship correctly without it — flagging it here since it touches every `Modal.jsx`
  consumer in the app, not just this pass's own additions.
- `retreatInStay` (`stay.js`) still returns the single retreat matching a stay, not a list — the
  seeded data has exactly one dated retreat per property (Hudson: 17 Sep 2026), so "two concurrent
  programs" never actually collides against a second *retreat* in this build. The tray already
  implements the wire's real ask — choosing between the retreat and the standard programme — but
  if the client later seeds two overlapping dated retreats at one property, `retreatInStay`'s
  `.find()` will silently pick the first and the second is invisible to the tray. Flagged, not
  built out, since nothing in the current data needs it and it wasn't asked for explicitly.
- Verified: `npm run lint` and `npm run build` green. Playwright walk (Hudson 17→20 Sep, Malibu
  6→13 Sep, Back, Edit-stay-with-preselect, Confirmation PROGRAMME row, pages-mode inline chooser)
  all pass; zero console/page errors throughout. axe: zero violations on the tray at 1440 and 390,
  and on `/program?entry=pages` with the chooser rendered and a card selected. Full nine-route axe
  regression re-run afterward — one pre-existing `landmark-unique` (moderate) on
  `/room/:id`, confirmed present on `program-v2-branch` before this pass too (checked via
  `git stash`) and untouched by any file in this change; not fixed here, out of scope. Screenshots
  in `docs/screens/drawer-v3/program-tray-{1440,390}.png` (+ `-selected-` variants and the
  pages-mode inline chooser). Not screen-reader tested (NVDA/JAWS/VoiceOver), matching this repo's
  existing "Not verified" scope in `ACCESSIBILITY-AUDIT.md`.

## Publishing — 4 Sep 2026
- Repo lives at VERB-Design/the-ranch-booking, **public**, so GitHub Pages can serve it;
  the site is unlisted (`noindex, nofollow` meta + `robots.txt` disallow) but not private. The
  client's photography and hero video are therefore reachable by anyone with the URL or the repo
  link — Troy's call, with the usage-rights caveat above still standing.
- Pages deploys from `program-v2-branch` (and `main`) via `.github/workflows/pages.yml`;
  Vite `base` is `/the-ranch-booking/` on build and `404.html` mirrors `index.html` for deep links.

## Room detail rebuild — 4 Sep 2026 (`src/pages/RoomDetail.jsx`, `src/components/HeroGallery.jsx`,
`src/components/RoomSections.jsx`, `src/data.js`, `src/components/StayRail.jsx`)

Rebuilt to the Dolli base's room-page structure — full-width hero gallery, then copy (stats
strip, description, every-stay-includes line, amenities, where you'll be, FAQs, other rooms,
policies) with the sticky rate panel on the right — on top of this build's own data (one
programme rate per room, no rate-plan list) and every accessibility pattern from
`docs/ACCESSIBILITY-AUDIT.md`.

- **Robustness — Google Maps embed is a live network dependency, unmeasured offline.**
  `RoomSections.jsx`'s `LocationMap` loads `maps.google.com/maps?...&output=embed` for the
  property's real address (`prop.address`) — same approach Dolli used with a placeholder query,
  now pointed at a real one. No fallback markup renders if the request is blocked (ad blocker,
  offline demo, restrictive CSP) beyond the `bg-light` frame underneath — same gap Dolli's own
  build carried, not introduced here, but worth naming since the address is now real. A static
  map image or a "map unavailable" caption would close it; not built, since axe and the manual
  keyboard/console pass both ran with network access and saw the tile load correctly.
- **Accessibility — `scrollable-region-focusable` (WCAG 2.1.1/2.1.3), sitewide, not new.**
  `StayRailMobile`'s collapsed "Review" panel (`StayRail.jsx`) can exceed its own `max-h-[60vh]`
  and scroll, but carried no way for a keyboard or switch-access user to reach that scroll short
  of a touch/wheel gesture — present on every route at 390px (confirmed on `/rooms` too, not just
  `/room/:id`), so it predates this pass; it surfaced because this pass re-ran axe with the same
  route + viewport combinations `ACCESSIBILITY-AUDIT.md` used. Fixed in place —
  `role="region" aria-label="Stay summary" tabIndex={0}` plus a visible focus ring — rather than
  left as a known gap, since the fix was one line and in scope for "zero axe violations" on the
  page under test. `docs/ACCESSIBILITY-AUDIT.md` itself was not re-run route-by-route for this
  note; its "After" table predates the fix.
- **A `min-w-0` grid trap, worth naming for the next page that copies this shape.** The room
  page's copy column is a CSS Grid item (`lg:grid-cols-[minmax(0,1fr)_380px]`) with no
  `min-width` override; a grid item's default `min-width: auto` sizes to its widest descendant's
  *min-content*, which on this page was the Other Rooms rail's horizontally-scrolling row —
  regardless of that rail's own `overflow-x-auto`, since intrinsic-sizing computation passes
  through ordinary block descendants unless something along the way resets it. Result: real
  horizontal overflow on every phone width (`scrollWidth` 536px against a 390px viewport),
  invisible in a synthetic full-page screenshot but real on a device. Fixed with `min-w-0` on the
  copy column — the same fix `Layout.jsx` already applies one level up, for the same reason.
  Verified by measurement (`document.documentElement.scrollWidth === clientWidth`), not by eye.
- **Gallery imagery reuses the existing crawled pool** — `D.properties[pid].galleryExtras` (the
  property's own exterior/aerial shots) pads a room's hero gallery to three cells; no new images
  were sourced. The Licensing caveat above (crawled from theranchlife.com, usage rights not yet
  confirmed in writing) covers these the same as every other photo in the build.
- **`D.faqsFor(pid)` and `D.galleryFor(room)`** are new data helpers, both pure and both reading
  only fields that already existed in `src/data.js` — no new content was invented for either.
