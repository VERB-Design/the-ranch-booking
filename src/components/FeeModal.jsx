import Modal from './ui/Modal.jsx';
import { money, pct } from '../utils.js';
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

   Client-feedback pass (8 Sep 2026): the intro copy used to quote a flat
   "20% service fee" that didn't match the modelled breakdown's own
   combined "Service charge & taxes 21.55%/21.68%" line — the exact
   confusion the client flagged. `D.fees[pid].breakdown` is now itemised
   into the real receipt lines (service charge, tax on the service
   charge, preservation fee, and — Hudson only — occupancy/room/F&B sales
   tax), so the intro sentence and the table below it now agree: both say
   "20% service charge." The table renders the identical `label · rate%`
   line StayRail's own TaxesRow does (`pct()`, `src/utils.js`) — one
   formatting rule, not two tables that could drift apart. */
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
      <p className="text-sm text-body">A 20% service charge, plus applicable taxes and fees, is added to your stay.</p>
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
            <dt className="text-body">{b.label} · {pct(b.rate)}%</dt>
            <dd className="text-ink">{money(Math.round(subtotal * b.rate))}</dd>
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
