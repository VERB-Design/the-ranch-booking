import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { D, guestsLabel, lineNightly, nights, pricing, stayRange, useBooking } from '../store.jsx';
import { useConfig } from '../config.jsx';
import { fmtShort, money } from '../utils.js';

/* ============================================================
   StayRail
   ------------------------------------------------------------
   "YOUR STAY" summary — the one place in the flow that always agrees on
   what has been chosen so far. Every row is conditional on the piece of
   state it reports; nothing renders a placeholder dash for a decision
   the guest has not reached yet. `StayRailMobile` is the same data behind
   a collapsed bar, expanded with the same Row components so the two can
   never drift into reporting different numbers.
   ============================================================ */


function useSummary() {
  const { state, set } = useBooking();
  const config = useConfig();
  const p = pricing(state);
  const n = nights(state);
  const prop = state.property ? D.properties[state.property] : null;
  const bookedRoomLines = (state.rooms || []).filter((r) => r.roomId).map((r) => ({
    ...r,
    room: D.roomById(r.roomId),
  }));

  function removeAddon(i) {
    const next = (state.addons || []).filter((_, idx) => idx !== i);
    set({ addons: next });
  }

  return { state, config, p, n, prop, bookedRoomLines, removeAddon };
}

function SummaryRows() {
  const { state, config, p, n, prop, bookedRoomLines, removeAddon } = useSummary();
  const roomsSet = !!state.property;
  const datesSet = !!(state.checkIn && state.checkOut);
  const roomCount = (state.rooms || []).length;
  const extensionNote = state.extension === 'pre'
    ? 'incl. 1 pre-night · programme from ' + fmtShort(state.checkIn)
    : state.extension === 'post'
      ? 'incl. 1 extra night · programme to ' + fmtShort(state.checkOut)
      : null;
  const Sep = () => <span aria-hidden="true" className="mx-3 text-line-hover">|</span>;

  /* Condensed: two summary lines, then the room with its rate beneath.
     Everything reads left; the labels are the values themselves. */
  return (
    <div className="divide-y divide-line px-5">
      {(datesSet || roomsSet) && (
        <div className="py-3 text-sm text-ink">
          {prop && <p className="mb-1 text-ink">{prop.name}</p>}
          {datesSet && (
            <p>
              {fmtShort(stayRange(state).arrive)} – {fmtShort(stayRange(state).depart)}
              {roomsSet && <><Sep />{guestsLabel(state)}</>}
            </p>
          )}
          {roomsSet && (
            <p className="mt-1">
              {roomCount} {roomCount === 1 ? 'Room' : 'Rooms'}
              {datesSet && <><Sep />{n} {n === 1 ? 'Night' : 'Nights'}</>}
            </p>
          )}
          {extensionNote && <p className="mt-1 text-xs text-muted">{extensionNote}</p>}
          {bookedRoomLines.filter((r) => r.room).map((r, i) => (
            <div key={r.uid} className="mt-3">
              <p className="text-ink">
                {config.multiRoom && bookedRoomLines.length > 1 ? 'Room ' + (i + 1) + ' · ' : ''}{r.room.name}
              </p>
              <p className="text-xs text-muted">
                {money(lineNightly(r.room))} per person / night{r.upgradedFrom ? ' (upgraded)' : ''}
              </p>
            </div>
          ))}
        </div>
      )}

      {!!(p && p.addonLines.length) && (
        <div className="py-2">
          <span className="label-sm mb-1.5 block text-muted">Enhancements</span>
          <ul className="flex flex-col gap-2">
            {p.addonLines.map((l, i) => (
              <li key={l.entry.id + i} className="flex items-start justify-between gap-3 text-sm">
                <span className="text-ink">
                  {l.addon.name}
                  <span className="block text-xs text-muted">
                    {(l.entry.party || 1)} guest{(l.entry.party || 1) > 1 ? 's' : ''}
                    {l.entry.day ? ', ' + fmtShort(l.entry.day) : ''}
                    {l.entry.time ? ', ' + l.entry.time : ''}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeAddon(i)}
                    aria-label={'Remove ' + l.addon.name}
                    className="mt-1 block text-xs text-muted underline underline-offset-2 hover:text-error focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
                  >
                    Remove
                  </button>
                </span>
                <span className="shrink-0 text-right text-ink">
                  {l.addon.per === 'free' ? 'Free' : l.priceTBD ? 'Price on request' : money(l.total)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

    </div>
  );
}

const NO_RAIL = new Set(['/location', '/confirmation']);

export function StayRail() {
  const { pathname } = useLocation();
  const { p } = useSummary();
  /* No rail before a property is chosen, and none on the confirmation,
     which carries its own reservation card. */
  if (NO_RAIL.has(pathname)) return null;

  return (
    <aside className="hidden lg:sticky lg:top-[calc(var(--chrome)+2rem)] lg:block lg:w-80 lg:shrink-0 lg:self-start">
      <div className="border border-line bg-light">
        <div className="border-b border-line px-5 py-3 text-center">
          <span className="eyebrow text-strong">Your Stay</span>
        </div>
        <SummaryRows />
        {p && (
          <div className="border-t border-line px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="label-sm text-muted">Taxes &amp; fees</span>
              <span className="text-ink">{money(p.tax)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-base text-ink">Total</span>
              <strong className="text-[18px] font-normal text-ink">{money(p.total)}</strong>
            </div>
          </div>
        )}
      </div>

      <EveryStayIncludes className="mt-6" />
    </aside>
  );
}

export function StayRailMobile() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const { p } = useSummary();
  if (NO_RAIL.has(pathname)) return null;

  return (
    <div className="border-b border-line bg-light lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-4 px-5 py-3.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        <span className="eyebrow text-strong">Your stay{p ? ' · ' + money(p.total) : ''}</span>
        <svg aria-hidden="true" viewBox="0 0 12 12" className={'h-3 w-3 text-muted transition-transform ' + (open ? 'rotate-180' : '')}>
          <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="square" />
        </svg>
      </button>
      <div className={'grid transition-all duration-300 ease-out ' + (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <SummaryRows />
          {p && (
            <div className="border-t border-line px-5 py-4">
              <div className="flex items-center justify-between text-sm">
                <span className="label-sm text-muted">Taxes &amp; fees</span>
                <span className="text-ink">{money(p.tax)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-base text-ink">Total</span>
                <strong className="text-[18px] font-normal text-ink">{money(p.total)}</strong>
              </div>
            </div>
          )}
          <div className="px-5 pb-5">
            <EveryStayIncludes />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Every Stay Includes ---------- */

const ICONS = {
  spa: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 3c-2 3-4 5-4 8a4 4 0 0 0 8 0c0-3-2-5-4-8Z" stroke="currentColor" strokeWidth="1.4" /><path d="M6 15c0 4 3 6 6 6s6-2 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  ),
  dining: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M7 3v8a2 2 0 0 0 2 2v8M7 3v6M9 3v6M11 3v8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M17 3c-1.5 0-2.5 1.5-2.5 4s1 4 2.5 4v10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  ),
  hike: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 20 L10 6 L13 12 L15 9 L20 20 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /></svg>
  ),
  transfer: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 16h16M6 16l2-6h8l2 6M9 10V6h6v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /><circle cx="8" cy="19" r="1.4" stroke="currentColor" strokeWidth="1.2" /><circle cx="16" cy="19" r="1.4" stroke="currentColor" strokeWidth="1.2" /></svg>
  ),
  /* New icons for this pass — not part of the client's Figma icon export
     like the four above; see docs/PRODUCTION-NOTES.md, Licensing. */
  amenities: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="5" r="2" stroke="currentColor" strokeWidth="1.4" /><path d="M3 12c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M3 17c1.5 1.5 3 1.5 4.5 0s3-1.5 4.5 0 3 1.5 4.5 0 3-1.5 4.5 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
  ),
  laundry: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 9 7 4h10l2 5" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" /><rect x="5" y="9" width="14" height="11" rx="1" stroke="currentColor" strokeWidth="1.4" /><circle cx="12" cy="14.5" r="2.5" stroke="currentColor" strokeWidth="1.4" /></svg>
  ),
  bodpod: (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="3" width="10" height="18" rx="5" stroke="currentColor" strokeWidth="1.4" /><path d="M9 9h6M9 12h6M9 15h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
  ),
};

function EveryStayIncludes({ className = '' }) {
  /* Titles only — the list is a reminder of what the rate covers, not a
     brochure. The description of each item lives on the property page. */
  return (
    <div className={'border border-line ' + className}>
      <div className="px-5 pt-3">
        <span className="eyebrow text-strong">Every Stay Includes</span>
      </div>
      <ul className="flex flex-col gap-2 px-5 pt-2 pb-4">
        {D.includes.map((item) => (
          <li key={item.title} className="flex items-center gap-3">
            <span className="grid h-[18px] w-[18px] shrink-0 place-items-center text-accent">{ICONS[item.icon]}</span>
            <span className="text-sm text-ink">{item.title}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
