import { useNavigate, useParams } from 'react-router-dom';
import { useState } from 'react';
import { BackLink } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import FeeModal from '../components/FeeModal.jsx';
import HeroGallery from '../components/HeroGallery.jsx';
import { Faqs, OtherRooms } from '../components/RoomSections.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import { money, naturalJoin } from '../utils.js';
import { D, activeRoomIndex, nextUnassigned, nights, roomStayTotal, useBooking } from '../store.jsx';
import { nextPathAfter, useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Room detail — Dolli base's shape: a full-width hero gallery above
   everything, then copy on the left (stats strip, description, what
   every stay includes, amenities, where you'll be, FAQs, other rooms,
   policies) with the stay's sticky rate panel on the right. One
   programme rate per room, so the panel is a single price and "Select
   this room" rather than Dolli's rate-plan list. */
export default function RoomDetail() {
  const { id } = useParams();
  const { state, set } = useBooking();
  const config = useConfig();
  const navigate = useNavigate();
  const [feesOpen, setFeesOpen] = useState(false);

  const room = D.roomById(id);
  const prop = room ? D.properties[room.property] : null;
  const n = Math.max(1, nights(state));
  usePageTitle(room ? room.name : 'Room Details');

  const allRooms = state.rooms || [];
  const multi = config.multiRoom && allRooms.length > 1;
  const activeIdx = activeRoomIndex(state);
  const adults = (allRooms[activeIdx] && allRooms[activeIdx].adults) || 1;
  const total = room ? roomStayTotal(state, room, adults) : 0;
  const gallery = room ? D.galleryFor(room) : [];

  function assign() {
    if (!room) return;
    const rooms = allRooms.map((r, i) => (i === activeIdx ? { ...r, roomId: room.id, upgradedFrom: null } : r));
    set({ property: room.property, rooms, editRoom: null });
    const stillEmpty = nextUnassigned({ ...state, rooms });
    navigate(stillEmpty === -1 ? nextPathAfter(config, 'rooms') : '/rooms');
  }

  useStep({ canContinue: !!room, label: 'Select this room', onContinue: assign });

  if (!room || !prop) {
    navigate('/rooms');
    return null;
  }

  const includesFirstFour = D.includes.slice(0, 4).map((i) => i.title.toLowerCase());

  return (
    <div>
      {!config.stepper && (
        <div className="flex items-center gap-2 pt-6 text-sm text-body">
          <BackLink to="/rooms">← Rooms</BackLink>
          <span className="text-line">/</span>
          <span>{room.name}</span>
        </div>
      )}

      <HeroGallery key={room.id} images={gallery} title={room.name} />

      <div className="grid items-start gap-8 pb-16 pt-7 md:gap-12 md:pt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        {/* ---------- Copy ----------
            min-w-0: without it, a grid item's default min-width:auto sizes
            the (implicit, single) mobile column to its widest descendant's
            min-content — the Other Rooms rail's horizontally-scrolling
            content — instead of letting that rail's own overflow-x-auto
            handle its own overflow. Same fix Layout.jsx already applies to
            its own flex-1 column, one level further in here. */}
        <div className="min-w-0">
          <span className="eyebrow text-accent">
            {prop.name}{multi ? ' · Room ' + (activeIdx + 1) + ' of ' + allRooms.length : ''}
          </span>
          <h1 className="h-serif mt-1 text-h3 text-ink">{room.name}</h1>
          <p className="mt-1.5 text-base text-body">{room.detail}</p>

          <div className="mt-5 flex flex-wrap gap-x-8 gap-y-2 border-y border-line py-4 text-sm text-body">
            {room.sqft && <span>Up to {room.sqft} sq.ft.</span>}
            {room.maxOccupants && <span>Sleeps up to {room.maxOccupants}</span>}
            {room.bed && <span>{room.bed}</span>}
            {room.view && <span>{room.view}</span>}
          </div>

          <p className="mt-6 text-base leading-relaxed text-body">{room.desc}</p>
          <p className="mt-4 text-base leading-relaxed text-body">
            Every stay at {prop.name} includes {naturalJoin(includesFirstFour)}.
          </p>

          <section className="mt-10">
            <h2 className="h-serif text-lg text-ink">Amenities include</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {room.amenities.map((a) => <Chip key={a}>{a}</Chip>)}
            </div>
          </section>

          <Faqs pid={prop.id} />
          <OtherRooms room={room} />

          <section className="mt-10 border-t border-line pt-8">
            <h2 className="h-serif text-lg text-ink">Policies</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Arrival {prop.stayRules.arrival} · Departure {prop.stayRules.departure}. {prop.depositCopy} {prop.cancelCopy}
            </p>
          </section>
        </div>

        {/* ---------- Sticky rate panel ---------- */}
        <aside className="lg:sticky lg:top-[calc(var(--chrome)+2rem)] lg:self-start">
          <div className="bg-light">
            <div className="border-b border-line bg-light p-5 text-center">
              <p className="eyebrow text-strong">{room.name}</p>
              <p className="mt-1 text-ink">
                <span className="text-[20px] font-medium leading-none">{money(room.rate, 0)}</span>
                <span className="text-sm text-muted"> per person / night</span>
              </p>
            </div>
            <div className="p-5 text-sm">
              <div className="flex justify-between gap-3">
                <span>{n} night{n > 1 ? 's' : ''} · {adults} guest{adults > 1 ? 's' : ''}</span>
                <span>{money(total, 0)}</span>
              </div>
              <button
                type="button"
                onClick={() => setFeesOpen(true)}
                className="mt-3 block border-t border-line pt-3 text-xs text-muted underline underline-offset-2 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
              >
                plus taxes and fees
              </button>
              <FeeModal open={feesOpen} onClose={() => setFeesOpen(false)} nightly={room.rate} nights={n} adults={adults} pid={room.property} />
              <Button variant="primary" onClick={assign} className="mt-4 w-full">
                Select this room
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
