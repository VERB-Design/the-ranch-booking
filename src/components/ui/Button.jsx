/* ============================================================
   Button
   ------------------------------------------------------------
   Four variants from docs/DESIGN-TOKENS.md section 1 (button/primary,
   button/ghost, button/on-dark) plus `text` for an inline link-weight
   action. The "sweep to right" hover is real: the button's own text
   colour is set to the colour the sweep should reveal, `.btn-sweep`
   (src/index.css) paints that as a ::before that grows in from the left,
   and the visible label sits in its own span with an explicit colour so
   it can invert independently on group-hover. Selected state skips the
   animation and paints the fill directly — it is a state, not a hover.

   `layout` and `color` are kept as separate class strings on purpose:
   Tailwind resolves conflicting utilities (e.g. two different min-h-*
   classes) by *source order in the generated stylesheet*, not by the
   order they appear in a className string, so selected/unselected must
   never differ on layout-affecting classes — only color ones swap. */

const VARIANTS = {
  primary: {
    layout: 'px-6',
    root: 'bg-btn text-btn-hover',
    label: 'text-btn-text group-hover:text-btn-text',
    selectedRoot: 'bg-btn-selected',
    selectedLabel: 'text-btn-text',
  },
  ghost: {
    layout: 'px-6',
    root: 'border border-dark text-accent bg-transparent',
    label: 'text-dark group-hover:text-brown-25',
    selectedRoot: 'border border-accent bg-accent',
    selectedLabel: 'text-brown-25',
  },
  onDark: {
    layout: 'px-6',
    root: 'bg-light text-accent',
    label: 'text-dark group-hover:text-light',
    selectedRoot: 'bg-accent',
    selectedLabel: 'text-light',
  },
  text: {
    layout: 'min-h-0 px-0',
    root: 'bg-transparent',
    label: 'text-dark underline decoration-transparent underline-offset-4 group-hover:decoration-current',
    selectedRoot: 'bg-transparent',
    selectedLabel: 'text-dark underline decoration-current underline-offset-4',
  },
};

export default function Button({
  variant = 'primary',
  selected = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  as: Tag = 'button',
  type = 'button',
  className = '',
  children,
  ...rest
}) {
  const v = VARIANTS[variant] || VARIANTS.primary;
  const sweep = variant !== 'text';

  const rootClasses = [
    'btn-text group relative inline-flex items-center justify-center gap-2',
    variant === 'text' ? '' : 'min-h-[50px] max-h-16',
    'rounded-brand transition-colors duration-300 disabled:opacity-30 disabled:pointer-events-none',
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2',
    sweep ? 'btn-sweep' : '',
    v.layout,
    selected ? v.selectedRoot : v.root,
    className,
  ].join(' ');

  const labelClasses = [
    'relative z-10 inline-flex items-center gap-2',
    selected ? v.selectedLabel : v.label,
  ].join(' ');

  return (
    <Tag
      type={Tag === 'button' ? type : undefined}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-disabled={Tag !== 'button' ? disabled : undefined}
      aria-pressed={variant !== 'text' ? selected : undefined}
      className={rootClasses}
      {...rest}
    >
      <span className={labelClasses}>
        {icon && iconPosition === 'left' && <IconSlot>{icon}</IconSlot>}
        {children}
        {icon && iconPosition === 'right' && <IconSlot>{icon}</IconSlot>}
      </span>
    </Tag>
  );
}

function IconSlot({ children }) {
  return <span className="grid h-[18px] w-[18px] shrink-0 place-items-center">{children}</span>;
}
