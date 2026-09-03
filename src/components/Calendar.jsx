import { useEffect, useRef, useState } from 'react';
import { MONTH_NAMES } from '../utils.js';
import { sameDay } from '../stay.js';

/* Monday-first, matching docs/figma/styles/booking-widgets.png. */
const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

/* Legend content for the two calendar modes — 'checkin' (state A, no date
   picked yet) and 'checkout' (state B, check-in already set). Swatches
   share the exact fill/border classes the grid cells themselves use, so
   the legend and the grid can never drift into showing two different
   colours for the same meaning. docs/figma/wires/02a–c v2 name both sets
   of labels; v2's own designer annotation is explicit that grey reads as
   "unavailable" to a guest, so the fill is the brown tint everywhere a
   plain grey previously stood in for "available." */
const AVAILABLE_SWATCH = 'bg-brown-100 border border-accent-focus';
const RETREAT_SWATCH = 'bg-brown-100 border-2 border-accent';
const CHOSEN_SWATCH = 'bg-accent';

function legendFor(mode) {
  if (mode === 'checkout') {
    return [
      { key: 'checkin', swatch: CHOSEN_SWATCH, label: 'check-in date' },
      { key: 'available', swatch: AVAILABLE_SWATCH, label: 'check-out available' },
      { key: 'retreat', swatch: RETREAT_SWATCH, label: 'dates include special retreat — see below for details' },
    ];
  }
  return [
    { key: 'available', swatch: AVAILABLE_SWATCH, label: 'check-in available' },
    { key: 'retreat', swatch: RETREAT_SWATCH, label: 'special retreat — see details below' },
  ];
}

/* ============================================================
   RanchCalendar
   ------------------------------------------------------------
   Single-month range calendar per docs/figma/styles/booking-widgets.png
   and the 02a–c v2 wires: 32px cells, brown range fill, disabled grey,
   weekday letters as an eyebrow row, month heading with arrow controls.
   `isEnabled` decides what can be picked (the stay rules in src/stay.js
   supply it), `isRetreat` flags a date for the accent-outlined tint — in
   `mode="checkin"` that means the date itself is a retreat check-in; in
   `mode="checkout"` the caller is expected to pass a predicate that
   checks the *resulting stay*, not just the day (stay.js's
   `retreatInStay`), since a check-out date carries the marker when the
   retreat falls somewhere inside the stay it would produce, not only
   when check-out lands on it directly.

   Available days render as a brown-100 fill (never grey — the client
   was confused by it, see the wires' own annotation) with a thin
   accent-focus border; that border is what actually clears the 3:1
   non-text-contrast floor against the page (brown-100 alone measures
   ~1.2–1.4:1 — see the build report). Retreat days carry the same fill
   with a heavier 2px accent border instead of a dot, so "available" and
   "available + retreat" read as one family with a fill and border-weight
   difference, distinct from "chosen" (solid accent fill).

   Full grid keyboard support: one cell holds tabindex 0 at a time (roving
   tabindex, the standard grid pattern), arrow keys move it — including
   onto disabled cells, so the grid stays a coherent 7-wide shape to
   navigate — and only Enter/Space on an enabled cell calls onPick.
   ============================================================ */
export default function RanchCalendar({
  month,
  onMonth,
  selectedStart,
  selectedEnd,
  isEnabled = () => true,
  isRetreat = () => false,
  onPick,
  legend = true,
  mode = 'checkin',
  helper,
}) {
  const view = month; // { y, m }
  /* getDay() is Sunday-first (0–6); Monday-first needs the +6 %7 rotation. */
  const startWeekday = (new Date(view.y, view.m, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();

  const cells = [];
  for (let i = 0; i < 42; i++) {
    const dayNum = i - startWeekday + 1;
    const inMonth = dayNum >= 1 && dayNum <= daysInMonth;
    cells.push(inMonth ? new Date(view.y, view.m, dayNum) : null);
  }

  /* Roving tabindex: the active cell is the selected start if visible this
     month, else the first enabled day, else the first day of the month. */
  const firstEnabledIndex = cells.findIndex((d) => d && isEnabled(d));
  const selectedIndex = selectedStart ? cells.findIndex((d) => d && sameDay(d, selectedStart)) : -1;
  const defaultActive = selectedIndex > -1 ? selectedIndex : (firstEnabledIndex > -1 ? firstEnabledIndex : startWeekday);
  const [activeIndex, setActiveIndex] = useState(defaultActive);
  const cellRefs = useRef([]);

  useEffect(() => {
    setActiveIndex(defaultActive);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view.y, view.m]);

  function focusIndex(i) {
    if (i < 0 || i > 41 || !cells[i]) return;
    setActiveIndex(i);
    cellRefs.current[i]?.focus();
  }

  function onKeyDown(e, i) {
    const moves = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7 };
    if (moves[e.key] !== undefined) {
      e.preventDefault();
      let next = i + moves[e.key];
      /* stepping past either edge crosses a month boundary */
      if (next < 0) { onMonth(-1); return; }
      if (next > 41) { onMonth(1); return; }
      focusIndex(next);
      return;
    }
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const d = cells[i];
      if (d && isEnabled(d)) onPick(d);
    }
  }

  const arrow = (path) => (
    <svg width="10" height="14" viewBox="0 0 10 14" aria-hidden="true">
      <path d={path} stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="square" />
    </svg>
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => onMonth(-1)}
          aria-label="Previous month"
          className="p-2 text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          {arrow('M8 1 L2 7 L8 13')}
        </button>
        {/* aria-live announces the new month to a screen reader after the
            Previous/Next buttons are activated — clicking them moves no
            focus, so without this the grid's dates change with nothing
            telling a non-sighted guest the visible month just did too. */}
        <h3 className="h-serif text-xl text-body" aria-live="polite" aria-atomic="true">
          {MONTH_NAMES[view.m]} {view.y}
        </h3>
        <button
          type="button"
          onClick={() => onMonth(1)}
          aria-label="Next month"
          className="p-2 text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          {arrow('M2 1 L8 7 L2 13')}
        </button>
      </div>

      {/* The property's own stay-rules line — "Stays run in blocks of…" —
          moved inside the calendar block (Sep 2026 pass) so it reads as
          part of the calendar rather than a separate paragraph above it;
          sits between the month heading and the weekday row. */}
      {helper && <p className="text-xs text-muted">{helper}</p>}

      <div className="eyebrow grid grid-cols-7 text-center text-[12px] text-strong" aria-hidden="true">
        {WEEKDAYS.map((w) => <span key={w} className="py-1">{w}</span>)}
      </div>

      <div role="grid" aria-label={MONTH_NAMES[view.m] + ' ' + view.y} className="grid grid-cols-7 gap-y-1">
        {/* A role="grid" requires role="row" children owning the
            role="gridcell" children — the accessibility-tree structure the
            grid pattern actually promises, which six bare gridcells-in-a-row
            (with no row role at all) failed. `display: contents` on the row
            wrapper keeps every cell a direct participant in the same CSS
            grid track layout, so the fix is structural only — nothing about
            how this renders changes. */}
        {Array.from({ length: 6 }, (_, week) => {
          const weekCells = cells.slice(week * 7, week * 7 + 7);
          /* A month that fits in 5 rows (most of them) still renders a 6th
             week of trailing blanks to hold the grid's height steady — but
             a role="row" with zero role="gridcell" children fails
             aria-required-children (axe: critical). Row semantics only
             apply where there is at least one real cell to own; an
             all-blank trailing week is decorative layout, not a grid row. */
          const hasRealDay = weekCells.some(Boolean);
          return (
          <div key={week} role={hasRealDay ? 'row' : undefined} className="contents">
            {weekCells.map((d, j) => {
              const i = week * 7 + j;
              if (!d) return <span key={i} role="presentation" aria-hidden="true" />;

              const enabled = isEnabled(d);
              const retreat = isRetreat(d);
              const isStart = selectedStart && sameDay(d, selectedStart);
              const isEnd = selectedEnd && sameDay(d, selectedEnd);
              const inRange = selectedStart && selectedEnd && d > selectedStart && d < selectedEnd;
              const selected = isStart || isEnd || inRange;

              const availabilityWord = mode === 'checkout' ? 'check-out available' : 'check-in available';
              const stateLabel = !enabled
                ? 'unavailable'
                : isStart && mode === 'checkout'
                  ? 'check-in date'
                  : availabilityWord;

              /* Every cell — including disabled ones — carries a 1px
                 `line` border so the grid reads as a grid; available,
                 retreat and selected cells layer a stronger border/fill on
                 top of that same base rather than going borderless, per
                 the Sep 2026 pass. One border-colour utility per cell,
                 chosen exclusively, so there is never a cascade fight
                 between two border-color classes. */
              const fillCls = selected ? 'bg-accent text-brown-25' : enabled ? 'bg-brown-100 text-strong' : '';
              const borderCls = selected
                ? 'border border-accent'
                : enabled
                  ? (retreat ? 'border-2 border-accent' : 'border border-accent-focus')
                  : 'border border-line';

              return (
                <button
                  key={i}
                  type="button"
                  role="gridcell"
                  ref={(el) => { cellRefs.current[i] = el; }}
                  tabIndex={i === activeIndex ? 0 : -1}
                  aria-disabled={!enabled}
                  aria-selected={!!(isStart || isEnd)}
                  aria-label={
                    d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) +
                    ', ' + stateLabel +
                    (retreat ? ', special retreat' : '')
                  }
                  onFocus={() => setActiveIndex(i)}
                  onKeyDown={(e) => onKeyDown(e, i)}
                  onClick={() => enabled && onPick(d)}
                  className={[
                    'relative mx-auto grid h-8 w-8 place-items-center text-[15px] transition-colors',
                    enabled ? 'cursor-pointer hover:rounded-sm hover:outline hover:outline-1 hover:outline-line-hover' : 'cursor-default text-disabled',
                    fillCls,
                    borderCls,
                    isStart && !isEnd ? 'rounded-l-sm' : '',
                    isEnd && !isStart ? 'rounded-r-sm' : '',
                    isStart && isEnd ? 'rounded-sm' : '',
                    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2',
                  ].join(' ')}
                >
                  {d.getDate()}
                </button>
              );
            })}
          </div>
          );
        })}
      </div>

      {legend && (
        <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[11px] text-muted">
          {legendFor(mode).map((item) => (
            <span key={item.key} className="inline-flex items-center gap-1.5">
              <span aria-hidden="true" className={'h-2.5 w-2.5 rounded-full ' + item.swatch} />
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
