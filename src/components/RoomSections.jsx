import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Accordion from './ui/Accordion.jsx';
import { D } from '../store.jsx';
import { money } from '../utils.js';

/* ============================================================
   The sections below the copy column's amenities list on a room page —
   split out of RoomDetail.jsx so that file stays readable and each
   section can be reasoned about (and reused) on its own, matching the
   Dolli base's own RoomSections.jsx.
   ============================================================ */

/* ---------- Where you'll be ---------- */

export function LocationMap({ prop }) {
  const src =
    'https://maps.google.com/maps?q=' + encodeURIComponent(prop.address) + '&z=15&output=embed';

  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="h-serif text-lg text-ink">Where you&rsquo;ll be</h2>
      <div className="relative mt-4 aspect-[16/9] w-full overflow-hidden bg-light">
        <iframe
          title={'Map of ' + prop.name}
          src={src}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="absolute inset-0 h-full w-full border-0 grayscale contrast-[1.05]"
        />
      </div>
      <p className="mt-3 text-sm text-body">{prop.address}</p>
      <p className="mt-1 text-sm text-body">
        Return airport transfer to {prop.transferAirport} at 10 am. Arrival is on your own.
      </p>
    </section>
  );
}

/* ---------- Frequently asked questions ---------- */

export function Faqs({ pid }) {
  const [open, setOpen] = useState(null);
  const faqs = D.faqsFor(pid);
  if (!faqs.length) return null;

  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="h-serif text-lg text-ink">Frequently asked questions</h2>
      <div className="mt-4 divide-y divide-line bg-light">
        {faqs.map((f, i) => (
          <Accordion
            key={f.q}
            className="px-5"
            open={open === i}
            onToggle={() => setOpen(open === i ? null : i)}
            trigger={<span className="text-sm text-ink md:text-[15px]">{f.q}</span>}
          >
            <p className="text-sm leading-relaxed text-body">{f.a}</p>
          </Accordion>
        ))}
      </div>
    </section>
  );
}

/* ---------- Other rooms ---------- */

export function OtherRooms({ room }) {
  const rail = useRef(null);
  const [edges, setEdges] = useState({ start: true, end: false });
  const prop = D.properties[room.property];
  const others = D.roomsFor(room.property).filter((r) => r.id !== room.id);

  /* The arrows report the rail rather than guessing at it: which end you
     are against depends on the viewport, so it can only be measured. */
  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    const read = () => {
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ start: el.scrollLeft <= 1, end: el.scrollLeft >= max - 1 });
    };
    read();
    el.addEventListener('scroll', read, { passive: true });
    window.addEventListener('resize', read);
    return () => {
      el.removeEventListener('scroll', read);
      window.removeEventListener('resize', read);
    };
  }, [room.id]);

  if (!others.length) return null;

  const page = (dir) => {
    const el = rail.current;
    if (el) el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: 'smooth' });
  };

  return (
    <section className="mt-10 border-t border-line pt-8">
      <div className="flex items-center justify-between gap-4">
        <h2 className="h-serif text-lg text-ink">Other rooms at {prop.name}</h2>
        <div className="flex shrink-0 gap-2">
          {[['Previous rooms', -1, edges.start], ['Next rooms', 1, edges.end]].map(
            ([label, dir, atEnd]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                disabled={atEnd}
                onClick={() => page(dir)}
                className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:border-dark disabled:opacity-30 disabled:hover:border-line focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
              >
                <svg
                  className={'h-3.5 w-3.5 ' + (dir < 0 ? 'rotate-90' : '-rotate-90')}
                  viewBox="0 0 12 12"
                  aria-hidden="true"
                >
                  <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )
          )}
        </div>
      </div>

      <div
        ref={rail}
        className="-mx-5 mt-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-3 md:mx-0 md:px-0"
      >
        {others.map((r) => (
          <Link
            key={r.id}
            to={'/room/' + r.id}
            className="w-[240px] shrink-0 snap-start bg-light text-left transition-colors hover:bg-brown-25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          >
            {r.images && r.images.length ? (
              <img src={r.images[0].src} alt={r.images[0].alt || r.name} loading="lazy" className="block h-[150px] w-full object-cover" />
            ) : (
              <span className="ph-img block h-[150px] w-full" />
            )}
            <span className="block p-4">
              <span className="h-serif block text-base text-ink">{r.name}</span>
              <span className="mt-1 block text-xs text-body">{r.detail}</span>
              <span className="mt-2 block text-sm text-ink">
                {money(r.rate, 0)}
                <span className="ml-1 text-xs text-muted">per person / night</span>
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
