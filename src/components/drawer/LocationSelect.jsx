import { D } from '../../store.jsx';

/* "The Ranch Malibu, CA" — the abbreviated state suffix per
   docs/figma/styles/booking-widgets.png. No field in src/data.js carries
   the two-letter form (`category` is the long "Malibu, California"), so
   it is derived here rather than adding a new data field for one string. */
const STATE_ABBR = { malibu: 'CA', hudson: 'NY' };
function propertyLabel(pid) {
  return D.properties[pid].name + ', ' + STATE_ABBR[pid];
}

/* ============================================================
   LocationSelect
   ------------------------------------------------------------
   The drawer's "Location" field — docs/figma/styles/booking-widgets.png
   "Vertical Booking Widget": a custom select, not a native one, so the
   closed state can show the long property name at the drawer's own type
   scale. APG listbox pattern: Up/Down/Home/End move selection inside the
   open list, Escape closes and returns focus to the trigger. Extracted
   from ReserveDrawer so the drawer's own file stays readable — this is
   the one piece of the drawer's contents that Program.jsx has no
   equivalent for (Location is a two-card page there, not a dropdown), so
   unlike RoomChips/DatePicker it is not shared with a step page.
   ============================================================ */
export default function LocationSelect({ value, onChange, open, onOpenChange }) {
  return (
    <div className="relative">
      <span className="label-sm mb-1.5 block text-accent">Location</span>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => onOpenChange(!open)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenChange(true);
          }
        }}
        className="flex h-[50px] w-full items-center justify-between gap-3 rounded-brand border border-line bg-fill px-4 text-left text-sm text-ink hover:border-line-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        <span className={value ? 'text-ink' : 'text-muted'}>
          {value ? propertyLabel(value) : 'Select a Location'}
        </span>
        <svg className={'h-3 w-3 shrink-0 text-muted transition-transform ' + (open ? 'rotate-180' : '')} viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1" fill="none" strokeLinecap="square" />
        </svg>
      </button>
      {open && (
        <ul
          role="listbox"
          aria-label="Locations"
          className="absolute inset-x-0 top-[calc(100%+4px)] z-10 border border-line bg-white py-1 shadow-xl"
          onKeyDown={(e) => {
            const items = Array.from(e.currentTarget.querySelectorAll('[role="option"]'));
            const i = items.indexOf(document.activeElement);
            if (e.key === 'ArrowDown') { e.preventDefault(); items[Math.min(items.length - 1, i + 1)]?.focus(); }
            else if (e.key === 'ArrowUp') { e.preventDefault(); items[Math.max(0, i - 1)]?.focus(); }
            else if (e.key === 'Home') { e.preventDefault(); items[0]?.focus(); }
            else if (e.key === 'End') { e.preventDefault(); items[items.length - 1]?.focus(); }
            else if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); onOpenChange(false); }
          }}
        >
          {D.propertyList.map((pid) => (
            <li key={pid}>
              <button
                type="button"
                role="option"
                aria-selected={value === pid}
                onClick={() => { onChange(pid); onOpenChange(false); }}
                className="w-full px-4 py-2.5 text-left text-sm hover:bg-page focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent-focus"
              >
                {propertyLabel(pid)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
