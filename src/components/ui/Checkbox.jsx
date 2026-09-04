import { useId } from 'react';

/* 24px checkbox, radius 4, border/default, fill/light — selected fills
   fill/selected and shows a check mark rather than relying on the native
   control, which renders inconsistently across browsers at this size. */
export default function Checkbox({ checked, onChange, label, id, className = '', ...rest }) {
  const autoId = useId();
  const boxId = id || autoId;

  return (
    <label htmlFor={boxId} className={'flex cursor-pointer items-center gap-3 text-sm text-ink ' + className}>
      <span className="relative h-6 w-6 shrink-0">
        <input
          id={boxId}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 h-6 w-6 cursor-pointer appearance-none rounded-[4px] border border-line bg-fill outline-none checked:border-accent checked:bg-fill-selected focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          {...rest}
        />
        <svg
          aria-hidden="true"
          viewBox="0 0 18 18"
          className="pointer-events-none absolute inset-0 m-auto h-[14px] w-[14px] scale-75 text-accent opacity-0 transition-all peer-checked:scale-100 peer-checked:opacity-100"
        >
          <path d="M3 9.5 L7 13.5 L15 4.5" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {label && <span>{label}</span>}
    </label>
  );
}
