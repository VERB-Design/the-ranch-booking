import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { D } from '../store.jsx';
import useMountTransition from '../useMountTransition.js';

/* ============================================================
   MenuButton
   ------------------------------------------------------------
   The "☰ MENU" control shared by the home hero and the booking header.
   `tone` picks the label colour for the ground it sits on. The menu
   itself is an overlay — a panel sliding in from the left over a scrim,
   the mirror of the booking drawer on the right — rather than a
   dropdown under the button. No site map exists yet, so the rows are
   placeholders: real buttons, not `href="#"` links, since none of them
   go anywhere.
   ============================================================ */
const MENU_ITEMS = ['The Retreat', 'Rooms', 'The Programme', 'Contact'];
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function MenuButton({ tone = 'dark', className = '' }) {
  const [open, setOpen] = useState(false);
  const { mounted, shown } = useMountTransition(open, 300);
  const panelId = useId();
  const triggerRef = useRef(null);
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    const first = panel?.querySelectorAll(FOCUSABLE)[0];
    (first || panel)?.focus();

    function onKey(e) {
      if (e.key === 'Escape') { setOpen(false); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = panel.querySelectorAll(FOCUSABLE);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); }
      else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      trigger?.focus();
    };
  }, [open]);

  const light = tone === 'light';

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className={
          'btn-text inline-flex items-center gap-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' +
          (light ? 'text-white' : 'text-ink')
        }
      >
        <img src="/icons/menu-lines.svg" alt="" aria-hidden="true" className={'h-[6px] w-[18px]' + (light ? '' : ' invert')} />
        Menu
      </button>

      {mounted && createPortal(
        <div className="fixed inset-0 z-[2000]">
          <div
            aria-hidden="true"
            onClick={() => setOpen(false)}
            className={'absolute inset-0 bg-dark/40 transition-opacity duration-300 motion-reduce:transition-none ' + (shown ? 'opacity-100' : 'opacity-0')}
          />
          <div
            id={panelId}
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            tabIndex={-1}
            className={
              'absolute inset-y-0 left-0 flex w-full max-w-[420px] flex-col bg-page px-8 py-8 outline-none shadow-2xl ' +
              'transition-transform duration-300 ease-out motion-reduce:transition-none ' +
              (shown ? 'translate-x-0' : '-translate-x-full')
            }
          >
            <div className="flex items-center justify-between">
              <img src="/brand/the-ranch.svg" alt="The Ranch" className="h-[22px] w-[184px]" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-text inline-flex items-center gap-2 text-ink hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
              >
                Close
                <img src="/icons/close.svg" alt="" aria-hidden="true" className="h-3 w-3" />
              </button>
            </div>

            <nav aria-label="Site" className="mt-14 flex flex-1 flex-col">
              <ul className="flex flex-col divide-y divide-line border-y border-line">
                {MENU_ITEMS.map((label) => (
                  <li key={label}>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="h-serif block w-full py-5 text-left text-h5 text-ink transition-colors hover:text-accent focus-visible:outline focus-visible:-outline-offset-2 focus-visible:outline-2 focus-visible:outline-accent-focus"
                    >
                      {label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <a href={'tel:' + D.phone.replace(/[^\d+]/g, '')} className="label-sm mt-8 text-body hover:text-ink">
              {D.phone}
            </a>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
