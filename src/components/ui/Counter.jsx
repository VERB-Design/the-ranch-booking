/* ============================================================
   Counter
   ------------------------------------------------------------
   "Guests − 1 +" per docs/figma/styles/booking-widgets.png: a bordered
   box, ± buttons at 24px, a fixed-width count column so the buttons never
   drift as the number changes width.
   ============================================================ */
export default function Counter({ label, value, min = 0, max = 99, onChange, ariaLabel }) {
  const dec = () => value > min && onChange(value - 1);
  const inc = () => value < max && onChange(value + 1);
  const name = ariaLabel || label || 'Count';

  return (
    <div className="flex items-center justify-between gap-3 rounded-brand border border-line bg-fill px-4 py-2">
      {label && <span className="text-sm text-ink">{label}</span>}
      <div className="flex shrink-0 items-center gap-3">
        <button
          type="button"
          aria-label={'Decrease ' + name}
          disabled={value <= min}
          onClick={dec}
          className="grid h-6 w-6 place-items-center rounded-full border border-line text-[15px] leading-none text-ink transition-colors hover:border-accent disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          −
        </button>
        <span className="w-8 text-center text-sm text-ink" aria-live="polite">{value}</span>
        <button
          type="button"
          aria-label={'Increase ' + name}
          disabled={value >= max}
          onClick={inc}
          className="grid h-6 w-6 place-items-center rounded-full border border-line text-[15px] leading-none text-ink transition-colors hover:border-accent disabled:opacity-30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
        >
          +
        </button>
      </div>
    </div>
  );
}
