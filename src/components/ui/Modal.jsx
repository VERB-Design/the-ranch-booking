import { useEffect, useRef } from 'react';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/* Minimal accessible dialog: traps Tab inside the panel, closes on Esc,
   restores focus to whatever opened it. No animation library — this is a
   utility dialog (fee breakdowns, retreat info), not a page transition. */
export default function Modal({ open, onClose, title, children, className = '', closeLabel = null }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const panel = panelRef.current;
    const focusable = panel ? panel.querySelectorAll(FOCUSABLE) : [];
    (focusable[0] || panel)?.focus();

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab' || !panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2500]">
      <div className="absolute inset-0 bg-dark/50" onClick={onClose} />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={
          /* text-left: the panel is not portaled to document.body, so
             without this it inherits whatever text-align the opener sits
             inside — RoomCard's price block is text-right, and a dialog's
             own copy should never depend on where it was triggered from. */
          'absolute left-1/2 top-1/2 max-h-[85vh] w-[calc(100vw-32px)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 ' +
          'overflow-y-auto rounded-lg bg-light text-left shadow-2xl outline-none ' + className
        }
      >
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <h2 className="h-serif text-lg">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={closeLabel ? undefined : 'Close'}
            className={
              closeLabel
                ? 'btn-text inline-flex shrink-0 items-center gap-2 text-ink hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2'
                : 'shrink-0 rounded-brand border border-line p-2 hover:border-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2'
            }
          >
            {closeLabel}
            <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
