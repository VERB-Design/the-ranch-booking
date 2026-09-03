import { useEffect, useRef } from 'react';
import { GROUPS, OPTIONS, PRESETS, describe, useConfigControls } from '../config.jsx';
import useMountTransition from '../useMountTransition.js';

const FOCUSABLE = 'a[href],button:not([disabled]),textarea,input:not([disabled]),select,[tabindex]:not([tabindex="-1"])';

export default function ConfigPanel() {
  const { config, setOption, applyPreset, revealed, hide, panelOpen, setPanelOpen } =
    useConfigControls();

  if (!revealed) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setPanelOpen(true)}
        aria-label="Open flow configuration"
        className="fixed bottom-5 left-5 z-[2000] flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-ink shadow-lg transition-colors hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
      >
        <svg className="h-[15px] w-[15px]" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M2 4.5h12M2 11.5h12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="6" cy="4.5" r="2" fill="white" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="10.5" cy="11.5" r="2" fill="white" stroke="currentColor" strokeWidth="1.4" />
        </svg>
        Configure
      </button>

      <ConfigModal
        open={panelOpen}
        onClose={() => setPanelOpen(false)}
        config={config}
        setOption={setOption}
        applyPreset={applyPreset}
        onHide={hide}
      />
    </>
  );
}

/* Consecutive options naming the same group render inside one box. */
function groupOptions(options) {
  const out = [];
  options.forEach((o) => {
    if (!o.group) { out.push({ option: o }); return; }
    const last = out[out.length - 1];
    if (last && last.group === o.group) { last.options.push(o); return; }
    out.push({ group: o.group, options: [o] });
  });
  return out;
}

/* Two values is on or off, and reads as a switch — the same control the
   flow already uses for its Accessible filter. Anything wider is a real
   choice between named things, so it keeps the cards. */
function Control({ option, config, setOption, nested }) {
  const isToggle = option.values.length === 2 &&
    option.values.some((v) => v.id === true) &&
    option.values.some((v) => v.id === false);

  if (isToggle) {
    const on = config[option.key] === true;
    return (
      <label className="flex cursor-pointer items-start justify-between gap-4">
        <span className="min-w-0">
          <span className={'block ' + (nested ? 'text-[14px]' : 'text-[15px] font-medium')}>
            {option.label}
          </span>
          {option.help && (
            <span className="mt-0.5 block text-[12.5px] leading-relaxed text-body">{option.help}</span>
          )}
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={option.label}
          onClick={() => setOption(option.key, !on)}
          className={'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' + (on ? 'bg-btn' : 'bg-line')}
        >
          <span className={'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ' + (on ? 'left-[18px]' : 'left-0.5')} />
        </button>
      </label>
    );
  }

  return (
    <div>
      <p className={nested ? 'text-[14px]' : 'text-[15px] font-medium'}>{option.label}</p>
      {option.help && (
        <p className="mt-0.5 text-[12.5px] leading-relaxed text-body">{option.help}</p>
      )}
      <div className={'mt-2.5 grid gap-2 ' + (option.values.length > 2 ? 'sm:grid-cols-3' : 'sm:grid-cols-2')}>
        {option.values.map((v) => {
          const on = config[option.key] === v.id;
          return (
            <button
              key={String(v.id)}
              type="button"
              aria-pressed={on}
              onClick={() => setOption(option.key, v.id)}
              className={
                'rounded-brand border p-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2 ' +
                (on ? 'border-ink bg-page' : 'border-line hover:border-accent')
              }
            >
              <span className={'block text-[13.5px] ' + (on ? 'font-medium' : '')}>{v.label}</span>
              {v.note && (
                <span className="mt-0.5 block text-[11.5px] leading-snug text-body">{v.note}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ConfigModal({ open, onClose, config, setOption, applyPreset, onHide }) {
  const { mounted, shown } = useMountTransition(open, 300);
  const panelRef = useRef(null);
  const openerRef = useRef(null);

  /* Same trap + Esc + focus-restore contract as ui/Modal.jsx — this dialog
     predates that primitive and was never brought up to the same standard.
     Dev-only surface, but a keyboard user reaching it should not find a
     Tab order that leaks back to the page underneath. */
  useEffect(() => {
    if (!open) return;
    openerRef.current = document.activeElement;
    const t = setTimeout(() => {
      const panel = panelRef.current;
      const focusable = panel ? panel.querySelectorAll(FOCUSABLE) : [];
      (focusable[0] || panel)?.focus();
    }, 20);

    function onKey(e) {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE));
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(t);
      document.removeEventListener('keydown', onKey);
      openerRef.current?.focus?.();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return (
    <div role="dialog" aria-modal="true" aria-label="Flow configuration" className="fixed inset-0 z-[2500]">
      <div
        className={'absolute inset-0 bg-black/50 transition-opacity duration-300 motion-reduce:transition-none ' + (shown ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={
          'absolute left-1/2 top-1/2 flex max-h-[88vh] w-[calc(100vw-32px)] max-w-[720px] -translate-x-1/2 flex-col ' +
          'rounded-brand bg-page shadow-2xl outline-none transition-all duration-300 ease-out motion-reduce:transition-none ' +
          (shown ? '-translate-y-1/2 opacity-100' : '-translate-y-[46%] opacity-0')
        }
      >
        <header className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div>
            <h2 className="text-[19px] md:text-[21px]">Configure the flow</h2>
            <p className="mt-0.5 text-[13px] leading-relaxed text-body">
              One booking flow, switched into the shape a client needs. Changes apply
              immediately — keep this open and walk the flow beside it.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close configuration"
            className="shrink-0 border border-line bg-white p-2.5 hover:border-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          >
            <svg width="12" height="12" viewBox="0 0 14 14" aria-hidden="true">
              <path d="M1 1 L13 13 M13 1 L1 13" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <section className="mb-6">
            <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-body">Presets</h3>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-body">
              Named starting points — set everything at once, then fine-tune below.
            </p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => applyPreset(preset.patch)}
                  className="rounded-brand border border-line bg-white p-3 text-left text-[13.5px] transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex flex-col gap-2.5">
              {groupOptions(OPTIONS).map((entry) =>
                entry.group ? (
                  <fieldset key={entry.group} className="rounded-brand border border-line bg-white p-4">
                    <legend className="sr-only">{GROUPS[entry.group].label}</legend>
                    <p className="text-[15px] font-medium">{GROUPS[entry.group].label}</p>
                    {GROUPS[entry.group].help && (
                      <p className="mt-0.5 text-[12.5px] leading-relaxed text-body">
                        {GROUPS[entry.group].help}
                      </p>
                    )}
                    <div className="mt-3 flex flex-col gap-3">
                      {entry.options.map((o) => (
                        <Control key={o.key} option={o} config={config} setOption={setOption} nested />
                      ))}
                    </div>
                  </fieldset>
                ) : (
                  <fieldset key={entry.option.key} className="rounded-brand border border-line bg-white p-4">
                    <legend className="sr-only">{entry.option.label}</legend>
                    <Control option={entry.option} config={config} setOption={setOption} />
                  </fieldset>
                )
              )}
            </div>
          </section>

          <section className="mt-7">
            <h3 className="text-[11.5px] font-semibold uppercase tracking-[0.12em] text-body">
              Currently building
            </h3>
            <dl className="mt-3 rounded-brand border border-line bg-white px-4 py-3 text-[13px]">
              {describe(config).map((row) => (
                <div key={row.label} className="flex justify-between gap-4 border-b border-line py-2 last:border-0">
                  <dt className="text-body">{row.label}</dt>
                  <dd className="text-right font-medium">{row.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        {/* Every switch already applies on the click. Apply is a closing
            affordance, not a commit — people want to seal a decision before
            they walk back into the flow, and leaving them only an X makes a
            considered change feel discarded. */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-6 py-4">
          <button
            type="button"
            onClick={onHide}
            className="text-[12px] text-body underline underline-offset-4 hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          >
            Hide this panel
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-brand bg-btn px-7 py-2.5 text-[11.5px] font-semibold uppercase tracking-[0.1em] text-white hover:bg-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          >
            Apply Changes
          </button>
        </footer>
      </div>
    </div>
  );
}
