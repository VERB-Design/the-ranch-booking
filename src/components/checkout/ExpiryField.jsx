import { useId } from 'react';

/* ============================================================
   ExpiryField
   ------------------------------------------------------------
   MM / YY split field per docs/figma/styles/fieldset.png — two short
   inputs sharing one bordered shell with a "/" divider, rather than
   Field's single input. Mirrors Field's shell (50px, radius 2, light
   fill, focus + error treatment) so it sits flush in the same grid.
   ============================================================ */
export default function ExpiryField({ label = 'Expiry (MM/YY)', mm, yy, onChangeMM, onChangeYY, error, id }) {
  const autoId = useId();
  const fieldId = id || autoId;
  const helperId = error ? fieldId + '-helper' : undefined;

  return (
    <div>
      <label htmlFor={fieldId + '-mm'} className="label-sm mb-1.5 block text-muted">
        {label}
      </label>
      <div
        className={
          'flex h-[50px] items-center gap-2 rounded-brand border bg-fill px-4 transition-colors ' +
          'has-[input:focus-visible]:outline has-[input:focus-visible]:outline-2 ' +
          'has-[input:focus-visible]:outline-accent-focus has-[input:focus-visible]:outline-offset-2 ' +
          (error
            ? 'border-error shadow-[inset_0_-2px_0_var(--color-error)]'
            : 'border-line hover:border-line-hover focus-within:shadow-[inset_0_-2px_0_var(--color-accent-focus)]')
        }
      >
        <input
          id={fieldId + '-mm'}
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp-month"
          maxLength={2}
          placeholder="MM"
          value={mm}
          onChange={(e) => onChangeMM(e.target.value.replace(/\D/g, '').slice(0, 2))}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={helperId}
          className="w-8 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
        <span aria-hidden="true" className="text-muted">/</span>
        <input
          id={fieldId + '-yy'}
          type="text"
          inputMode="numeric"
          autoComplete="cc-exp-year"
          maxLength={2}
          placeholder="YY"
          aria-label="Expiry year"
          value={yy}
          onChange={(e) => onChangeYY(e.target.value.replace(/\D/g, '').slice(0, 2))}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={helperId}
          className="w-8 bg-transparent text-sm text-ink outline-none placeholder:text-muted"
        />
      </div>
      {error && (
        <p id={helperId} className="mt-1.5 text-[11px] leading-snug text-error">
          {error}
        </p>
      )}
    </div>
  );
}
