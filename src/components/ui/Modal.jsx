import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import useMountTransition from '../../useMountTransition.js';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])';

/* Minimal accessible dialog: traps Tab inside the panel, closes on Esc,
   restores focus to whatever opened it. Fades in and out over the build's
   one 300ms timing via useMountTransition. */
export default function Modal({ open, onClose, title, children, className = '', closeLabel = null, container = null }) {
  const panelRef = useRef(null);
  const openerRef = useRef(null);
  const { mounted, shown } = useMountTransition(open, 300);

  /* `mounted` (not just `open`) is a real dependency here, not a nicety —
     `open` can flip true a full render before the dialog panel actually
     exists in the DOM (useMountTransition's own effect hasn't flushed
     `mounted` yet), so an effect keyed on `[open, onClose]` alone can run
     with `panelRef.current` still null and silently focus nothing at all.
     Every call site so far happened to dodge this in manual testing —
     React 18 StrictMode's dev-only double-invoke of this same effect
     papered over it by re-running a second time once `mounted` had caught
     up — but it is a real race, not a StrictMode artefact, and the
     program-tray pass (Sep 2026) hit it for real the first time this
     component was driven from a persistently-mounted instance whose
     `open` prop toggled without an intervening full remount. Keying off
     `mounted` too means the effect simply waits for the render that
     actually put the panel in the DOM before it tries to focus it. */
  useEffect(() => {
    if (!open || !mounted) return;
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
  }, [open, mounted, onClose]);

  if (!mounted) return null;

  /* With a `container` the dialog is portaled into it and fills it — a
     modal that opens inside the booking drawer rather than over the page. */
  const node = (
    <div className={(container ? 'absolute' : 'fixed') + ' inset-0 z-[2500]'}>
      <div className={'absolute inset-0 bg-dark/50 transition-opacity duration-300 motion-reduce:transition-none ' + (shown ? 'opacity-100' : 'opacity-0')} onClick={onClose} />
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
          'absolute left-1/2 top-1/2 max-h-[85vh] -translate-x-1/2 -translate-y-1/2 ' +
          /* Inside a container the panel keeps the container's own side
             margins (24px, 32px from tablet up) instead of the page width. */
          (container ? 'w-[calc(100%-48px)] md:w-[calc(100%-64px)] ' : 'w-[calc(100vw-32px)] max-w-[480px] ') +
          'overflow-y-auto rounded-lg bg-light text-left shadow-2xl outline-none ' +
          'transition-[opacity,transform] duration-300 ease-out motion-reduce:transition-none ' +
          (shown ? 'opacity-100 scale-100' : 'opacity-0 scale-[0.98]') + ' ' + className
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
  return container ? createPortal(node, container) : node;
}
