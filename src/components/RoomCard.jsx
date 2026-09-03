import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from './ui/Button.jsx';
import Chip from './ui/Chip.jsx';
import FeeModal from './FeeModal.jsx';
import { money } from '../utils.js';
import { activeRoomIndex, nextUnassigned, nights, roomStayTotal, useBooking } from '../store.jsx';
import { cardLayout, nextPathAfter, useConfig } from '../config.jsx';

/* ============================================================
   Room card
   ------------------------------------------------------------
   One programme rate per room — no rate-plan matrix to disclose, so this
   is a straight "here is the room, here is what it costs, select it"
   card rather than the Dolli base's three-way vertical/inline/drawer
   split. `RoomCardFrame` is the shared anatomy (image, name, detail,
   price slot, description, amenities, actions) — Upgrade.jsx reuses it
   directly for its own offer card rather than copying the markup, so the
   two surfaces can never drift out of visual agreement.
   `cardLayout(config)` still chooses horizontal vs. vertical for the
   Rooms step itself; both read the same room shape.
   ============================================================ */
export default function RoomCard({ room, ctaLabel = 'Select Room', selected = false }) {
  const config = useConfig();
  const layout = cardLayout(config);
  const choose = useChooseRoom();
  const { state } = useBooking();
  const n = Math.max(1, nights(state));
  const idx = activeRoomIndex(state);
  const adults = (state.rooms && state.rooms[idx] && state.rooms[idx].adults) || 1;
  const total = roomStayTotal(state, room, adults);
  const vertical = layout === 'vertical';

  return (
    <RoomCardFrame
      room={room}
      layout={layout}
      selected={selected}
      priceSlot={<PriceBlock nightly={room.rate} nights={n} adults={adults} total={total} pid={room.property} />}
      actions={
        <div className={vertical ? 'flex flex-col gap-2' : 'flex flex-wrap items-center gap-4'}>
          <Button
            variant={selected ? 'primary' : 'ghost'}
            selected={selected}
            icon={selected ? <CheckIcon /> : undefined}
            onClick={() => choose(room)}
            className={vertical ? 'w-full' : 'w-full md:w-auto'}
          >
            {selected ? 'Selected' : ctaLabel}
          </Button>
        </div>
      }
    />
  );
}

/** Assigns this room to the active slot and moves the flow on — the same
    assignment RoomDetail's "Select Room" makes, so both paths land in the
    same place. */
function useChooseRoom() {
  const { state, set } = useBooking();
  const config = useConfig();
  const navigate = useNavigate();

  return function choose(room) {
    const rooms = state.rooms || [];
    const idx = activeRoomIndex(state);
    const next = rooms.map((r, i) => (i === idx ? { ...r, roomId: room.id, upgradedFrom: null } : r));
    set({ property: room.property, rooms: next, editRoom: null });
    const stillEmpty = nextUnassigned({ ...state, rooms: next });
    navigate(stillEmpty === -1 ? nextPathAfter(config, 'rooms') : '/rooms');
  };
}

/** Small check mark for the "Selected" / "Upgraded" state — the button's
    label already changes, so this is a second, non-colour signal rather
    than the only one; a colour-blind reader should never need the fill
    change to know a card is chosen. */
export function CheckIcon() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="h-full w-full">
      <path d="M3 9.5 L7 13.5 L15 4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/** Nightly number in Inter, not the heading serif — docs/BRIEF.md calls
    this out explicitly: the price is data, not a display headline, and
    Inter Medium holds better at this size than Times New Roman does. The
    Ranch prices per guest, not per room, so every price block reads
    "per person" — `suffix` covers the two wordings the flow needs (a
    plain room rate vs. the upgrade's real rate difference) off one
    shared component so the underline-to-FeeModal behaviour can't diverge
    between the two. `total`, when supplied, overrides the naive
    nightly×nights so callers can account for guests-per-room and a
    property's own extension pricing (see `roomStayTotal` in store.jsx)
    rather than every card re-deriving it. */
export function PriceBlock({ nightly, nights: n, adults = 1, total, suffix = ' per person / night', modalTitle, pid }) {
  const nightCount = Math.max(1, n || 1);
  const guests = Math.max(1, adults || 1);
  const [feesOpen, setFeesOpen] = useState(false);
  const grandTotal = typeof total === 'number' ? total : nightly * nightCount * guests;
  return (
    <div className="shrink-0 text-right max-md:mt-1 max-md:w-full max-md:text-left">
      {/* The unit never breaks mid-phrase — it sits on its own line under the
          figure so "per person / night" reads as one thing. */}
      <p className="text-ink">
        <span className="block text-[20px] font-medium leading-none">{money(nightly, 0)}</span>
        <span className="mt-1 block whitespace-nowrap text-xs text-muted">{suffix.trim()}</span>
      </p>
      <span className="block text-sm text-body">Or {money(grandTotal, 0)} total</span>
      <button
        type="button"
        onClick={() => setFeesOpen(true)}
        className="text-xs text-muted underline underline-offset-2 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        plus taxes and fees
      </button>
      <FeeModal
        open={feesOpen}
        onClose={() => setFeesOpen(false)}
        nightly={nightly}
        nights={nightCount}
        adults={guests}
        pid={pid}
        title={modalTitle}
      />
    </div>
  );
}

/* ---------- Shared card anatomy (horizontal + vertical) ---------- */

/** The card shell every offer in the flow renders through — Rooms' own
    RoomCard above, and Upgrade.jsx's single offer card. `priceSlot` and
    `actions` are supplied by the caller because the two surfaces price
    and act on the room differently (select vs. upgrade/keep), but the
    image, heading, detail line, description and amenity chips are one
    piece of markup so they read identically wherever a room is shown. */
export function RoomCardFrame({ room, layout = 'horizontal', selected = false, priceSlot, actions, className = '' }) {
  const headingId = 'room-' + room.id + '-name';
  const vertical = layout === 'vertical';
  /* Every card is the light ground with no outline, chosen or not — the
     button's "Selected" state is what marks the choice. */
  const borderClasses = 'bg-light';

  const chips = (
    <div className="mt-3 flex flex-wrap gap-2">
      {room.amenities.map((a) => <Chip key={a}>{a}</Chip>)}
    </div>
  );

  /* Horizontal: the photo runs to the card's edge and fills whatever
     height the copy column needs — never the other way round, so a tall
     photo cannot stretch the card past its content. On a phone it sits
     above the copy at 4:3. */
  const vMediaClass = 'w-full shrink-0 aspect-[4/3] md:aspect-square object-cover';
  const media = vertical ? (
    room.images && room.images.length ? (
      <img src={room.images[0].src} alt={room.images[0].alt || room.name} loading="lazy" className={vMediaClass} />
    ) : (
      <span className={'ph-img ' + vMediaClass} />
    )
  ) : (
    <div className="relative w-full shrink-0 aspect-[4/3] md:aspect-auto md:w-[300px] md:self-stretch">
      {room.images && room.images.length ? (
        <img
          src={room.images[0].src}
          alt={room.images[0].alt || room.name}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <span className="ph-img absolute inset-0 h-full w-full" />
      )}
    </div>
  );

  if (vertical) {
    return (
      <article aria-labelledby={headingId} className={'flex flex-col transition-colors ' + borderClasses + ' ' + className}>
        {media}
        <div className="flex flex-1 flex-col p-5">
          <h2 id={headingId} className="h-serif text-lg text-ink">{room.name}</h2>
          <p className="mt-1 text-sm text-body">{room.detail}</p>
          <p className="mt-3 text-sm leading-relaxed text-body line-clamp-3">{room.desc}</p>
          {chips}
          <div className="mt-4">{priceSlot}</div>
          <div className="mt-4">{actions}</div>
        </div>
      </article>
    );
  }

  return (
    <article aria-labelledby={headingId} className={'transition-colors ' + borderClasses + ' ' + className}>
      <div className="flex max-md:flex-col">
        {media}
        <div className="flex min-w-0 flex-1 flex-col p-5">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between md:gap-6">
            <div className="min-w-0">
              <h2 id={headingId} className="h-serif text-lg text-ink md:text-xl">{room.name}</h2>
              <p className="mt-1 text-sm text-body">{room.detail}</p>
            </div>
            {priceSlot}
          </div>
          <p className="mt-3 text-sm leading-relaxed text-body line-clamp-3">{room.desc}</p>
          {chips}
          <div className="mt-4">{actions}</div>
        </div>
      </div>
    </article>
  );
}
