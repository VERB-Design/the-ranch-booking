import { Navigate, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { D, pricing, useBooking } from '../store.jsx';
import { useConfig } from '../config.jsx';
import { StayOverviewCard } from '../components/StayRail.jsx';
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

  const { prop } = p;
  const g = state.guest || {};
  /* Whatever the guest typed, with sample details standing in for any
     field left blank — checkout requires nothing, so the card still reads
     as a real reservation in a demo. */
  const contact = {
    name: [g.first, g.last].filter(Boolean).join(' ') || 'Jordan Ellis',
    email: g.email || 'jordan.ellis@example.com',
    phone: g.phone || '+1 212 555 0148',
    address: [g.address, g.city, g.state, g.zip].filter(Boolean).join(', ') || '14 Perry Street, New York, NY 10014',
  };

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
            A confirmation has been sent to {contact.email}.
          </p>
        </div>

        <span className="label-sm bg-light px-4 py-2 text-ink">
          {state.confirmation.number}
        </span>

        <StayOverviewCard title="Reservation" totalLabel="Total paid" readOnly contact={contact} className="w-full text-left" />

        <div className="w-full border-t border-line pt-6 text-left">
          <h2 className="h-serif text-lg text-ink">Before You Arrive</h2>
          <p className="mt-2 text-sm leading-relaxed text-body">
            Check in opens at {prop.stayRules.arrival} and check out is {prop.stayRules.departure}. {prop.depositCopy} {prop.cancelCopy}
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

