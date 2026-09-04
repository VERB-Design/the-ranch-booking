import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BackLink, PageTitle } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import Field from '../components/ui/Field.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import ExpiryField from '../components/checkout/ExpiryField.jsx';
import { fmtShort, money } from '../utils.js';
import { guestsLabel, nights, pricing, useBooking } from '../store.jsx';
import { useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Step 7 · Checkout (docs/BRIEF.md, wire 06). Guest details per guest,
   then payment and policies. Validation runs on submit rather than
   gating Continue, per the build brief — the button always reads
   "Complete booking" and a failed attempt surfaces an announced error
   summary plus per-field messages instead of disabling itself silently.

   `upsellPlacement: 'checkout'` still has no inline UI here — see
   docs/PRODUCTION-NOTES.md, Design gaps. With the Ranch default (`page`)
   Upgrades and Add-ons are their own steps and this page never needed
   them; switching the config to `checkout` makes both upsells
   unreachable until that inline section is built. Left as a known gap,
   not attempted in this pass. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function emptyPrimary() {
  return { first: '', last: '', email: '', phone: '', address: '', city: '', state: '', country: '', zip: '' };
}
function emptyGuest() {
  return { first: '', last: '', email: '', phone: '', isGift: false };
}
function emptyPayment() {
  return { name: '', cardNumber: '', mm: '', yy: '', cvc: '' };
}

export default function Checkout() {
  usePageTitle('Guest Details');
  const { state, set } = useBooking();
  const config = useConfig();
  const navigate = useNavigate();

  const [primary, setPrimary] = useState(emptyPrimary);
  const [payment, setPayment] = useState(emptyPayment);
  const [agree, setAgree] = useState(false);
  const [booking, setBooking] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [errors, setErrors] = useState({ primary: {}, guests: [], payment: {} });
  const errorSummaryRef = useRef(null);

  const p = pricing(state);
  const n = Math.max(1, nights(state));
  const totalGuests = (state.rooms || []).reduce((s, r) => s + (r.adults || 0), 0);
  const additionalCount = Math.max(0, totalGuests - 1);

  const [additional, setAdditional] = useState(() => Array.from({ length: additionalCount }, emptyGuest));
  /* room count can change between visits (an "Edit stay" mid-checkout) —
     keep the additional-guest list the same length as the party without
     losing what was already typed. */
  const guestCards = useMemo(() => {
    if (additional.length === additionalCount) return additional;
    return Array.from({ length: additionalCount }, (_, i) => additional[i] || emptyGuest());
  }, [additional, additionalCount]);

  function updatePrimary(patch) {
    setPrimary((g) => ({ ...g, ...patch }));
  }
  function updateAdditional(i, patch) {
    setAdditional(() => guestCards.map((g, j) => (j === i ? { ...g, ...patch } : g)));
  }
  function updatePayment(patch) {
    setPayment((v) => ({ ...v, ...patch }));
  }

  /* Nothing on this page is required. The prototype exists to walk a client
     to the confirmation, so an empty form must still get there; the only
     checks left are format checks on values someone actually typed. */
  function validate() {
    const primaryErrors = {};
    if (primary.email.trim() && !EMAIL_RE.test(primary.email)) primaryErrors.email = 'Enter a valid email address.';

    const guestErrors = guestCards.map((g) => {
      const e = {};
      if (!g.isGift && g.email.trim() && !EMAIL_RE.test(g.email)) e.email = 'Enter a valid email address.';
      return e;
    });

    const paymentErrors = {};
    const digits = payment.cardNumber.replace(/\D/g, '');
    if (digits && (digits.length < 13 || digits.length > 19)) paymentErrors.cardNumber = 'Enter a valid card number.';
    if (payment.mm && !/^(0[1-9]|1[0-2])$/.test(payment.mm)) paymentErrors.expiry = 'Enter a valid expiry month.';
    if (payment.cvc && !/^\d{3,4}$/.test(payment.cvc)) paymentErrors.cvc = 'Enter a valid security code.';

    const agreeInvalid = false;
    const errorCount =
      Object.keys(primaryErrors).length +
      guestErrors.reduce((s, e) => s + Object.keys(e).length, 0) +
      Object.keys(paymentErrors).length;

    return { primaryErrors, guestErrors, paymentErrors, agreeInvalid, errorCount };
  }

  function bookNow() {
    const { primaryErrors, guestErrors, paymentErrors, agreeInvalid, errorCount } = validate();
    setErrors({ primary: primaryErrors, guests: guestErrors, payment: paymentErrors, agree: agreeInvalid });
    setSubmitAttempted(true);
    if (errorCount > 0) return;

    setBooking(true);
    const conf = 'RANCH-' + String(Math.floor(100000 + Math.random() * 900000));
    setTimeout(() => {
      set({
        guest: { ...primary },
        guests: guestCards.map((g) => ({ ...g })),
        confirmation: { number: conf, bookedAt: new Date().toISOString() },
      });
      navigate('/confirmation');
    }, 1000);
  }

  useEffect(() => {
    if (submitAttempted) errorSummaryRef.current?.focus();
  }, [submitAttempted, errors]);

  useStep({ canContinue: !booking, label: booking ? 'Confirming…' : 'Complete booking', onContinue: bookNow });

  if (!p) {
    return (
      <div>
        <p className="py-24 text-center text-body">
          No stay in progress.{' '}
          <BackLink to={config.entry === 'drawer' ? '/' : (config.multiProperty ? '/location' : '/rooms')}>Begin your stay</BackLink>
        </p>
      </div>
    );
  }

  const { prop, lines, roomCount } = p;
  const multi = config.multiRoom && roomCount > 1;
  const errorCount = submitAttempted
    ? Object.keys(errors.primary || {}).length +
      (errors.guests || []).reduce((s, e) => s + Object.keys(e).length, 0) +
      Object.keys(errors.payment || {}).length +
      (errors.agree ? 1 : 0)
    : 0;

  const showErr = (err) => (submitAttempted ? err : undefined);

  return (
    <div>
      <PageTitle title="Guest Details" sub="Please enter contact details for all guests." flush />

      <div className="flex flex-col gap-6 pb-10">
        {errorCount > 0 && (
          <div
            ref={errorSummaryRef}
            role="alert"
            tabIndex={-1}
            className="border border-error bg-white px-5 py-4 text-sm text-error outline-none"
          >
            There {errorCount === 1 ? 'is' : 'are'} {errorCount} problem{errorCount === 1 ? '' : 's'} with your
            submission. Please review the highlighted fields below.
          </div>
        )}

        {/* Guest details sit as one stack with a hairline of page beige
            between them; payment keeps its own space below. */}
        <div className="flex flex-col gap-px">
        <section className="bg-light p-6">
          <h2 className="h-serif mb-4 text-lg text-ink">Primary Contact</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="First Name"
              placeholder="First name"
              value={primary.first}
              error={showErr(errors.primary?.first)}
              onChange={(e) => updatePrimary({ first: e.target.value })}
            />
            <Field
              label="Last Name"
              placeholder="Last name"
              value={primary.last}
              error={showErr(errors.primary?.last)}
              onChange={(e) => updatePrimary({ last: e.target.value })}
            />
            <Field
              label="Email"
              type="email"
              placeholder="email@mail.com"
              value={primary.email}
              error={showErr(errors.primary?.email)}
              onChange={(e) => updatePrimary({ email: e.target.value })}
            />
            <Field
              label="Phone"
              type="tel"
              placeholder="+# ### ### ####"
              value={primary.phone}
              error={showErr(errors.primary?.phone)}
              onChange={(e) => updatePrimary({ phone: e.target.value })}
            />
            <Field
              label="Address"
              placeholder="123 easy st"
              className="sm:col-span-2"
              value={primary.address}
              error={showErr(errors.primary?.address)}
              onChange={(e) => updatePrimary({ address: e.target.value })}
            />
            <Field
              label="City"
              placeholder="City"
              value={primary.city}
              error={showErr(errors.primary?.city)}
              onChange={(e) => updatePrimary({ city: e.target.value })}
            />
            <Field
              label="State"
              placeholder="State"
              value={primary.state}
              error={showErr(errors.primary?.state)}
              onChange={(e) => updatePrimary({ state: e.target.value })}
            />
            <Field
              label="Country"
              placeholder="Country"
              value={primary.country}
              error={showErr(errors.primary?.country)}
              onChange={(e) => updatePrimary({ country: e.target.value })}
            />
            <Field
              label="Zip/Postal Code"
              placeholder="Zip / postal code"
              value={primary.zip}
              error={showErr(errors.primary?.zip)}
              onChange={(e) => updatePrimary({ zip: e.target.value })}
            />
          </div>
        </section>

        {guestCards.map((g, i) => {
          const ge = (errors.guests && errors.guests[i]) || {};
          return (
            <section key={i} className="bg-light p-6">
              <h2 className="h-serif mb-4 text-lg text-ink">Guest {i + 2}</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="First Name"
                  placeholder="First name"
                  value={g.first}
                  error={showErr(ge.first)}
                  onChange={(e) => updateAdditional(i, { first: e.target.value })}
                />
                <Field
                  label="Last Name"
                  placeholder="Last name"
                  value={g.last}
                  error={showErr(ge.last)}
                  onChange={(e) => updateAdditional(i, { last: e.target.value })}
                />
                {!g.isGift && (
                  <>
                    <Field
                      label="Email"
                      type="email"
                      placeholder="email@mail.com"
                      value={g.email}
                      error={showErr(ge.email)}
                      onChange={(e) => updateAdditional(i, { email: e.target.value })}
                    />
                    <Field
                      label="Phone"
                      type="tel"
                      placeholder="+# ### ### ####"
                      value={g.phone}
                      error={showErr(ge.phone)}
                      onChange={(e) => updateAdditional(i, { phone: e.target.value })}
                    />
                  </>
                )}
              </div>
              <Checkbox
                className="mt-4"
                checked={g.isGift}
                onChange={(v) => updateAdditional(i, { isGift: v })}
                label="This is a gift — don't contact this guest"
              />
            </section>
          );
        })}
        </div>

        <section className="bg-light p-6">
          <h2 className="h-serif mb-4 text-lg text-ink">Payment</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Name on Card"
              placeholder="Name as it appears on the card"
              className="sm:col-span-2"
              autoComplete="cc-name"
              value={payment.name}
              error={showErr(errors.payment?.name)}
              onChange={(e) => updatePayment({ name: e.target.value })}
            />
            <Field
              label="Credit Card Number"
              placeholder="0000 0000 0000 0000"
              helper={!showErr(errors.payment?.cardNumber) ? 'No dashes or spaces' : undefined}
              className="sm:col-span-2"
              inputMode="numeric"
              autoComplete="cc-number"
              value={payment.cardNumber}
              error={showErr(errors.payment?.cardNumber)}
              onChange={(e) => updatePayment({ cardNumber: e.target.value.replace(/[^\d]/g, '') })}
            />
            <ExpiryField
              mm={payment.mm}
              yy={payment.yy}
              onChangeMM={(v) => updatePayment({ mm: v })}
              onChangeYY={(v) => updatePayment({ yy: v })}
              error={showErr(errors.payment?.expiry)}
            />
            <Field
              label="CVC"
              placeholder="000"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              value={payment.cvc}
              error={showErr(errors.payment?.cvc)}
              iconRight={<img src="/icons/cvv.svg" alt="" aria-hidden="true" className="h-[18px] w-[18px]" />}
              onChange={(e) => updatePayment({ cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
            />
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-line pt-6 text-sm leading-relaxed text-body">
            <p>{prop.depositCopy}</p>
            <p>{prop.cancelCopy}</p>
          </div>

          <div className="mt-4">
            <Checkbox
              checked={agree}
              onChange={(v) => setAgree(v)}
              label="I agree to the room and rate policies, Terms & Conditions, Privacy Policy, and taxes & fees."
            />
            {showErr(errors.agree) && (
              <p className="mt-2 text-xs font-medium text-error">Please agree to the policies to continue.</p>
            )}
          </div>
        </section>
      </div>

      <div className="bg-light p-6 lg:hidden">
        <h2 className="h-serif mb-3 text-lg text-ink">{prop.name}</h2>
        <p className="text-sm text-body">
          {fmtShort(state.checkIn)} – {fmtShort(state.checkOut)}, {n} nights
        </p>
        <p className="mt-1 text-sm text-body">
          {multi ? lines.length + ' rooms' : lines[0]?.room.name} · {guestsLabel(state)}
        </p>
        <div className="mt-4 flex justify-between border-t border-line pt-4 text-lg">
          <strong className="font-normal text-ink">Total</strong>
          <strong className="font-normal text-ink">{money(p.total)}</strong>
        </div>
      </div>
    </div>
  );
}
