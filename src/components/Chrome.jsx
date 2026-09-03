import { Link, useNavigate } from 'react-router-dom';
import Button from './ui/Button.jsx';
import MenuButton from './SiteMenu.jsx';
import TextCta from './home/TextCta.jsx';
import { D, guestsLabel, useBooking, useToastMessage } from '../store.jsx';
import { fmtShort } from '../utils.js';

/* ============================================================
   Chrome — header, footer, page shell primitives
   ------------------------------------------------------------
   Every export here is read by Layout.jsx and by the pages that render
   outside it (Landing builds its own header by hand, since it is not a
   flow step and carries no stepper or stay rail). Sizes are the ones
   :root reads for --chrome / --chrome-anchor in src/index.css — if this
   header's height changes, that variable has to change with it.
   ============================================================ */

/* Once a property is chosen (Program onward, through Confirmation), the
   wordmark becomes that property's own lockup — "Update header to reflect
   selected location" (docs/figma/wires/02a annotation). `state.property`
   is null on Home and Location, so the plain wordmark is what those two
   routes show without any extra branching here. */
const PROPERTY_LOCKUP = { malibu: 'the-ranch-malibu', hudson: 'the-ranch-hudson-valley' };
function wordmark(pid) {
  return {
    src: '/brand/' + (PROPERTY_LOCKUP[pid] || 'the-ranch') + '.svg',
    alt: (pid && D.properties[pid] && D.properties[pid].name) || 'The Ranch',
  };
}

export function Header({ onEditStay }) {
  const { state, reset } = useBooking();
  const navigate = useNavigate();
  const hasStay = !!(state.checkIn && state.checkOut);

  /* Same row as the home hero (HeroNav): menu left, lockup centred, and
     on the right the stay in one line — dates, guests, Edit — where the
     home page has Book now. Edit reopens the drawer, which is now the
     only place the stay is changed. */
  return (
    <header className="sticky top-0 z-[900] flex h-20 items-center border-b border-line bg-page">
      <div className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-5 md:px-10 xl:px-[103px]">
        <MenuButton tone="dark" />

        <button
          type="button"
          aria-label="Start over"
          onClick={() => { reset(); navigate('/'); }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          {/* Same mark, same size as the home nav (HeroNav) — the dark
              cut of the wordmark at 250×30, 184×22 on a phone. */}
          <img src="/brand/the-ranch.svg" alt="The Ranch" className="h-[22px] w-[184px] md:h-[30px] md:w-[250px]" />
        </button>

        {hasStay && onEditStay ? (
          <div className="flex items-baseline gap-4 text-sm text-ink">
            <span className="hidden items-baseline gap-3 md:inline-flex">
              <span>{fmtShort(state.checkIn)} – {fmtShort(state.checkOut)}</span>
              <span aria-hidden="true" className="text-line-hover">|</span>
              <span>{guestsLabel(state)}</span>
            </span>
            <button
              type="button"
              onClick={onEditStay}
              aria-label="Edit dates and guests"
              className="underline underline-offset-4 decoration-1 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
            >
              Edit
            </button>
          </div>
        ) : (
          <TextCta className="text-ink" onClick={onEditStay || (() => navigate('/'))}>
            Book now
          </TextCta>
        )}
      </div>
    </header>
  );
}

export function Footer() {
  const { state, reset } = useBooking();
  const navigate = useNavigate();
  const mark = wordmark(state.property);
  return (
    <footer className="mt-12 border-t border-line py-10">
      <Container className="flex flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-left">
        <button type="button" aria-label="Start over" onClick={() => { reset(); navigate('/'); }}>
          <img src={mark.src} alt={mark.alt} className="h-auto w-[120px]" />
        </button>
        <div className="label-sm flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-body">
          <a href={'tel:' + D.phone.replace(/[^\d+]/g, '')} className="hover:text-ink">{D.phone}</a>
          <span>Terms &amp; Conditions</span>
          <span>Privacy Policy</span>
          <span>Accessibility</span>
        </div>
      </Container>
    </footer>
  );
}

export function Toast() {
  const toast = useToastMessage();
  if (!toast) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="bk-toast fixed bottom-24 left-1/2 z-[3000] max-w-[calc(100vw-32px)] -translate-x-1/2 rounded-brand bg-dark px-5 py-3.5 text-center text-sm text-light shadow-xl md:bottom-8"
    >
      {toast}
    </div>
  );
}

export function Container({ children, className = '' }) {
  return <div className={'mx-auto w-full max-w-[1440px] px-5 md:px-10 xl:px-[160px] ' + className}>{children}</div>;
}

/** `flush` drops the top padding, for when the grid around it has already
    supplied one and the title needs to line up with what sits beside it. */
export function PageTitle({ eyebrow, title, sub, flush }) {
  return (
    /* The title's top sits level with the top of the stay overview in the
       rail, so no extra padding above it. `flush` is kept for callers. */
    <div className={'pb-5 md:pb-6' + (flush ? '' : '')}>
      {eyebrow && <span className="eyebrow mb-2 block text-accent">{eyebrow}</span>}
      <h1 className="h-serif text-[27px] leading-none text-ink">{title}</h1>
      {sub && <p className="mt-2 text-base font-light text-body">{sub}</p>}
    </div>
  );
}

export function BackLink({ to, children }) {
  return (
    <Link
      to={to}
      className="label-sm inline-block py-2 text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
    >
      {children}
    </Link>
  );
}

/** The step footer every flow page shares: Back (text) left, Continue
    (primary) right, sticky to the viewport bottom. Pages configure it via
    Layout's `useStep` outlet-context hook rather than rendering their own —
    one bar that always agrees with the flow, instead of one per page that
    can each drift from it. */
export function ButtonBar({ backTo, onContinue, continueLabel = 'Continue', disabled }) {
  const navigate = useNavigate();
  return (
    <div className="sticky bottom-0 z-[700] border-t border-line bg-white">
      <Container className="flex items-center justify-between gap-4 py-4">
        {backTo ? (
          <Button variant="text" icon={<Arrow direction="left" />} onClick={() => navigate(backTo)}>
            Back
          </Button>
        ) : <span />}
        <Button variant="primary" icon={<Arrow direction="right" />} iconPosition="right" disabled={disabled} onClick={onContinue}>
          {continueLabel}
        </Button>
      </Container>
    </div>
  );
}

/** First focusable element on every route (rendered once in App.jsx,
    outside the per-page chrome, so it works whether the current route is
    Landing's own header or Layout's shared one). Visually hidden until it
    receives keyboard focus, then pinned above everything else — the
    standard "skip to main content" pattern, targeting the `id="main-content"`
    every page's own <main> carries. */
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[3000] focus:rounded-brand focus:bg-dark focus:px-5 focus:py-3 focus:text-sm focus:text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
    >
      Skip to main content
    </a>
  );
}

export function Arrow({ direction = 'right' }) {
  const src = direction === 'left' ? '/icons/long-arrow-left.svg' : '/icons/long-arrow-right.svg';
  return <img src={src} alt="" aria-hidden="true" className="h-[14px] w-[18px]" />;
}
