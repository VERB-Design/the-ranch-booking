import { useId } from 'react';

/* ============================================================
   Field
   ------------------------------------------------------------
   Text input per docs/DESIGN-TOKENS.md: 50px, radius 2, light fill,
   border default/hover, and a focus state that thickens to a 2px accent
   line along the bottom rather than a full ring — the ring itself is a
   separate, always-visible `:focus-visible` outline so keyboard focus
   stays legible independent of this component's own design flourish.
   ============================================================ */
export default function Field({
  label,
  id,
  type = 'text',
  error,
  helper,
  icon,
  iconRight,
  className = '',
  inputClassName = '',
  ...rest
}) {
  const autoId = useId();
  const fieldId = id || autoId;
  const helperId = (helper || error) ? fieldId + '-helper' : undefined;

  return (
    <div className={className}>
      {label && (
        <label htmlFor={fieldId} className="label-sm mb-1.5 block text-muted">
          {label}
        </label>
      )}
      <div
        className={
          'flex h-[50px] items-center gap-1 rounded-brand border bg-fill px-4 transition-colors ' +
          'has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 ' +
          'has-[input:focus-visible]:outline-accent-focus has-[input:focus-visible]:outline-offset-2 ' +
          (error
            ? 'border-error shadow-[inset_0_-2px_0_var(--color-error)]'
            : 'border-line hover:border-line-hover focus-within:shadow-[inset_0_-2px_0_var(--color-accent-focus)]')
        }
      >
        {icon && <span className="grid h-[18px] w-[18px] shrink-0 place-items-center text-muted">{icon}</span>}
        <input
          id={fieldId}
          type={type}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={helperId}
          className={'min-w-0 flex-1 bg-transparent text-sm text-ink outline-none placeholder:text-muted ' + inputClassName}
          {...rest}
        />
        {iconRight && <span className="grid h-[18px] w-[18px] shrink-0 place-items-center text-muted">{iconRight}</span>}
      </div>
      {(helper || error) && (
        <p id={helperId} className={'mt-1.5 text-[11px] leading-snug ' + (error ? 'text-error' : 'text-muted')}>
          {error || helper}
        </p>
      )}
    </div>
  );
}
