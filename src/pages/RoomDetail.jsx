import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { BackLink } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import Chip from '../components/ui/Chip.jsx';
import { D, activeRoomIndex, nextUnassigned, useBooking } from '../store.jsx';
import { nextPathAfter, useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Room detail — one programme rate, so this page is the room's full
   description plus a single "Select Room" action rather than a rate
   list. HeroGallery / RoomSections (reviews, location map, FAQs, other
   rooms) were Dolli-era sections built on data this model no longer has
   (rate plans, guest reviews) — dropped rather than left calling
   functions that no longer exist. Re-add against real content later. */
export default function RoomDetail() {
  const { id } = useParams();
  const { state, set } = useBooking();
  const config = useConfig();
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(0);

  const room = D.roomById(id);
  const prop = room ? D.properties[room.property] : null;
  usePageTitle(room ? room.name : 'Room Details');

  useEffect(() => { setActiveImg(0); }, [id]);

  const allRooms = state.rooms || [];
  const multi = config.multiRoom && allRooms.length > 1;
  const activeIdx = activeRoomIndex(state);

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

  return (
    <div>
      {!config.stepper && (
        <div className="flex items-center gap-2 pt-6 text-sm text-body">
          <BackLink to="/rooms">← Rooms</BackLink>
          <span className="text-line">/</span>
          <span>{room.name}</span>
        </div>
      )}

      <div className="grid items-start gap-8 pb-16 pt-7 md:gap-12 md:pt-10 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          {room.images && room.images.length ? (
            <div className="mb-6">
              <img
                src={room.images[activeImg].src}
                alt={room.images[activeImg].alt || room.name}
                className="block aspect-[16/9] w-full object-cover"
              />
              {room.images.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {room.images.map((image, i) => (
                    <button
                      key={image.src}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      aria-label={'Show image ' + (i + 1) + ' of ' + room.images.length}
                      aria-pressed={i === activeImg}
                      className={
                        'h-16 w-16 shrink-0 overflow-hidden border focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' +
                        (i === activeImg ? 'border-dark' : 'border-line')
                      }
                    >
                      <img src={image.src} alt="" loading="lazy" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <span className="ph-img mb-6 block aspect-[16/9] w-full" />
          )}
          <span className="eyebrow text-accent">
            {prop.name}{multi ? ' · Room ' + (activeIdx + 1) + ' of ' + allRooms.length : ''}
          </span>
          <h1 className="h-serif mt-1 text-h3 text-ink">{room.name}</h1>
          <p className="mt-1.5 text-base text-body">{room.detail}</p>

          <p className="mt-6 text-base leading-relaxed text-body">{room.desc}</p>

          <section className="mt-10">
            <h2 className="h-serif text-lg text-ink">Amenities include</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {room.amenities.map((a) => <Chip key={a}>{a}</Chip>)}
            </div>
          </section>

          <section className="mt-10 border-t border-line pt-6">
            <h2 className="h-serif text-lg text-ink">Policies</h2>
            <p className="mt-2 text-sm leading-relaxed text-body">
              Arrival {prop.stayRules.arrival} · Departure {prop.stayRules.departure}. {prop.depositCopy} {prop.cancelCopy}
            </p>
          </section>
        </div>

        <aside className="lg:sticky lg:top-[calc(var(--chrome)+2rem)] lg:self-start">
          {/* Details only — the rate lives on the room card and in the
              overview, so this panel just names the room and selects it. */}
          <div className="bg-light p-5">
            <p className="eyebrow text-center text-strong">{room.name}</p>
            <p className="mt-2 text-center text-sm text-body">{room.detail}</p>
            <Button variant="primary" onClick={assign} className="mt-5 w-full">
              Select this room
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
