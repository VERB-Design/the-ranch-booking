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
function ProgramOption({ checked, onSelect, tone, dateLabel, title, onLearnMore, groupName, disabled, disabledNote }) {
  const accent = tone === 'accent';
  /* One row per programme: chip and name on the left, the check and
     Learn more on the right — the cards stack rather than sit side by side.
     `disabled` greys the card out and blocks selection (radio input itself
     disabled) without hiding it — "Learn more" stays live so the guest can
     still read what the programme is, and `disabledNote` explains in place
     why it can't be picked right now (e.g. party size) rather than leaving
     them to guess. */
  return (
    <div
      className={
        /* No outline, no fill at rest — the chosen programme takes the
           light ground and the check; the accent chip alone says "special". */
        'flex items-center gap-4 rounded-brand p-4 transition-colors ' +
        (checked ? 'bg-brown-100' : 'bg-light') +
        (disabled ? ' opacity-50' : '')
      }
    >
      <div className="flex min-w-0 flex-1 flex-col gap-2">
      <label className={'flex min-w-0 flex-col gap-2 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-accent-focus has-[:focus-visible]:outline-offset-2 ' + (disabled ? 'cursor-not-allowed' : 'cursor-pointer')}>
        <input type="radio" name={groupName} checked={checked} onChange={onSelect} disabled={disabled} className="sr-only" />
        {dateLabel && (
          <span
            /* One chip treatment for both programmes — the neutral one. */
            className="label-sm inline-block w-fit bg-page px-2 py-1 text-[11px] tracking-normal normal-case text-muted"
          >
            {dateLabel}
          </span>
        )}
        {/* The special programme's name reads in the dark brown. */}
        <span className={'h-serif text-[18px] leading-tight ' + (accent ? 'text-accent' : 'text-ink')}>{title}</span>
      </label>
      {disabled && disabledNote && <p className="text-xs text-muted">{disabledNote}</p>}
      <button
        type="button"
        onClick={onLearnMore}
        className="w-fit text-xs text-muted underline underline-offset-2 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        Learn more
      </button>
      </div>
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
      </div>
    </div>
  );
}

/* ============================================================
   ProgramChoice
   ------------------------------------------------------------
   docs/figma node 456:1499 — "if two concurrent programs are happening
   during a stay, prompt user to select which they book." Up to three
   cards, in this order: the dated retreat that falls inside the stay
   (accent treatment, only when one exists), The Ranch Private (always
   offered, but greyed out and explained rather than hidden once the
   party exceeds `D.ranchPrivate.maxGuests`), and the property's own
   standard programme (neutral treatment, always offered). Renders
   nothing only when there's no property/dates to key off yet — every
   caller can render this unconditionally right after its own
   dates/stay summary and trust it to self-gate, the same way
   DatePicker's own RetreatList does.

   `value` / `onChange` carry the store's `program` shape —
   `{ type: 'retreat', id }` (id is the retreat's own `date`, already
   unique per property), `{ type: 'private' }`, or `{ type: 'standard' }`.
   Shared by ReserveDrawer's second tray and Program.jsx's pages-mode
   inline chooser (docs/BRIEF.md's "Drawer entry" — one component so the
   two entry modes can't drift into showing the choice differently).
   ============================================================ */
export default function ProgramChoice({ pid, checkIn, checkOut, retreatsOn = true, value, onChange, guestCount = null, groupName = 'program-choice', className = '', modalContainer = null }) {
  const [learnMoreRetreat, setLearnMoreRetreat] = useState(false);
  const [learnMorePrivate, setLearnMorePrivate] = useState(false);
  const [learnMoreStandard, setLearnMoreStandard] = useState(false);

  if (!pid || !checkIn || !checkOut) return null;

  const retreat = hasProgramChoice(pid, checkIn, checkOut, retreatsOn) ? retreatInStay(pid, checkIn, checkOut) : null;
  const prop = D.properties[pid];
  const retreatCheckIn = retreat ? parse(retreat.date) : null;
  const retreatCheckOut = retreat ? retreatDisplayCheckout(pid, retreatCheckIn) : null;
  const retreatDateLabel = retreatCheckOut ? fmtRange(retreatCheckIn, retreatCheckOut) : null;
  const standardDateLabel = fmtRange(checkIn, checkOut);
  const standardName = prop.programName || prop.name;

  const ranchPrivate = D.ranchPrivate;
  const privateMaxGuests = ranchPrivate.maxGuests;
  const privateOverCapacity = guestCount != null && guestCount > privateMaxGuests;
  const privateDisabledNote = `The Ranch Private is only available for parties of up to ${privateMaxGuests} guests.`;

  return (
    <div className={className}>
      <fieldset role="radiogroup" aria-label="Choose your program" className="grid grid-cols-1 gap-3">
        <legend className="sr-only">Choose your program</legend>
        {retreat && (
          <ProgramOption
            groupName={groupName}
            checked={value?.type === 'retreat' && value.id === retreat.date}
            onSelect={() => onChange({ type: 'retreat', id: retreat.date })}
            tone="accent"
            dateLabel={retreatDateLabel}
            title={retreat.name}
            onLearnMore={() => setLearnMoreRetreat(true)}
          />
        )}
        <ProgramOption
          groupName={groupName}
          checked={value?.type === 'private'}
          onSelect={() => onChange({ type: 'private' })}
          tone="accent"
          title={ranchPrivate.name}
          onLearnMore={() => setLearnMorePrivate(true)}
          disabled={privateOverCapacity}
          disabledNote={privateDisabledNote}
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

      {retreat && (
        <RetreatModal
          open={learnMoreRetreat}
          retreat={retreat}
          pid={pid}
          container={modalContainer}
          onClose={() => setLearnMoreRetreat(false)}
          onChooseDates={() => {
            onChange({ type: 'retreat', id: retreat.date });
            setLearnMoreRetreat(false);
          }}
        />
      )}

      <Modal open={learnMorePrivate} onClose={() => setLearnMorePrivate(false)} title={ranchPrivate.name} container={modalContainer}>
        <p className="text-sm text-body">{ranchPrivate.desc}</p>
      </Modal>

      <Modal open={learnMoreStandard} onClose={() => setLearnMoreStandard(false)} title={standardName} container={modalContainer}>
        <p className="text-sm text-body">{prop.programDesc}</p>
      </Modal>
    </div>
  );
}
