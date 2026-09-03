import { useEffect, useState } from 'react';

/* Keeps a component mounted while it animates out, and flips a `shown`
   flag just after mount so the enter transition actually runs.
   Returns { mounted, shown } — render nothing when !mounted.

   Uses a short timeout rather than requestAnimationFrame: rAF is throttled
   in background tabs and headless runs, which would leave panels stuck at
   their "out" style. */
export default function useMountTransition(open, duration = 500) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(open);

  useEffect(() => {
    if (open) {
      setMounted(true);
      const t = setTimeout(() => setShown(true), 20);
      return () => clearTimeout(t);
    }
    setShown(false);
    const t = setTimeout(() => setMounted(false), duration);
    return () => clearTimeout(t);
  }, [open, duration]);

  return { mounted, shown };
}
