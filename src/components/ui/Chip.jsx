/* Bordered 12px chip — amenity tags, day/time pickers, filters.
   Selectable when given onClick; a plain badge otherwise. */
export default function Chip({ selected = false, disabled = false, onClick, className = '', children }) {
  const interactive = typeof onClick === 'function';
  const classes =
    'label-sm inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 transition-colors ' +
    (selected
      ? 'border-accent bg-accent text-brown-25'
      : 'border-line text-body ' + (interactive ? 'hover:border-accent hover:text-ink' : '')) +
    (interactive ? ' focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 disabled:opacity-30' : '') +
    ' ' + className;

  if (!interactive) {
    return <span className={classes}>{children}</span>;
  }
  return (
    <button type="button" aria-pressed={selected} disabled={disabled} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}
