/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

/* ============================================================
   Flow configuration
   ------------------------------------------------------------
   One master booking flow, switched into the shape a given build needs.
   Every option here changes the flow itself — routes, copy, and
   components — not just what is visible. Nothing is hidden with CSS, so
   the rendered page doubles as the spec for that build.

   Config is read from the URL on load, then carried in sessionStorage.
   The address bar is kept in sync so any configuration can be copied
   straight out of it and shared.

   This is the Ranch's cut of the Dolli white-label machinery: rate-plan
   and children options are gone because the Ranch model has no rate
   matrix and is adults-only; experience routes (activities/dining/spa)
   are gone because the programme is all-inclusive and the Add-ons step
   covers optional extras instead. See docs/PRODUCTION-NOTES.md for what
   was dropped and why.
   ============================================================ */

const KEY = 'ranch-config';

/** Fixed by the programme, not a switch — a room holds at most two adults. */
export const MAX_GUESTS_PER_ROOM = 2;

export const GROUPS = {
  stay: {
    label: 'Stay rules',
    help: 'Booking behaviour specific to the fixed-length programme model.',
  },
  upsells: {
    label: 'Upsells',
    help: 'What the flow offers on top of the room, and where it asks.',
  },
};

export const OPTIONS = [
  {
    key: 'entry',
    param: 'entry',
    label: 'Entry',
    help: 'Where the flow starts — the drawer collects location, guests and dates itself, or those stay their own step pages.',
    values: [
      { id: 'drawer', v: 'drawer', label: 'Booking drawer', note: 'Location, guests and dates are chosen in the drawer; the flow starts at Rooms.' },
      { id: 'pages', v: 'pages', label: 'Step pages', note: 'Location and Program are their own steps.' },
    ],
  },
  {
    key: 'card',
    param: 'card',
    label: 'Room card',
    help: 'Orientation of the room list on the Rooms step.',
    values: [
      { id: 'horizontal', v: 'h', label: 'Horizontal', note: 'Wide row card — the Ranch default.' },
      { id: 'vertical', v: 'v', label: 'Vertical', note: 'Tiles, for a denser grid.' },
    ],
  },
  {
    key: 'extensions',
    param: 'ext',
    group: 'stay',
    label: 'Extensions',
    help: 'Offer an extra Friday night on stays that end on a Thursday.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
  {
    key: 'retreats',
    param: 'ret',
    group: 'stay',
    label: 'Special retreats',
    help: 'Flag themed check-in dates on the calendar with an info popover.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
  {
    key: 'showUpgrades',
    param: 'up',
    group: 'upsells',
    label: 'Show room upgrades',
    help: 'Offer a better room than the one chosen.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
  {
    key: 'showAmenities',
    param: 'am',
    group: 'upsells',
    label: 'Show add-ons',
    help: 'Sell treatments and experiences alongside the stay.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
  {
    key: 'upsellPlacement',
    param: 'place',
    group: 'upsells',
    label: 'Where they appear',
    values: [
      { id: 'page', v: 'page', label: 'Own page', note: 'A step between Rooms and Checkout — the Ranch default.' },
      { id: 'checkout', v: 'checkout', label: 'On checkout page', note: 'Folded into Checkout instead of their own steps.' },
    ],
  },
  {
    key: 'stepper',
    param: 'step',
    label: 'Page stepper',
    help: 'A numbered progress bar under the header; also a way back to earlier steps.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
  {
    key: 'multiProperty',
    param: 'mp',
    label: 'Multi-property',
    help: 'More than one property to choose between; off removes the Location step.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
  {
    key: 'multiRoom',
    param: 'mr',
    label: 'Multi-room',
    help: 'Several rooms on one reservation, with "Room 1 of 2" copy throughout.',
    values: [
      { id: true, v: '1', label: 'On' },
      { id: false, v: '0', label: 'Off' },
    ],
  },
];

export const DEFAULTS = {
  entry: 'drawer',
  card: 'horizontal',
  extensions: true,
  retreats: true,
  stepper: true,
  showUpgrades: true,
  showAmenities: true,
  upsellPlacement: 'page',
  multiProperty: true,
  multiRoom: true,
};

/** Named starting points for the panel — set everything at once, then
    fine-tune with the individual switches. */
export const PRESETS = [
  { id: 'ranch-full', label: 'Ranch full flow', patch: {} },
  { id: 'single-property', label: 'Single property', patch: { multiProperty: false } },
  { id: 'no-upsells', label: 'No upsells', patch: { showUpgrades: false, showAmenities: false } },
];

/* ---------- URL <-> config ---------- */

export function configToParams(config) {
  const p = new URLSearchParams();
  OPTIONS.forEach((o) => {
    if (config[o.key] === DEFAULTS[o.key]) return; /* defaults stay out of the URL */
    const val = o.values.find((v) => v.id === config[o.key]);
    if (val) p.set(o.param, val.v);
  });
  return p;
}

function configFromSearch(search) {
  const p = new URLSearchParams(search);
  const out = {};
  OPTIONS.forEach((o) => {
    if (!p.has(o.param)) return;
    const val = o.values.find((v) => v.v === p.get(o.param));
    if (val) out[o.key] = val.id;
  });
  return out;
}

function load() {
  /* A URL carrying any config param is a complete specification, not a
     patch — defaults are omitted from the link, so merging it over a
     stored session would let leftovers stand in for the values the link
     deliberately left at default. A bare URL resumes the session instead. */
  const fromUrl = configFromSearch(window.location.search);
  if (Object.keys(fromUrl).length) return { ...DEFAULTS, ...fromUrl };

  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch { /* fall through to defaults */ }
  return { ...DEFAULTS };
}

function loadRevealed() {
  if (new URLSearchParams(window.location.search).get('config') === 'on') return true;
  return sessionStorage.getItem(KEY + '-revealed') === '1';
}

const ConfigContext = createContext(null);

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(load);
  const [revealed, setRevealed] = useState(loadRevealed);
  const [panelOpen, setPanelOpen] = useState(false);
  const { key: locationKey } = useLocation();

  const setOption = useCallback((key, value) => {
    setConfig((prev) => {
      const next = { ...prev, [key]: value };
      sessionStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const applyPreset = useCallback((patch) => {
    const next = { ...DEFAULTS, ...patch };
    sessionStorage.setItem(KEY, JSON.stringify(next));
    setConfig(next);
  }, []);

  const reveal = useCallback(() => {
    sessionStorage.setItem(KEY + '-revealed', '1');
    setRevealed(true);
  }, []);

  const hide = useCallback(() => {
    sessionStorage.removeItem(KEY + '-revealed');
    setRevealed(false);
    setPanelOpen(false);
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '.' || !(e.metaKey || e.ctrlKey)) return;
      const el = document.activeElement;
      const tag = el && el.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (el && el.isContentEditable)) return;
      e.preventDefault();
      sessionStorage.setItem(KEY + '-revealed', '1');
      setRevealed(true);
      setPanelOpen((o) => !o);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const params = configToParams(config);
    if (revealed) params.set('config', 'on');
    const q = params.toString();
    const url = window.location.pathname + (q ? '?' + q : '') + window.location.hash;
    if (url !== window.location.pathname + window.location.search + window.location.hash) {
      window.history.replaceState(window.history.state, '', url);
    }
  }, [config, revealed, locationKey]);

  const value = useMemo(
    () => ({ config, setOption, applyPreset, revealed, reveal, hide, panelOpen, setPanelOpen }),
    [config, setOption, applyPreset, revealed, reveal, hide, panelOpen]
  );

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig() {
  return useContext(ConfigContext).config;
}

export function useConfigControls() {
  return useContext(ConfigContext);
}

/* ---------- Derived reads ---------- */

export function cardLayout(config) {
  return config.card === 'vertical' ? 'vertical' : 'horizontal';
}

/** Whether a given upsell belongs on its own step (vs. folded into checkout). */
export function upsellOn(config, which, where) {
  if (config.upsellPlacement !== where) return false;
  return which === 'upgrades' ? config.showUpgrades : config.showAmenities;
}

/* ---------- The flow, as a list ----------
   One definition the stepper draws and the Continue buttons walk.

   `entry === 'drawer'` (the default) — Location, Program's rooms &
   guests, and its fixed-block dates are all chosen in ReserveDrawer
   before the flow ever starts, so none of the three get a step or a
   route: the flow is Rooms → Upgrades → Add-ons → Checkout, numbered
   from 1. `entry === 'pages'` keeps the original seven-step shape,
   Location and Program (with Extensions mirroring Program's status via
   `linkedTo`, since it has no page of its own) ahead of Rooms. */
/* The key of the step that follows `key` in the live flow — for buttons
   that name their destination ("Continue to Enhancements"). */
export function nextStepKey(config, key) {
  const steps = flowSteps(config);
  const i = steps.findIndex((st) => st.key === key);
  return i === -1 ? null : (steps[i + 1] ? steps[i + 1].key : null);
}

export function flowSteps(config) {
  if (config.entry === 'drawer') {
    return [
      { key: 'rooms', label: 'Rooms', path: '/rooms' },
      upsellOn(config, 'upgrades', 'page') && { key: 'upgrades', label: 'Upgrades', path: '/upgrade' },
      upsellOn(config, 'amenities', 'page') && { key: 'add-ons', label: 'Add-ons', path: '/add-ons' },
      { key: 'checkout', label: 'Checkout', path: '/checkout' },
    ].filter(Boolean);
  }
  return [
    config.multiProperty && { key: 'location', label: 'Location', path: '/location' },
    { key: 'program', label: 'Program', path: '/program' },
    config.extensions && { key: 'extensions', label: 'Extensions', path: '/program', linkedTo: 'program' },
    { key: 'rooms', label: 'Rooms', path: '/rooms' },
    upsellOn(config, 'upgrades', 'page') && { key: 'upgrades', label: 'Upgrades', path: '/upgrade' },
    upsellOn(config, 'amenities', 'page') && { key: 'add-ons', label: 'Add-ons', path: '/add-ons' },
    { key: 'checkout', label: 'Checkout', path: '/checkout' },
  ].filter(Boolean);
}

/** The step a path belongs to — /room/:id counts as Rooms, and /program
    resolves to the Program step even though Extensions shares its path. */
export function stepIndexFor(config, pathname) {
  const steps = flowSteps(config);
  if (pathname.startsWith('/room/')) return steps.findIndex((s) => s.key === 'rooms');
  return steps.findIndex((s) => s.path === pathname);
}

/** Where Continue goes from here — skipping past any step that shares the
    current path (Extensions has no page of its own to land on). */
export function nextPathAfter(config, key) {
  const steps = flowSteps(config);
  const i = steps.findIndex((s) => s.key === key);
  if (i === -1) return '/checkout';
  for (let j = i + 1; j < steps.length; j++) {
    if (steps[j].path !== steps[i].path) return steps[j].path;
  }
  return '/checkout';
}

export function prevPathBefore(config, key) {
  const steps = flowSteps(config);
  const i = steps.findIndex((s) => s.key === key);
  /* Drawer mode's first step (Rooms) has nowhere earlier in the flow to
     land on — Location and Program are folded into the drawer, not a
     page — so its "back" is home, where the drawer opens. Pages mode's
     first step (Location or Program) keeps the old behaviour: no
     further-back page, so Layout treats it as no Back link at all (see
     the `rawBackTo !== pathname` check there). */
  const fallback = config.entry === 'drawer' ? '/' : (steps[0] ? steps[0].path : '/program');
  if (i <= 0) return fallback;
  for (let j = i - 1; j >= 0; j--) {
    if (steps[j].path !== steps[i].path) return steps[j].path;
  }
  return fallback;
}

/** Where a guest with no booking in progress should land to start one —
    the "No stay in progress" fallback links on Add-ons/Checkout and the
    Confirmation redirect guard. Pages mode sends them to the flow's own
    first step (Location or Program); drawer mode has no route to land
    on for that job, since the drawer collects the same information —
    home is where it opens. */
export function beginPath(config) {
  if (config.entry === 'drawer') return '/';
  return config.multiProperty ? '/location' : '/program';
}

/* Human-readable summary, for the panel and for the copied spec. */
export function describe(config) {
  return OPTIONS.map((o) => {
    const val = o.values.find((v) => v.id === config[o.key]);
    return { label: o.label, value: val ? val.label : String(config[o.key]) };
  });
}
