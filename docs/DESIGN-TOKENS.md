# The Ranch — Design Tokens

Extracted from Figma "The Ranch — Web Build 2026" (file `N9EBUptwB1hqACgjOBlXg7`), frames
Colors (3008:4251), Typography (3011:4139), Buttons & Controls (3010:4129), Fieldset (54934:7140),
Booking Widgets (54825:3355), Logos & Icons (3008:4157). Reference renders live in
`docs/figma/styles/*.png`; raw Figma design-context dumps in `docs/figma/styles/*.figma.txt`.

These become the single source of truth in `src/index.css` under Tailwind's `@theme`.
Do not add a parallel `:root` block for colour or type — the engineer inherits the theme.

---

## 1. Colour

### Primitives (hex, from Figma variables)

| Scale | 25 | 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **charcoal-gray** (primary, base 600) | #f1f1f1 | #ebebeb | #dadada | #b4b3b3 | #929090 | #716f6f | #4f4d4d | #313030 | #262525 | #1c1b1b | #111111 | #080707 |
| **brown** (primary, base 600) | #f7f4f1 | #f4ede6 | #e9dacd | #d6c3b2 | #c1a78c | #a78c6f | #8d7255 | #745a3b | #554431 | #392e23 | #201a15 | #14100d |
| **off-white** (primary, base 600) | — | — | #fdfcfa | #fcf9f4 | #fcf9f4 | #faf6ef | #f9f3e9 | #f8f1e6 | #f2ebdf | #efe6d8 | #e9e0d3 | — |
| **taupe** (secondary, base 300) | — | #f8f6f4 | #f0eae4 | #e0d4c8 | #c6b09c | #b69781 | #a78068 | #9a6f5c | #805b4e | #694b43 | #563f38 | — |
| **malibu** (tertiary, base 700) | — | #f5f3f3 | #eae4e3 | #d8c9c6 | #c8ada9 | #bc9189 | #a37a72 | #89645c | #715049 | #4c3631 | #291c1a | — |
| **hudson-valley** (tertiary, base 700) | — | #f5f8f6 | #dee9e1 | #bdd2c4 | ≈#8fb39c | ≈#5f9273 | ≈#437a5a | ≈#356649 | ≈#2d5a44 | ≈#1f4432 | ≈#142e22 | — |
| **greyscale** | — | #f2f2f2 | #e7e7e7 | #d1d1d1 | #b0b0b0 | #8f8f8f | #6d6d6d | #5c5c5c | #4f4f4f | #3d3d3d | #2b2b2b | — |

Hudson Valley 300–900 and greyscale 400–900 were only available as rendered swatches, not
variables; values marked ≈ are sampled from the render and need designer confirmation.

Other: **error** #d12828 · **success** ≈#148a54 (sampled) · black #000 · white #fff.

### Semantic tokens (what the build actually uses)

| Token | Value | Use |
|---|---|---|
| `background/primary` | #f8f1e6 (off-white 600) | Page ground |
| `background/light` | #fcf9f4 (off-white 200) | Cards, widget panels, form fills |
| `background/dark` | #262525 (charcoal 700) | Dark bands, primary button |
| `surface/white` | #ffffff | Location dropdown list |
| `text/body` | #4f4d4d (charcoal 500) | Body copy |
| `text/strong` | #313030 (charcoal 600) | Calendar days, emphasised copy |
| `text/heading` | #111111 / #000 | Headings |
| `text/muted` | #6d6d6d (greyscale 500) | Form labels, inactive |
| `text/disabled` | #b0b0b0 (greyscale 300) | Disabled days, disabled inputs |
| `accent` | #745a3b (brown 600) | Links, selected states, calendar range, icons |
| `accent/focus` | #8d7255 (brown 500) | Focus border |
| `border/default` | #d6c3b2 (brown 200) | Inputs, counters, card rules |
| `border/hover` | #c1a78c (brown 300) | Input hover |
| `border/disabled` | #d1d1d1 (greyscale 200) | |
| `border/med` | #8d7255 | Section dividers on dark |
| `button/primary` | #262525 → hover #4f4d4d → pressed #929090 → selected #111 → disabled 30% opacity | |
| `button/primary/text` | #ebebeb (charcoal 50) | |
| `button/ghost` | transparent, 1px #262525 border; selected: bg #745a3b text #f7f4f1 | |
| `button/on-dark` | bg #fdfcfa text #262525; selected bg #745a3b | |
| `forms/fill` | #fcf9f4 · selected #faf6ef | |
| `calendar/range` | bg #745a3b, text #f7f4f1 | Start cell rounds left 2px, end cell rounds right 2px |
| `error` | #d12828 | Labels, borders, helper text |

Property accents (optional, use sparingly as a tint on the location cards / rail):
Malibu #715049 · Hudson Valley ≈#2d5a44.

---

## 2. Typography

**Families**
- `family/heading` — **Times New Roman** via the client's Adobe Fonts kit
  (`https://use.typekit.net/sva0dtq.css`, family `"times-new-roman"`, Regular 400 + Bold 700 with
  italics). Stack: `"times-new-roman", "Times New Roman", Times, "Liberation Serif", serif`.
  Light 300 is specified in Figma but not in the kit — render Regular and note the gap.
- `family/body` — **Inter** (Google Fonts) — Light 300, Regular 400, Medium 500, Bold 700.
  Body copy defaults to **Light 300**, line-height 1.65, `font-feature-settings: "lnum" 1, "pnum" 1`.

**Root sizing** — Figma assumes root 8px (1rem = 8px). Do **not** change the browser root; express
the scale in px inside the theme and keep rem at 16.

**Headings (Times New Roman, line-height 1.2)**

| | 1440 | 1280 | 768 | 360 |
|---|---|---|---|---|
| h1 | 64 | 62 | 60 | 48 |
| h2 | 56 | 52 | 48 | 40 |
| h3 | 48 | 44 | 42 | 38 |
| h4 | 36 | 36 | 34 | 34 |
| h5 | 32 | 30 | 30 | 28 |

**Body (Inter Light 300, lh 1.65 · large/xlarge lh 1.35)**

| class | 1440 | ≤768 |
|---|---|---|
| intro | 32 | 28 → 24 |
| xlarge | 24 | 22 → 20 |
| large | 20 | 18 |
| base | 16 | 16 |
| small | 14 | 14 |
| xsmall | 12 | 12 |
| tiny | 10 | 10 |

**Eyebrows & labels (Inter, uppercase)**
- eyebrow-default: 14px Regular, tracking 1.68px (12%), lh 1.2
- eyebrow-thick: 14px Medium/Bold, tracking 1.68px
- labels-small: 12px Regular, tracking 1.44px
- labels-small-thick: 12px Medium, tracking 1.44px
- Section title (style-guide only): 21px Regular, tracking 2.1px

**Button text** — Inter Regular 12px, uppercase, tracking 1.8px (15%), line-height 1.

**Forms** — label 12px Regular #6d6d6d · input 14px Regular · helper/tiny label 11px · link inside
input 12px underline #745a3b.

---

## 3. Spacing, radius, sizing

- `spacing/1` 4 · `/2` 8 · `/3` 16 · `/4` 24 · `/5` 32 · `/6` 48 · `/7` 64 · `/8` 80 · `/9` 100
- Radius: `sm` 2 · `md` 4 · `lg` 8 · `4xl` 20 · `pill` 9999. **Buttons and inputs are 2px or square.**
  Cards from the wires are 8px (`lg`).
- Button: min-height 50px, max 64, padding 16px 24px, gap 8px, icon 18px.
- Input: height 50px, padding 16px, gap 4px, radius 2px, icon 18px.
- Counter (Guests/Rooms): bordered box, padding 8px 16px, ± buttons 24px, count column 32px.
- Calendar: cell 32×32, heading Inter Light 20px #4f4d4d, weekday letters eyebrow style 14px
  uppercase #313030, day numbers Inter Light 16px #313030, disabled #b0b0b0, blackout = disabled
  with a diagonal strike, range = brown 600 fill / #f7f4f1 text, hover = pill outline.
- Checkbox 24px radius 4 border #d6c3b2 fill #fcf9f4 (selected fill #faf6ef + check icon 18px).
- Radio 18px. Switch 52×28.
- Page container: 1440 max, 160px side padding in the wires (≈ 1120 content). Use 1440 max with
  `px-5 md:px-10 xl:px-[160px]`.
- Layout grid: main column flex-1 · right rail 320px · gap 32px.

---

## 4. Motion
- Buttons: "Sweep to Right" hover (Figma note references Hover.css). Implement as a
  left-to-right fill sweep, 300ms ease, disabled under `prefers-reduced-motion`.
- Everything else inherits the Dolli base transitions (route fade, drawer slide).

---

## 5. Assets
- `public/brand/the-ranch.svg` (dark), `the-ranch-white.svg`, plus `-malibu` and
  `-hudson-valley` lockups in both colourways; `icon-r.svg` mark; `favicon-r.svg`.
- `public/icons/*.svg` — the Figma icon set (calendar, guests, beds, sqft, check, plus, minus,
  chevrons, long arrows, location, promo, edit, accessible, info, gallery, search, filters,
  floorplans, 360, close, hamburger, clock, expand, paginate, cvv, show-all, placeholder).
  Icons are 18px leaf in an 18px box unless stated. Render them via `<img>` or inline the path;
  do not redraw.
