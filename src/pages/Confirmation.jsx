import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { fmtShort, money } from '../utils.js';
import { D, guestsLabel, nights, pricing, useBooking, stayRange } from '../store.jsx';
import { retreatById } from '../stay.js';
import { useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Confirmation (docs/BRIEF.md, wire 07) — centred summary, reference
   chip, one RESERVATION card with every line and a total-paid band.

   This page never calls useStep(), so Layout hides the shared ButtonBar
   here as designed — but Layout still renders the Stepper (which
   self-hides, since /confirmation is not one of flowSteps()) *and* the
   right-hand StayRail (which does not self-hide for any route). On
   desktop that means the "YOUR STAY" rail still sits beside this card,
   repeating a subset of what RESERVATION already states. This page
   centres its own content as best it can from inside Layout's flex
   column; it cannot suppress the sibling rail without editing Layout.jsx
   or StayRail.jsx, which are out of scope here — see
   docs/PRODUCTION-NOTES.md. */
export default function Confirmation() {
  usePageTitle('Booking Confirmed');
  const { state, reset } = useBooking();
  const config = useConfig();
  const navigate = useNavigate();
  const p = pricing(state);

  if (!state.confirmation || !p) {
    return <Navigate to={config.entry === 'drawer' ? '/' : (config.multiProperty ? '/location' : '/rooms')} replace />;
  }

  const { prop, lines, roomCount } = p;
  const n = Math.max(1, nights(state));
  const multi = config.multiRoom && roomCount > 1;
  const g = state.guest || {};
  const contactName = [g.first, g.last].filter(Boolean).join(' ') || '—';

  function again() {
    reset();
    navigate('/');
  }

  return (
    <div>
      <div className="mx-auto flex max-w-[560px] flex-col items-center gap-8 py-14 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-full border border-dark">
          <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 12.5 L10 18.5 L20 6.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </span>

        <div>
          <h1 className="h-serif text-h2 text-ink">Booking Confirmed</h1>
          <p className="mt-2 text-lg font-light text-body">
            A confirmation has been sent to {g.email || 'your inbox'}.
          </p>
        </div>

        <span className="label-sm bg-light px-4 py-2 text-ink">
          {state.confirmation.number}
        </span>

        <div className="w-full bg-light text-left">
          <div className="border-b border-line bg-light px-6 py-3">
            {/* Was a styled span — the only other heading on this page
                ("Before you arrive") is an h3 with nothing at h2 to nest
                under, a level skip axe's heading-order rule and manual
                review both catch. Both are now h2, siblings of equal
                standing under the page's one h1. */}
            <h2 className="eyebrow text-strong">Reservation</h2>
          </div>

          <div className="flex flex-col gap-3 px-6 py-5">
            <InfoRow label="Primary Contact" value={contactName} />
            <InfoRow label="Property" value={prop.name} />
            {state.program && (
              <InfoRow
                label="Programme"
                value={
                  state.program.type === 'retreat'
                    ? (retreatById(state.property, state.program.id)?.name || 'Special Program')
                    : (prop.programName || 'Standard programme')
                }
              />
            )}
            <InfoRow label="Rooms" value={roomCount} />
            <InfoRow label="Guests" value={guestsLabel(state)} />
            <InfoRow
              label="Dates"
              value={fmtShort(stayRange(state).arrive) + ' → ' + fmtShort(stayRange(state).depart)}
              sub={state.extension === 'pre' ? 'incl. 1 pre-night · programme from ' + fmtShort(state.checkIn) : state.extension === 'post' ? 'incl. 1 extra night · programme to ' + fmtShort(state.checkOut) : null}
            />
            <InfoRow label="Nights" value={n} />
          </div>

          <div className="border-t border-line px-6 py-5">
            <span className="label-sm mb-2 block text-muted">{multi ? 'Rooms' : 'Room'}</span>
            <div className="flex flex-col gap-2">
              {lines.map((l, i) => (
                <div key={l.uid} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-ink">{multi ? 'Room ' + (i + 1) + ' · ' : ''}{l.room.name}</span>
                  <span className="text-ink">
                    {money(l.nightly)}
                    <span className="text-muted"> per person / night</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          {!!p.addonLines.length && (
            <div className="border-t border-line px-6 py-5">
              <span className="label-sm mb-2 block text-muted">Enhancements</span>
              <div className="flex flex-col gap-3">
                {p.addonLines.map((l) => (
                  <div key={l.entry.id} className="flex items-start justify-between gap-3 text-sm">
                    <span className="text-ink">
                      {l.addon.name}
                      <span className="mt-0.5 block text-xs text-muted">
                        {(l.entry.party || 1)} guest{(l.entry.party || 1) > 1 ? 's' : ''}
                        {l.entry.day ? ', ' + fmtShort(l.entry.day) : ''}
                        {l.entry.time ? ', ' + l.entry.time : ''}
                      </span>
                    </span>
                    <span className="shrink-0 text-ink">{l.addon.per === 'free' ? 'Free' : l.priceTBD ? 'Price on request' : money(l.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-line px-6 py-5 text-sm">
            <span className="label-sm text-muted">Taxes &amp; Fees</span>
            <span className="text-ink">{money(p.tax)}</span>
          </div>

          <div className="flex items-center justify-between border-t border-line bg-light px-6 py-4">
            <span className="text-base text-ink">Total Paid</span>
            <strong className="h-serif text-xl text-ink">{money(p.total)}</strong>
          </div>
        </div>

        <div className="w-full border-t border-line pt-6 text-left">
          <h2 className="h-serif text-lg text-ink">Before you arrive</h2>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Check-in opens at {prop.stayRules.arrival} and check-out is {prop.stayRules.departure}. {prop.depositCopy} {prop.cancelCopy}
          </p>
          <p className="mt-3 text-sm text-body">
            Questions about your reservation? Call{' '}
            <a href={'tel:' + D.phone.replace(/[^\d+]/g, '')} className="underline underline-offset-4 hover:text-accent">
              {D.phone}
            </a>.
          </p>
        </div>

        <Button variant="ghost" onClick={again}>Make another booking</Button>
      </div>
    </div>
  );
}

function InfoRow({ label, value, sub }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="label-sm shrink-0 text-muted">{label}</span>
      <span className="text-right text-ink">
        {value}
        {sub && <span className="mt-0.5 block text-xs text-muted">{sub}</span>}
      </span>
    </div>
  );
}
