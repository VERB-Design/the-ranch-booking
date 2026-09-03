import Modal from './ui/Modal.jsx';
import { money } from '../utils.js';
import { D } from '../store.jsx';

/* ============================================================
   FeeModal
   ------------------------------------------------------------
   The "inc. taxes & fees" breakdown behind every price block — the room
   card, the upgrade card, and RoomDetail's sidebar all open the same
   dialog rather than each rolling its own copy of the tax math. Takes a
   nightly rate, a night count and a per-room adult count rather than a
   room, so a caller pricing an upgrade's real rate difference can reuse
   it exactly like a caller pricing a room's own rate. `pid` selects the
   property's own fee breakdown from `D.fees` — Malibu and Hudson Valley
   carry different service-charge/preservation-fee/tax splits (see
   docs/content/CONTENT-SOURCE.md section 4), not one flat rate.

   The intro copy ("A 20% service fee...") is fixed brand copy per
   docs/figma/wires — the "modal – taxes & fees" wire. It is not a
   restatement of `feeInfo.breakdown`: the modelled "Service charge &
   taxes" line is 21.55% (Malibu) / 21.68% (Hudson), a combined
   service-charge-plus-tax figure tuned to round the all-in multiplier to
   1.24 / 1.26 (see docs/PRODUCTION-NOTES.md), not an isolated 20%
   service-only rate. The two numbers are shown side by side rather than
   reconciled — see the build report for the discrepancy instead of a
   silently fudged breakdown. */
export default function FeeModal({ open, onClose, nightly, nights, adults = 1, pid, title = 'About Taxes & Fees' }) {
  const n = Math.max(1, nights || 1);
  const guests = Math.max(1, adults || 1);
  const subtotal = nightly * n * guests;
  const feeInfo = (pid && D.fees[pid]) || D.fees.malibu;
  const breakdown = feeInfo.breakdown || [];
  const tax = Math.round(breakdown.reduce((s, b) => s + subtotal * b.rate, 0) * 100) / 100;
  const total = subtotal + tax;

  return (
    <Modal open={open} onClose={onClose} title={title} closeLabel="Close">
      <p className="text-sm text-body">A 20% service fee will be added to your stay.</p>
      <p className="mt-3 text-sm text-body">
        This fee supports our team and helps cover the cost of guest amenities and services,
        including Wi-Fi, wellness facilities, pool amenities and other offerings designed to
        enhance your experience.
      </p>
      <dl className="mt-5 flex flex-col gap-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-body">
            {money(nightly, 0)} × {n} night{n > 1 ? 's' : ''}{guests > 1 ? ' × ' + guests + ' guests' : ''}
          </dt>
          <dd className="text-ink">{money(subtotal, 0)}</dd>
        </div>
        {breakdown.map((b) => (
          <div key={b.label} className="flex justify-between gap-3">
            <dt className="text-body">{b.label} ({Math.round(b.rate * 1000) / 10}%)</dt>
            <dd className="text-ink">{money(subtotal * b.rate)}</dd>
          </div>
        ))}
        <div className="flex justify-between gap-3 border-t border-line pt-2">
          <dt className="font-medium text-ink">Total</dt>
          <dd className="font-medium text-ink">{money(total)}</dd>
        </div>
      </dl>
    </Modal>
  );
}
