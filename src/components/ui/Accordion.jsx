/* Row + chevron + panel. A single controlled item rather than a
   list-managing component — the Add-ons page owns which id is open, this
   just renders one row of the pattern so it composes into any list.

   The APG accordion pattern wraps the trigger button in a heading
   (`<h3><button aria-expanded>…</button></h3>`), not the other way round —
   a heading element is not valid inside a button's content model, and a
   heading nested inside an interactive control is inconsistent about
   whether it shows up when a screen-reader user navigates by heading.
   `headingLevel` lets a caller drop the wrapper (`null`) when `trigger`
   isn't a row name that deserves one — every current caller passes one. */
export default function Accordion({ trigger, open, onToggle, children, className = '', headingLevel: Heading = 'h3' }) {
  const button = (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={open}
      className="flex w-full items-center justify-between gap-4 py-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
    >
      {trigger}
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className={'h-3 w-3 shrink-0 text-muted transition-transform duration-300 ' + (open ? 'rotate-180' : '')}
      >
        <path d="M2 4 L6 8 L10 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="square" />
      </svg>
    </button>
  );

  return (
    <div className={className}>
      {Heading ? <Heading className="contents">{button}</Heading> : button}
      <div className={'grid transition-all duration-300 ease-out ' + (open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}>
        <div className="overflow-hidden">
          <div className="pb-5">{children}</div>
        </div>
      </div>
    </div>
  );
}
