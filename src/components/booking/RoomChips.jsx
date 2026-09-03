import Counter from '../ui/Counter.jsx';
import { MAX_ROOMS } from '../../store.jsx';
import { MAX_GUESTS_PER_ROOM } from '../../config.jsx';

const pad2 = (v) => String(v).padStart(2, '0');

/* ============================================================
   RoomChips
   ------------------------------------------------------------
   "ADD ROOMS & GUESTS" per docs/figma/wires/02a — one bordered chip per
   room slot (a "Room N" label sitting left of its Guests Counter, one
   row), a dashed "+ Add Room" tile up to MAX_ROOMS, and an "x" to drop
   any room past the first. Wrapped in a fieldset/legend so the whole
   group reads as one control to a screen reader. When `multiRoom` is
   off, the second-and-on rooms and the add tile never render — the
   brief's "single room, no add tile" case.

   Sep 2026 creative-director pass: no outer chip — "Room 1" sits as a
   small label above its Guests counter, left-aligned, and the add tile
   lines up with the counters on one row, wrapping only when more rooms
   exist than the container is wide enough to hold. The room number stays
   sentence case ("Room 1") while the guest count reads zero-padded ("02")
   — Counter's own `format` prop handles the padding.

   Shared between the Program step page (`entry=pages`) and
   `ReserveDrawer` (`entry=drawer`, the default) — one component, one
   place the chip layout and guest-count rules live, per
   docs/BRIEF.md's "Drawer entry" subsection. Both entry modes get the
   same horizontal chip; there is no vertical variant to opt back into.
   ============================================================ */
export default function RoomChips({ rooms, multiRoom, onGuestsChange, onAdd, onRemove }) {
  const visible = multiRoom ? rooms : rooms.slice(0, 1);

  return (
    <fieldset className="flex flex-wrap items-end gap-x-5 gap-y-3">
      <legend className="sr-only">Rooms and guests</legend>
      {visible.map((r, i) => (
        <div key={r.uid} className="flex flex-col items-start gap-1.5">
          <span className="label-sm text-muted">Room {i + 1}</span>
          <div className="flex items-center gap-1.5">
            <Counter
              label="Guests"
              ariaLabel={'Guests, Room ' + pad2(i + 1)}
              value={r.adults}
              format={pad2}
              min={1}
              max={MAX_GUESTS_PER_ROOM}
              onChange={(v) => onGuestsChange(r.uid, v)}
            />
            {multiRoom && i > 0 && (
              <button
                type="button"
                onClick={() => onRemove(r.uid)}
                aria-label={'Remove Room ' + pad2(i + 1)}
                className="grid h-6 w-6 shrink-0 place-items-center text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
              >
                <img src="/icons/close.svg" alt="" aria-hidden="true" className="h-3 w-3" />
              </button>
            )}
          </div>
        </div>
      ))}

      {multiRoom && rooms.length < MAX_ROOMS && (
        <button
          type="button"
          onClick={onAdd}
          className="flex h-[50px] shrink-0 items-center justify-center gap-1.5 border border-dashed border-line px-4 text-sm text-muted transition-colors hover:border-dark hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          <img src="/icons/plus.svg" alt="" aria-hidden="true" className="h-[14px] w-[14px]" />
          Add Room
        </button>
      )}
    </fieldset>
  );
}
