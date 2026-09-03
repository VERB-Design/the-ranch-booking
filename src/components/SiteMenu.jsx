import { useEffect, useId, useRef, useState } from 'react';

/* ============================================================
   MenuButton
   ------------------------------------------------------------
   The "☰ MENU" control from the home hero, shared with the booking
   header so both read as one site. `tone` picks the label colour for the
   ground it sits on; the panel is the same either way. No site map exists
   yet for this prototype — four placeholder rows so the button is not a
   dead end. Real buttons, not `href="#"` links, since none of them go
   anywhere yet.
   ============================================================ */
const MENU_ITEMS = ['The Retreat', 'Rooms', 'The Programme', 'Contact'];

export default function MenuButton({ tone = 'dark', className = '' }) {
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

  const light = tone === 'light';

  return (
    <div ref={wrapRef} className={'relative ' + className}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className={
          'btn-text inline-flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' +
          (light ? 'text-white' : 'text-ink')
        }
      >
        <img
          src="/icons/menu-lines.svg"
          alt=""
          aria-hidden="true"
          className={'h-[6px] w-[18px]' + (light ? '' : ' invert')}
        />
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
  );
}
