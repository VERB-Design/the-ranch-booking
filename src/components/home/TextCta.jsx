/* ============================================================
   TextCta
   ------------------------------------------------------------
   The Figma "Text-CTA" component from docs/figma/styles/buttons-controls.png:
   a label over a full-width 1px hairline, gap 9px. The hairline sits at
   low opacity by default and a second line sweeps in left-to-right on
   hover/focus — the "Sweep to Right" motion note from
   docs/DESIGN-TOKENS.md section 4, built the same way Button's
   `.btn-sweep` is (a ::before-style layer growing from the left) but as
   plain Tailwind utilities since this component owns no shared CSS.
   Colour is inherited from the caller via `className` (`text-*`) — the
   hairline reads `currentColor` so it never drifts from the label.
   ============================================================ */
export default function TextCta({ as: Tag = 'button', className = '', children, ...rest }) {
  const tagProps = Tag === 'button' ? { type: 'button' } : {};
  return (
    <Tag
      {...tagProps}
      className={
        'btn-text group relative inline-flex flex-col items-start gap-[9px] ' +
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' +
        className
      }
      {...rest}
    >
      <span>{children}</span>
      <span aria-hidden="true" className="relative h-px w-full overflow-hidden bg-current/35">
        <span
          className={
            'absolute inset-0 origin-left scale-x-0 bg-current transition-transform duration-300 ease-out ' +
            'group-hover:scale-x-100 group-focus-visible:scale-x-100 ' +
            'motion-reduce:scale-x-100 motion-reduce:transition-none'
          }
        />
      </span>
    </Tag>
  );
}
