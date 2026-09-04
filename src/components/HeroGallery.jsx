import { useState } from 'react';
import Modal from './ui/Modal.jsx';

/* ============================================================
   HeroGallery
   ------------------------------------------------------------
   Full-width, above everything else on the room page: one tall image on
   the left, two stacked on the right (Dolli base's layout). `images` is
   `D.galleryFor(room)` — the room's own photos first, then its
   property's exterior/aerial shots, so a room with only one photo still
   fills all three cells. The third cell carries a "+N photos" overlay
   once there are more than three; clicking any cell opens a small
   lightbox (prev/next, closes on Esc, focus returns to the cell that
   opened it — all via `ui/Modal`) rather than a bigger gallery build.
   ============================================================ */
export default function HeroGallery({ images = [], title = 'Photos' }) {
  const [openAt, setOpenAt] = useState(null);
  const count = images.length;
  const more = Math.max(0, count - 3);

  if (!count) {
    return <span className="ph-img mt-6 block h-[260px] w-full md:h-[508px]" />;
  }

  const cellClass =
    'group relative block w-full overflow-hidden focus-visible:outline focus-visible:outline-2 ' +
    'focus-visible:outline-accent-focus focus-visible:outline-offset-2';

  function Cell({ index, className, showMore }) {
    const image = images[index];
    if (!image) return null;
    return (
      <button
        type="button"
        onClick={() => setOpenAt(index)}
        aria-label={showMore && more > 0 ? 'Show all ' + count + ' photos' : 'Open photo ' + (index + 1) + ' of ' + count}
        className={cellClass + ' ' + className}
      >
        <img
          src={image.src}
          alt={image.alt || ''}
          loading={index === 0 ? undefined : 'lazy'}
          fetchPriority={index === 0 ? 'high' : undefined}
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
        {showMore && more > 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-dark/55 text-[15px] uppercase tracking-[1.5px] text-light">
            + {more} photos
          </span>
        )}
      </button>
    );
  }

  const prev = () => setOpenAt((i) => (i - 1 + count) % count);
  const next = () => setOpenAt((i) => (i + 1) % count);
  const active = openAt !== null ? images[openAt] : null;

  return (
    <>
      <div className="mt-6 grid gap-2 md:h-[508px] md:grid-cols-2 md:grid-rows-2">
        <Cell index={0} className="h-[260px] md:row-span-2 md:h-full" />
        <Cell index={1} className="hidden md:block" />
        <Cell index={2} className="hidden md:block" showMore />
      </div>

      <Modal open={openAt !== null} onClose={() => setOpenAt(null)} title={title + ' — Photos'} closeLabel="Close">
        {active && (
          <div>
            <img src={active.src} alt={active.alt || ''} className="max-h-[65vh] w-full bg-page object-contain" />
            {count > 1 && (
              <div className="mt-4 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={prev}
                  aria-label="Previous photo"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:border-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
                >
                  <svg className="h-3.5 w-3.5 rotate-90" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span className="label-sm text-muted">{openAt + 1} / {count}</span>
                <button
                  type="button"
                  onClick={next}
                  aria-label="Next photo"
                  className="grid h-9 w-9 place-items-center rounded-full border border-line transition-colors hover:border-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
                >
                  <svg className="h-3.5 w-3.5 -rotate-90" viewBox="0 0 12 12" aria-hidden="true">
                    <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
