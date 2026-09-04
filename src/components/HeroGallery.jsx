import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import useMountTransition from '../useMountTransition.js';

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

      <Lightbox
        open={openAt !== null}
        image={active}
        index={openAt || 0}
        count={count}
        title={title}
        onClose={() => setOpenAt(null)}
        onPrev={prev}
        onNext={next}
      />
    </>
  );
}

/* ============================================================
   Lightbox
   ------------------------------------------------------------
   Full-bleed viewer: the photo as large as the screen allows on a dark
   ground, with Close, the arrows and the counter floating over it — no
   box, no borders. Esc closes, arrow keys move, focus lands on Close and
   returns to the cell that opened it. Fades over the build's 300ms.
   ============================================================ */
const FOCUSABLE = 'button:not([disabled])';

function Lightbox({ open, image, index, count, title, onClose, onPrev, onNext }) {
  const { mounted, shown } = useMountTransition(open, 300);
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const panel = panelRef.current;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panel?.querySelector(FOCUSABLE)?.focus();
    function onKey(e) {
      if (e.key === 'Escape') { e.stopPropagation(); onClose(); return; }
      if (e.key === 'ArrowLeft' && count > 1) onPrev();
      if (e.key === 'ArrowRight' && count > 1) onNext();
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey, true);
    const opener = openerRef.current;
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
      opener?.focus?.();
    };
  }, [open, count, onClose, onPrev, onNext]);

  if (!mounted || !image) return null;

  const arrow = 'absolute top-1/2 -translate-y-1/2 grid h-12 w-12 place-items-center rounded-full text-white/85 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2';

  return createPortal(
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-label={title + ' — photo ' + (index + 1) + ' of ' + count}
      className={'fixed inset-0 z-[2600] flex items-center justify-center bg-dark/95 transition-opacity duration-300 motion-reduce:transition-none ' + (shown ? 'opacity-100' : 'opacity-0')}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button
        type="button"
        onClick={onClose}
        className="btn-text absolute right-6 top-6 inline-flex items-center gap-2 text-white/85 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-2 md:right-8 md:top-7"
      >
        Close
        <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.4" />
        </svg>
      </button>

      <img
        src={image.src}
        alt={image.alt || ''}
        className={'max-h-[88vh] max-w-[92vw] object-contain transition-transform duration-300 motion-reduce:transition-none md:max-h-[90vh] md:max-w-[88vw] ' + (shown ? 'scale-100' : 'scale-[0.98]')}
      />

      {count > 1 && (
        <>
          <button type="button" onClick={onPrev} aria-label="Previous photo" className={arrow + ' left-2 md:left-6'}>
            <svg className="h-4 w-4 rotate-90" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button type="button" onClick={onNext} aria-label="Next photo" className={arrow + ' right-2 md:right-6'}>
            <svg className="h-4 w-4 -rotate-90" viewBox="0 0 12 12" aria-hidden="true">
              <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="label-sm absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70" aria-live="polite">
            {index + 1} / {count}
          </span>
        </>
      )}
    </div>,
    document.body
  );
}
