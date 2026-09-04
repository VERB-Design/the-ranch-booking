/* eslint-disable react-refresh/only-export-components */
import { useState } from 'react';
import Modal from '../ui/Modal.jsx';
import RetreatModal from './RetreatModal.jsx';
import { CheckIcon } from '../RoomCard.jsx';
import { retreatDisplayCheckout } from './RetreatCard.jsx';
import { parse, retreatInStay } from '../../stay.js';
import { D } from '../../store.jsx';
import { MONTH_NAMES } from '../../utils.js';

function fmtRange(a, b) {
  return a.getDate() + ' ' + MONTH_NAMES[a.getMonth()] + ' – ' + b.getDate() + ' ' + MONTH_NAMES[b.getMonth()];
}

/** Whether a stay at `pid` between `checkIn`/`checkOut` carries a special
    programme the guest has to choose between — the one thing both
    ReserveDrawer (deciding whether to show the second tray) and
    Program.jsx (gating Continue, and defaulting `program` to `standard`
    when there is nothing to choose) need to agree on. `retreatsOn` mirrors
    DatePicker's own prop of the same name — the app-wide "Special
    retreats" config switch. */
export function hasProgramChoice(pid, checkIn, checkOut, retreatsOn = true) {
  return !!(retreatsOn && pid && checkIn && checkOut && retreatInStay(pid, checkIn, checkOut));
}

/* One selectable programme card — a native radio input driving the visual
   selection, so the browser's own left/right/up/down radio-group
   navigation "just works" between the two cards with no custom key
   handling to get wrong. The input (and the visible chip/name it labels)
   sit inside the <label>; "Learn more" is a sibling <button> *outside* the
   label on purpose — <button> is itself a labelable element, and nesting
   one inside a <label> that labels a different control is invalid content
   model (and, worse, some browsers forward the label's click to the radio
   even when the click landed on the nested button). Keeping "Learn more"
   as a sibling avoids the whole problem: clicking the label area selects
   the card, clicking "Learn more" only opens its modal. */
function ProgramOption({ checked, onSelect, tone, dateLabel, title, onLearnMore, groupName }) {
  const accent = tone === 'accent';
  /* One row per programme: chip and name on the left, the check and
     Learn more on the right — the cards stack rather than sit side by side. */
  return (
    <div
      className={
        /* No outline, no fill at rest — the chosen programme takes the
           light ground and the check; the accent chip alone says "special". */
        'flex items-center gap-4 rounded-brand p-4 transition-colors ' +
        (checked ? 'bg-page' : 'bg-transparent')
      }
    >
      <label className="flex min-w-0 flex-1 cursor-pointer flex-col gap-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-focus has-[:focus-visible]:outline-offset-2">
        <input type="radio" name={groupName} checked={checked} onChange={onSelect} className="sr-only" />
        {dateLabel && (
          <span
            className={
              'label-sm inline-block w-fit px-2 py-1 text-[11px] tracking-normal normal-case ' +
              (accent ? 'bg-brown-100 text-accent' : 'bg-page text-muted')
            }
          >
            {dateLabel}
          </span>
        )}
        <span className="h-serif text-[18px] leading-tight text-ink">{title}</span>
      </label>
      <div className="flex shrink-0 flex-col items-end gap-2">
        <span
          aria-hidden="true"
          className={
            'grid h-5 w-5 place-items-center rounded-full transition-colors ' +
            (checked ? 'bg-accent text-brown-25' : 'text-transparent')
          }
        >
          <span className="h-2.5 w-2.5">
            <CheckIcon />
          </span>
        </span>
        <button
          type="button"
          onClick={onLearnMore}
          className="text-xs text-muted underline underline-offset-2 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          Learn more
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   ProgramChoice
   ------------------------------------------------------------
   docs/figma node 456:1499 — "if two concurrent programs are happening
   during a stay, prompt user to select which they book." Two cards: the
   dated retreat that falls inside the stay (accent treatment) and the
   property's own standard programme (neutral treatment). Renders nothing
   when the stay carries no retreat — every caller can render this
   unconditionally right after its own dates/stay summary and trust it to
   self-gate, the same way DatePicker's own RetreatList does.

   `value` / `onChange` carry the store's `program` shape —
   `{ type: 'retreat', id }` (id is the retreat's own `date`, already
   unique per property) or `{ type: 'standard' }`. Shared by
   ReserveDrawer's second tray and Program.jsx's pages-mode inline
   chooser (docs/BRIEF.md's "Drawer entry" — one component so the two
   entry modes can't drift into showing the choice differently).
   ============================================================ */
export default function ProgramChoice({ pid, checkIn, checkOut, retreatsOn = true, value, onChange, groupName = 'program-choice', className = '' }) {
  const [learnMoreRetreat, setLearnMoreRetreat] = useState(false);
  const [learnMoreStandard, setLearnMoreStandard] = useState(false);

  const retreat = hasProgramChoice(pid, checkIn, checkOut, retreatsOn) ? retreatInStay(pid, checkIn, checkOut) : null;
  if (!retreat) return null;

  const prop = D.properties[pid];
  const retreatCheckIn = parse(retreat.date);
  const retreatCheckOut = retreatDisplayCheckout(pid, retreatCheckIn);
  const retreatDateLabel = retreatCheckOut ? fmtRange(retreatCheckIn, retreatCheckOut) : null;
  const standardDateLabel = checkIn && checkOut ? fmtRange(checkIn, checkOut) : null;
  const standardName = prop.programName || prop.name;

  return (
    <div className={className}>
      <fieldset role="radiogroup" aria-label="Choose your program" className="grid grid-cols-1 gap-3">
        <legend className="sr-only">Choose your program</legend>
        <ProgramOption
          groupName={groupName}
          checked={value?.type === 'retreat' && value.id === retreat.date}
          onSelect={() => onChange({ type: 'retreat', id: retreat.date })}
          tone="accent"
          dateLabel={retreatDateLabel}
          title={retreat.name}
          onLearnMore={() => setLearnMoreRetreat(true)}
        />
        <ProgramOption
          groupName={groupName}
          checked={value?.type === 'standard'}
          onSelect={() => onChange({ type: 'standard' })}
          tone="neutral"
          dateLabel={standardDateLabel}
          title={standardName}
          onLearnMore={() => setLearnMoreStandard(true)}
        />
      </fieldset>

      <RetreatModal
        open={learnMoreRetreat}
        retreat={retreat}
        pid={pid}
        onClose={() => setLearnMoreRetreat(false)}
        onChooseDates={() => {
          onChange({ type: 'retreat', id: retreat.date });
          setLearnMoreRetreat(false);
        }}
      />

      <Modal open={learnMoreStandard} onClose={() => setLearnMoreStandard(false)} title={standardName}>
        <p className="text-sm text-body">{prop.programDesc}</p>
      </Modal>
    </div>
  );
}
