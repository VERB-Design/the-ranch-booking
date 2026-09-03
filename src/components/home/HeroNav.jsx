import { useEffect, useId, useRef, useState } from 'react';
import TextCta from './TextCta.jsx';

/* No site map exists yet for this prototype — four placeholder rows so
   the menu button is not a dead end. Real buttons, not `href="#"` links,
   since none of them go anywhere yet; a live link with no destination is
   a worse a11y smell than a button that visibly does nothing. */
const MENU_ITEMS = ['The Retreat', 'Rooms', 'The Programme', 'Contact'];

/* ============================================================
   HeroNav
   ------------------------------------------------------------
   The home hero's nav row from docs/figma/wires/00-home.png: MENU button
   left, wordmark centred (absolutely, so it stays centred regardless of
   how wide MENU/Book now render), Book now text-CTA right. Renders just
   the <nav> — Landing wraps it in the page's one real <header> landmark
   rather than nesting a second header inside the hero <section>.
   ============================================================ */
export default function HeroNav({ onBookNow }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const wrapRef = useRef(null);
  const triggerRef = useRef(null);
  const firstItemRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    firstItemRef.current?.focus();

    function onKey(e) {
      if (e.key !== 'Escape') return;
      setOpen(false);
      triggerRef.current?.focus();
    }
    function onPointer(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [open]);

  return (
    <nav className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-6 md:px-10 md:pt-[51px] xl:px-[103px]">
      <div ref={wrapRef} className="relative">
        <button
          ref={triggerRef}
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((o) => !o)}
          className="btn-text inline-flex items-center gap-2.5 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          <img src="/icons/menu-lines.svg" alt="" aria-hidden="true" className="h-[6px] w-[18px]" />
          Menu
        </button>

        {open && (
          <div
            id={panelId}
            role="menu"
            aria-label="Site menu"
            className="absolute left-0 top-[calc(100%+18px)] z-30 w-[220px] border border-line bg-white py-1.5 shadow-xl"
          >
            {MENU_ITEMS.map((label, i) => (
              <button
                key={label}
                ref={i === 0 ? firstItemRef : undefined}
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); triggerRef.current?.focus(); }}
                className="label-sm block w-full px-4 py-2.5 text-left text-ink hover:bg-page focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent-focus"
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      <img
        src="/brand/the-ranch-nav-white.svg"
        alt="The Ranch"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[22px] w-[184px] -translate-x-1/2 -translate-y-1/2 md:h-[30px] md:w-[250px]"
      />

      <TextCta className="text-off-white-700" onClick={onBookNow}>
        Book now
      </TextCta>
    </nav>
  );
}
