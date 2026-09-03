/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import D from './data.js';
import { addDays, iso, nightsBetween, parse } from './stay.js';

const KEY = 'the-ranch-booking';

function defaults() {
  return {
    property: null,
    checkIn: null,
    checkOut: null,
    /* 'pre' | 'post' | null. Hudson's extension is a Friday night *after*
       a Thursday check-out ('post'); Malibu's is a Saturday pre-night
       *before* a Sunday check-in ('pre'), priced at the property's own
       preNightRate rather than the room's programme rate — see
       stay.js canExtend() and D.properties[pid].stayRules. Kept as a flag
       rather than baked into checkIn/checkOut so the calendar selection
       and the extension toggle never have to agree on which one owns the
       date. */
    extension: null,
    /* One entry per booked room. adults is 1–2 — the Ranch is adults-only,
       so there is no children field to carry. upgradedFrom holds the room
       id this slot was upgraded away from, so the offer can be undone. */
    rooms: [{ uid: 'r1', roomId: null, adults: 2, upgradedFrom: null }],
    /* Add-ons apply to the stay, not to a room — each entry is one booked
       slot: which add-on, which day of the stay, what time, and party size. */
    addons: [],
    guest: {},        /* primary contact */
    guests: [],        /* additional guests, checkout step 7 */
    confirmation: null,
    editRoom: null,    /* uid of the room slot being re-chosen, if any */
  };
}

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return { ...defaults(), ...JSON.parse(raw) };
  } catch { /* fall through */ }
  return defaults();
}

const BookingContext = createContext(null);
const ToastContext = createContext(null);

export function BookingProvider({ children }) {
  const [state, setState] = useState(load);
  const [toast, setToastMsg] = useState(null);

  const set = useCallback((patch) => {
    setState((prev) => {
      const next = { ...prev, ...patch };
      sessionStorage.setItem(KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    sessionStorage.removeItem(KEY);
    setState(defaults());
  }, []);

  const showToast = useCallback((msg) => {
    setToastMsg(msg);
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => setToastMsg(null), 3200);
  }, []);

  const value = useMemo(() => ({ state, set, reset }), [state, set, reset]);
  const toastValue = useMemo(() => ({ toast, showToast }), [toast, showToast]);

  return (
    <BookingContext.Provider value={value}>
      <ToastContext.Provider value={toastValue}>{children}</ToastContext.Provider>
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
export function useToast() {
  return useContext(ToastContext).showToast;
}
export function useToastMessage() {
  return useContext(ToastContext).toast;
}

/* ---------- Derived helpers (data-aware) ---------- */

/** Nights of the base stay plus the extension (Malibu pre-night or
    Hudson post-night), when taken. Every price and every rail line reads
    nights from here, so the extension can never be counted in one place
    and forgotten in another. */
export function nights(state) {
  if (!state.checkIn || !state.checkOut) return 0;
  const base = nightsBetween(parse(state.checkIn), parse(state.checkOut));
  return base + (state.extension ? 1 : 0);
}

export function guestsLabel(state) {
  const total = (state.rooms || []).reduce((s, r) => s + (r.adults || 0), 0);
  return total + ' Adult' + (total === 1 ? '' : 's');
}

/** Every night of the stay, as ISO dates — what the add-on day chips
    offer. Includes the extension when it is taken, on whichever end it
    actually falls: a day earlier for Malibu's pre-night, a day later for
    Hudson's post-night. */
/* The dates the guest actually arrives and leaves — the programme range
   shifted by the extension, so a pre-night reads as a Saturday arrival
   rather than a Sunday with a footnote. */
export function stayRange(state) {
  if (!state.checkIn || !state.checkOut) return null;
  const pre = state.extension === 'pre' ? 1 : 0;
  const post = state.extension === 'post' ? 1 : 0;
  return {
    arrive: iso(addDays(parse(state.checkIn), -pre)),
    depart: iso(addDays(parse(state.checkOut), post)),
  };
}

export function stayDates(state) {
  if (!state.checkIn || !state.checkOut) return [];
  const out = [];
  const pre = state.extension === 'pre' ? 1 : 0;
  const post = state.extension === 'post' ? 1 : 0;
  let d = addDays(parse(state.checkIn), -pre);
  const end = addDays(parse(state.checkOut), post);
  while (d < end) {
    out.push(iso(d));
    d = addDays(d, 1);
  }
  return out;
}

/* ---------- Multi-room helpers ----------
   These still run when a booking holds only one room — every list is
   simply length 1, so nothing here has to branch on multiRoom itself. */

export const MAX_ROOMS = 4;

export function newRoomSlot(rooms) {
  const list = rooms || [];
  return {
    uid: 'r' + (list.length + 1) + Date.now().toString(36),
    roomId: null,
    adults: 2,
    upgradedFrom: null,
  };
}

export function bookedRooms(state) {
  return (state.rooms || []).filter((r) => r.roomId);
}
/** index of the first room still needing a type, or -1 */
export function nextUnassigned(state) {
  return (state.rooms || []).findIndex((r) => !r.roomId);
}
/** The slot a room choice applies to: the one being edited if the guest
    asked to change it, otherwise the first still unfilled. */
export function activeRoomIndex(state) {
  const rooms = state.rooms || [];
  if (state.editRoom) {
    const i = rooms.findIndex((r) => r.uid === state.editRoom);
    if (i > -1) return i;
  }
  const pending = nextUnassigned(state);
  return pending === -1 ? rooms.length - 1 : pending;
}
export function roomsLabel(state) {
  const n = (state.rooms || []).length;
  return n + ' Room' + (n > 1 ? 's' : '');
}
/** keep the stay-level party in step with the per-room occupancy */
export function partyTotals(rooms) {
  return rooms.reduce((t, r) => ({ adults: t.adults + (r.adults || 0) }), { adults: 0 });
}

/* ---------- Pricing ----------
   Rates are per person, single occupancy — every room line multiplies
   its own nightly rate by that room's own adult count, not the stay's
   total guests. An upgraded room now carries its own real rate (the
   catalogue rooms are the real programme tiers, not a flat surcharge on
   top of the original), so `lineNightly` just reads the assigned room's
   rate; `Upgrade.jsx` computes its own "$X more / night" as the two
   rooms' real rate difference. */
export function lineNightly(room) {
  return room ? room.rate : 0;
}

/** The extension's own charge for one room's line, per person — Malibu's
    Saturday pre-night at the property's flat preNightRate, Hudson's
    Friday post-night at the room's own nightly rate. Returns 0 when no
    extension is taken. */
function extensionAmount(state, room) {
  if (!state.extension || !room) return 0;
  const rules = D.properties[room.property] && D.properties[room.property].stayRules;
  if (state.extension === 'pre') return (rules && rules.preNightRate) || room.rate;
  return room.rate; /* 'post' */
}

/** Quick total for a single candidate room against the stay currently in
    progress — used by the room/upgrade cards before a room is actually
    booked, so the "Or $X total" figure already accounts for guests-per-
    room and the extension the way the final pricing() will. */
export function roomStayTotal(state, room, adults) {
  if (!room || !state.checkIn || !state.checkOut) return 0;
  const base = nightsBetween(parse(state.checkIn), parse(state.checkOut));
  const guests = adults || 1;
  return room.rate * base * guests + extensionAmount(state, room) * guests;
}

export function pricing(state) {
  const n = nights(state);
  if (!n) return null;
  const extension = state.extension || null;
  const baseNights = n - (extension ? 1 : 0);

  const lines = bookedRooms(state).map((r) => {
    const room = D.roomById(r.roomId);
    if (!room) return null;
    const nightly = lineNightly(room);
    const adults = r.adults || 1;
    const extAmount = extensionAmount(state, room) * adults;
    const subtotal = nightly * baseNights * adults + extAmount;
    return { ...r, room, nightly, adults, extensionAmount: extAmount, subtotal };
  }).filter(Boolean);
  if (!lines.length) return null;

  const prop = D.properties[lines[0].room.property];
  const roomSubtotal = lines.reduce((s, l) => s + l.subtotal, 0);

  const addonLines = (state.addons || []).map((entry) => {
    const addon = D.addonById(entry.id);
    if (!addon) return null;
    const priceTBD = addon.per !== 'free' && typeof addon.price !== 'number';
    const total = addon.per === 'free' || priceTBD ? 0 : addon.price * (entry.party || 1);
    return { entry, addon, total, priceTBD };
  }).filter(Boolean);
  const addonsTotal = addonLines.reduce((s, l) => s + l.total, 0);

  const taxable = roomSubtotal + addonsTotal;
  const feeInfo = (prop && D.fees[prop.id]) || { allInMultiplier: 1.24, breakdown: [] };
  const tax = Math.round(taxable * (feeInfo.allInMultiplier - 1) * 100) / 100;
  const total = taxable + tax;
  const depositRate = D.fees.depositRate || 0.25;
  const dueToday = Math.round(total * depositRate * 100) / 100;

  return {
    lines, prop, n, roomCount: lines.length,
    room: lines[0].room, nightlyRate: lines[0].nightly,
    roomSubtotal, addonLines, addonsTotal, tax, total, dueToday, feeInfo,
  };
}

export { D };
