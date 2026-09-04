/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { ButtonBar, Footer, Header, Toast } from './Chrome.jsx';
import { StayRail, StayRailMobile } from './StayRail.jsx';
import ReserveDrawer from './drawer/ReserveDrawer.jsx';
import ConfigPanel from './ConfigPanel.jsx';
import Stepper from './Stepper.jsx';
import { useBooking, useToast } from '../store.jsx';
import { flowSteps, nextPathAfter, prevPathBefore, stepIndexFor, useConfig } from '../config.jsx';

const DrawerContext = createContext(null);
export function useDrawers() {
  return useContext(DrawerContext);
}

/** Every flow page calls this once to tell the shared ButtonBar what
    Continue should do. `continueTo` defaults to wherever the flow goes
    next for the current step, so a page only has to name it when it is
    doing something other than moving forward — an upsell page skipping
    itself, say. Pass `onContinue` instead when Continue has to commit
    something first (RoomDetail assigning the room) — Layout calls it in
    place of navigating, and it is responsible for its own navigation.
    Not calling this at all (Confirmation) hides the bar. */
export function useStep({ continueTo, canContinue = true, label, onContinue, enabled = true } = {}) {
  const setStep = useOutletContext();
  useEffect(() => {
    if (!setStep) return;
    /* `enabled: false` keeps the page bar-less without breaking the hook
       order — Rooms shows a bar only once a room is already chosen. */
    setStep(enabled ? { continueTo, canContinue, label, onContinue } : null);
    return () => setStep(null);
  }, [setStep, continueTo, canContinue, label, onContinue, enabled]);
}

/* Shared chrome for every page except Landing. */
export default function Layout() {
  const { state, set } = useBooking();
  const config = useConfig();
  const toast = useToast();
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [reserve, setReserve] = useState(false);
  const [stepConfig, setStepConfig] = useState(null);
  /* No "reset on pathname change" effect here on purpose: React runs
     effect setup functions child-before-parent within a commit, so a
     reset living in Layout (the parent) would fire *after* the newly
     routed page's own useStep() call and silently blank the bar it just
     set — which is exactly what happened the first time this was tried.
     useStep's own cleanup (setStep(null) on unmount) is what clears a
     step page's config when the guest navigates to a non-step page. */

  /* Leaving the room pages abandons an in-progress edit, so the "Choosing
     Room 2 of 3" banner does not keep claiming a room is being re-chosen. */
  const editingRef = useRef(state.editRoom);
  editingRef.current = state.editRoom;
  useEffect(() => {
    const onRoomPages = pathname === '/rooms' || pathname.startsWith('/room/');
    if (editingRef.current && !onRoomPages) set({ editRoom: null });
  }, [pathname, set]);

  /* Tell the stylesheet how tall the pinned chrome is, so sticky rails and
     scroll anchors clear the stepper instead of sliding under it. */
  useEffect(() => {
    document.documentElement.dataset.stepper = config.stepper ? 'on' : 'off';
    return () => { delete document.documentElement.dataset.stepper; };
  }, [config.stepper]);

  const steps = flowSteps(config);
  const currentIdx = stepIndexFor(config, pathname);
  const currentKey = currentIdx > -1 ? steps[currentIdx].key : null;
  const rawBackTo = pathname.startsWith('/room/')
    ? '/rooms'
    : currentKey ? prevPathBefore(config, currentKey) : null;
  /* The first step's "previous" falls back to its own path — that is not
     a back link, it is nowhere to go, so treat it as none. */
  const backTo = rawBackTo && rawBackTo !== pathname ? rawBackTo : null;

  const setStep = useCallback((cfg) => setStepConfig(cfg), []);

  function onContinue() {
    if (!stepConfig) return;
    if (stepConfig.onContinue) { stepConfig.onContinue(); return; }
    const to = stepConfig.continueTo || (currentKey ? nextPathAfter(config, currentKey) : '/checkout');
    navigate(to);
  }

  const drawerApi = { openReserve: () => setReserve(true) };

  return (
    <DrawerContext.Provider value={drawerApi}>
      <Header onEditStay={() => setReserve(true)} />
      <Stepper />
      <main id="main-content" tabIndex={-1} className={'min-h-[60vh] outline-none' + (stepConfig ? ' pb-24' : '')}>
        {/* On a phone the overview comes first, straight under the stepper. */}
        <StayRailMobile />
        <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-8 px-5 py-8 md:px-10 lg:flex-row xl:px-[160px]">
          <div className="min-w-0 flex-1">
            <Outlet context={setStep} />
          </div>
          <StayRail />
        </div>
      </main>

      {stepConfig && (
        <ButtonBar
          backTo={backTo}
          onContinue={onContinue}
          continueLabel={stepConfig.label || 'Continue'}
          disabled={stepConfig.canContinue === false}
        />
      )}

      <Footer />

      <ReserveDrawer
        open={reserve}
        onClose={() => setReserve(false)}
        onApply={({ pendingRoom }) => {
          /* The drawer already navigates to /rooms itself on submit — this
             just adds the "choose a room" nudge when the edit left one
             unassigned (e.g. the property changed, clearing room ids). */
          if (pendingRoom > -1) toast('Choose a room to continue.');
        }}
      />
      <ConfigPanel />
      <Toast />
    </DrawerContext.Provider>
  );
}
