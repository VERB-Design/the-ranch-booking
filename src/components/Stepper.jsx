import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container } from './Chrome.jsx';
import { flowSteps, stepIndexFor, useConfig } from '../config.jsx';

/* ============================================================
   Stepper
   ------------------------------------------------------------
   Progress band under the header, 7 items per docs/BRIEF.md — the
   stepper IS the flow spec, so this component reads flowSteps() rather
   than hard-coding a count. Extensions has no page of its own (it lives
   inside Program, see config.jsx flowSteps' `linkedTo`), so it mirrors
   whatever status the Program step is showing rather than tracking one
   independently that could disagree with it.
   ============================================================ */
export default function Stepper() {
  const config = useConfig();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const steps = flowSteps(config);
  const currentIndex = stepIndexFor(config, pathname);

  /* On a phone the list scrolls sideways; keep whichever step is current in
     the middle of the band so the guest always sees where they are. Runs on
     every route change; a no-op on desktop where the list fits. */
  const listRef = useRef(null);
  const currentRef = useRef(null);
  useEffect(() => {
    const list = listRef.current;
    const item = currentRef.current;
    if (!list || !item || list.scrollWidth <= list.clientWidth) return;
    const target = item.offsetLeft + item.offsetWidth / 2 - list.clientWidth / 2;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    list.scrollTo({ left: Math.max(0, target), behavior: reduce ? 'auto' : 'smooth' });
  }, [currentIndex]);

  if (!config.stepper || currentIndex === -1) return null;

  function statusOf(i) {
    const step = steps[i];
    const idx = step.linkedTo ? steps.findIndex((s) => s.key === step.linkedTo) : i;
    if (idx < currentIndex) return 'done';
    if (idx === currentIndex) return 'current';
    return 'upcoming';
  }

  return (
    <nav aria-label="Booking progress" className="sticky top-20 z-[800] h-11 border-b border-line bg-page">
      <Container className="h-full">
        <ol
          ref={listRef}
          className="flex h-full items-center gap-1 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:justify-center md:gap-2 md:px-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          /* The list scrolls sideways on a phone, so it has to be reachable
             from the keyboard for the steps past the edge to be seen. */
          tabIndex={0}
          aria-label="Steps"
        >
          {steps.map((step, i) => {
            const status = statusOf(i);
            const done = status === 'done';
            const Tag = done ? 'button' : 'span';
            return (
              <li key={step.key} ref={status === 'current' ? currentRef : undefined} className="flex shrink-0 items-center">
                <Tag
                  {...(done
                    ? { type: 'button', onClick: () => navigate(step.path) }
                    : { 'aria-current': status === 'current' ? 'step' : undefined })}
                  className={
                    'label-sm flex items-center gap-2 whitespace-nowrap rounded-brand px-2 py-1 ' +
                    (status === 'current'
                      ? 'text-ink'
                      : done
                        ? 'text-muted hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2'
                        /* Upcoming steps read as inactive, not literally disabled — this is
                           real navigational text (the step name), so it needs body-text
                           contrast (4.5:1), not the decorative-disabled treatment used for
                           calendar days. text-disabled (#b0b0b0) measured 2.06:1 on bg-light;
                           text-muted (#6d6d6d) measures 4.61–4.93:1 across every ground this
                           renders on and still reads as visually quieter than the done/current
                           steps. Confirmed via axe (see docs/ACCESSIBILITY-AUDIT.md). */
                        : 'text-muted')
                  }
                >
                  <span
                    aria-hidden="true"
                    className={
                      'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none ' +
                      (status === 'current'
                        ? 'bg-dark text-light'
                        : done
                          ? 'border border-dark text-dark'
                          : 'border border-disabled text-muted')
                    }
                  >
                    {done ? (
                      <svg className="h-2.5 w-2.5" viewBox="0 0 12 12" aria-hidden="true">
                        <path d="M2 6.5 L4.8 9.2 L10 3.4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </span>
                  {step.label}
                </Tag>
                {i < steps.length - 1 && <span aria-hidden="true" className="mx-1 h-px w-3 bg-line md:w-5" />}
              </li>
            );
          })}
        </ol>
      </Container>
    </nav>
  );
}
