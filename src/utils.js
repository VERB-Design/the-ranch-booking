/* Pure date / money helpers shared across the app */

export const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

export function iso(d) {
  const p = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + p(d.getMonth() + 1) + '-' + p(d.getDate());
}
export function parse(isoStr) {
  const [y, m, d] = isoStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}
export function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
export function sameDay(a, b) {
  return a && b && a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}
export function isBetween(d, a, b) {
  return a && b && d > a && d < b;
}
export function addDays(d, n) {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

export function fmtShort(isoStr) {
  const d = parse(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
export function fmtLong(isoStr) {
  const d = parse(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}
/* "Thu 3" — short enough for a row of day chips */
export function fmtDayShort(isoStr) {
  const d = parse(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}
export function fmtDayLong(isoStr) {
  const d = parse(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

/* Whole dollars by default — the Ranch wires never show cents. Pass 2 for
   the rare line that needs them. */
export function money(n, decimals = 0) {
  const opts = decimals === 0
    ? { maximumFractionDigits: 0 }
    : { minimumFractionDigits: decimals, maximumFractionDigits: decimals };
  return '$' + n.toLocaleString('en-US', opts);
}

export function uid() {
  return 'x' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36);
}
