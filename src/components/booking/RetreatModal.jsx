import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';
import { retreatDisplayCheckout } from './RetreatCard.jsx';
import { parse } from '../../stay.js';
import { MONTH_NAMES } from '../../utils.js';

function fmtRange(a, b) {
  return a.getDate() + ' ' + MONTH_NAMES[a.getMonth()] + ' – ' + b.getDate() + ' ' + MONTH_NAMES[b.getMonth()];
}

/* ============================================================
   RetreatModal
   ------------------------------------------------------------
   "Learn more" on any RetreatCard opens this — name, date range,
   description, and a "Choose these dates" button (docs/figma/wires,
   annotation D). Replaces RetreatPopover, which intercepted a date pick
   before it committed; this never gates a pick — selecting a retreat
   date on the calendar is just selecting a date, per the wires. Only
   this explicit button changes the booking.
   ============================================================ */
export default function RetreatModal({ open, retreat, pid, onClose, onChooseDates }) {
  if (!retreat) return null;
  const checkInDate = parse(retreat.date);
  const checkOutDate = retreatDisplayCheckout(pid, checkInDate);

  return (
    <Modal open={open} onClose={onClose} title={retreat.name}>
      {checkOutDate && (
        <p className="label-sm mb-3 text-muted">{fmtRange(checkInDate, checkOutDate)}</p>
      )}
      <p className="text-sm text-body">{retreat.desc || retreat.note}</p>
      <div className="mt-6">
        <Button variant="primary" onClick={() => onChooseDates(retreat)}>Choose these dates</Button>
      </div>
    </Modal>
  );
}
