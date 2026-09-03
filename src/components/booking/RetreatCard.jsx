/* eslint-disable react-refresh/only-export-components */
import { checkoutsFor, nightsBetween, parse } from '../../stay.js';
import { MONTH_NAMES } from '../../utils.js';

/* The check-out this card's date chip advertises — the property's own
   3-night option when the retreat's check-in day has one (Hudson's
   Thursday retreats), otherwise the shortest block the day allows. Also
   the answer "Choose these dates" in RetreatModal falls back to when no
   3-night option is unambiguous. */
export function retreatDisplayCheckout(pid, checkInDate) {
  const outs = checkoutsFor(pid, checkInDate);
  if (!outs.length) return null;
  const three = outs.find((d) => nightsBetween(checkInDate, d) === 3);
  return three || outs[0];
}

function fmtRange(a, b) {
  return a.getDate() + ' ' + MONTH_NAMES[a.getMonth()] + ' – ' + b.getDate() + ' ' + MONTH_NAMES[b.getMonth()];
}

/* ============================================================
   RetreatCard
   ------------------------------------------------------------
   docs/figma/wires/02a–c v2, "Special program card" — a bordered card
   with an accent hairline, a date-range chip, the retreat name, and a
   "Learn more" text link that opens RetreatModal. One component, used
   twice: stacked under the calendar in states A/B (DatePicker's
   RetreatList) and nested inside the state-C summary card when the
   booked stay includes a retreat — same card, same "Learn more", so the
   two places can never show the retreat differently.
   ============================================================ */
export default function RetreatCard({ retreat, pid, onLearnMore, className = '' }) {
  const checkInDate = parse(retreat.date);
  const checkOutDate = retreatDisplayCheckout(pid, checkInDate);

  return (
    <div className={'border-t-2 border-t-accent bg-light p-4 ' + className}>
      {checkOutDate && (
        <span className="label-sm mb-2 inline-block bg-brown-100 px-2 py-1 text-[11px] tracking-normal text-accent normal-case">
          {fmtRange(checkInDate, checkOutDate)}
        </span>
      )}
      <p className="text-base font-medium text-ink">{retreat.name}</p>
      <button
        type="button"
        onClick={() => onLearnMore(retreat)}
        className="mt-1 text-xs text-muted underline underline-offset-2 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        Learn more
      </button>
    </div>
  );
}
