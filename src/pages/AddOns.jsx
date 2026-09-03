import { useState } from 'react';
import { BackLink, PageTitle } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import Accordion from '../components/ui/Accordion.jsx';
import Chip from '../components/ui/Chip.jsx';
import Counter from '../components/ui/Counter.jsx';
import Button from '../components/ui/Button.jsx';
import { D, stayDates, useBooking, useToast } from '../store.jsx';
import { fmtShort, money, parse } from '../utils.js';
import { beginPath, useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Step 6 · Add-ons (docs/BRIEF.md, wires 05a–05d). One card of accordion
   rows per remaining add-on; booking one moves it into its own "Added to
   your stay" card, matching wire 05d. Only one booking per add-on id is
   supported — a guest wanting the same treatment twice would need two
   different times, which the current state shape (one entry per id shown
   as "added") does not model; see docs/PRODUCTION-NOTES.md. */

function chipDate(isoStr) {
  const d = parse(isoStr);
  return d
    .toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    .replace(',', '');
}
function summaryDate(isoStr) {
  const d = parse(isoStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function AddonRow({ addon, open, onToggle, draft, onDraftChange, dates, maxParty, onAdd }) {
  const canAdd = !!draft.day && !!draft.time;
  const priceTBD = addon.per !== 'free' && typeof addon.price !== 'number';
  const total = addon.per === 'free' || priceTBD ? 0 : addon.price * (draft.party || 1);
  const priceLabel = addon.per === 'free' ? 'Free' : priceTBD ? 'Price on request' : money(total, 0);
  const summary = canAdd
    ? addon.name + ' · ' + summaryDate(draft.day) + ' · ' + draft.time + ' · Party of ' + (draft.party || 1) +
      ' · ' + priceLabel
    : 'Pick a day and time to add this experience.';

  return (
    <Accordion
      className="px-5"
      open={open}
      onToggle={onToggle}
      trigger={
        <div className="flex flex-1 items-center justify-between gap-4 pr-2 text-left">
          <div className="min-w-0">
            {/* The heading tag itself now comes from Accordion (it wraps the
                whole trigger button in an h3, the correct APG accordion
                pattern) — this stays a span so the row name isn't a heading
                nested a second time inside the one Accordion already added. */}
            <span className="h-serif block text-lg text-ink">{addon.name}</span>
            <p className="mt-1 text-sm text-body">{addon.detail}</p>
          </div>
          {addon.per === 'free' ? (
            <Chip className="shrink-0">Free</Chip>
          ) : priceTBD ? (
            <Chip className="shrink-0 text-[10px]">Price on request</Chip>
          ) : (
            <div className="shrink-0 text-right">
              <span className="h-serif block text-lg text-ink">{money(addon.price, 0)}</span>
              <span className="block text-xs text-muted">per person</span>
            </div>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="text-sm text-body">{addon.desc}</p>

        {dates.length > 0 && (
          <div>
            <span className="label-sm mb-2 block text-muted">Day</span>
            <div className="flex flex-wrap gap-2">
              {dates.map((d) => (
                <Chip key={d} selected={draft.day === d} onClick={() => onDraftChange({ day: d })}>
                  {chipDate(d)}
                </Chip>
              ))}
            </div>
          </div>
        )}

        <div>
          <span className="label-sm mb-2 block text-muted">Time</span>
          <div className="flex flex-wrap gap-2">
            {addon.times.map((t) => (
              <Chip key={t} selected={draft.time === t} onClick={() => onDraftChange({ time: t })}>
                {t}
              </Chip>
            ))}
          </div>
        </div>

        <div>
          <span className="label-sm mb-2 block text-muted">Party size</span>
          <Counter
            value={draft.party || 1}
            min={1}
            max={maxParty}
            onChange={(v) => onDraftChange({ party: v })}
            ariaLabel={addon.name + ' party size'}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <p className="text-sm text-body">{summary}</p>
          <Button variant="primary" disabled={!canAdd} onClick={onAdd}>
            Add to plan
          </Button>
        </div>
      </div>
    </Accordion>
  );
}

export default function AddOns() {
  usePageTitle('Enhance Your Stay');
  const { state, set } = useBooking();
  const config = useConfig();
  const toast = useToast();

  const [openId, setOpenId] = useState(null);
  const [drafts, setDrafts] = useState({});

  const dates = stayDates(state);
  const totalGuests = Math.max(1, (state.rooms || []).reduce((s, r) => s + (r.adults || 0), 0));
  const catalogue = state.property ? D.addonsFor(state.property) : [];
  const addedEntries = state.addons || [];
  useStep({ label: addedEntries.length ? 'Continue to Check-out' : 'No Thank You, Continue' });

  function getDraft(id) {
    return drafts[id] || { day: null, time: null, party: 1 };
  }
  function setDraft(id, patch) {
    setDrafts((d) => ({ ...d, [id]: { ...getDraft(id), ...patch } }));
  }

  function addToPlan(addon) {
    const draft = getDraft(addon.id);
    if (!draft.day || !draft.time) return;
    const next = (state.addons || []).filter((e) => e.id !== addon.id);
    next.push({ id: addon.id, day: draft.day, time: draft.time, party: draft.party || 1 });
    set({ addons: next });
    setOpenId(null);
    toast(addon.name + ' added to your stay.');
  }

  function removeEntry(id) {
    set({ addons: (state.addons || []).filter((e) => e.id !== id) });
  }

  if (!state.property) {
    return (
      <div>
        <p className="py-24 text-center text-body">
          No stay in progress.{' '}
          <BackLink to={beginPath(config)}>Begin your stay</BackLink>
        </p>
      </div>
    );
  }

  return (
    <div>
      <PageTitle title="Enhance your stay" sub="Add treatments and enhancements." flush />

      <div className="flex flex-col gap-8 pb-12">
        {catalogue.length > 0 && (
          <div>
            {/* Visually silent: a listed enhancement is by definition available,
               so the label says nothing to a sighted guest — it stays for the
               heading order a screen reader relies on. */}
            <h2 className="sr-only">Enhancements</h2>
            <div className="divide-y divide-line border border-line">
              {catalogue.map((addon) => {
                const entry = addedEntries.find((e) => e.id === addon.id);
                const row = (
                  <AddonRow
                    addon={addon}
                    open={!entry && openId === addon.id}
                    onToggle={() => setOpenId(openId === addon.id ? null : addon.id)}
                    draft={getDraft(addon.id)}
                    onDraftChange={(patch) => setDraft(addon.id, patch)}
                    dates={dates}
                    maxParty={totalGuests}
                    onAdd={() => addToPlan(addon)}
                  />
                );
                if (!entry) return <div key={addon.id}>{row}</div>;
                /* An added enhancement stays where it is, under an "Added"
                   overlay, rather than moving to another list — the guest
                   keeps their place on the page. The row beneath is inert;
                   Remove on the overlay is the only control. */
                return (
                  <div key={addon.id} className="relative">
                    <div inert="" aria-hidden="true" className="opacity-40">{row}</div>
                    <div className="absolute inset-0 flex items-center justify-center gap-5 bg-page/80">
                      <span className="label-sm inline-flex items-center gap-2 text-ink">
                        <svg className="h-3.5 w-3.5" viewBox="0 0 12 12" aria-hidden="true">
                          <path d="M2 6.5 L4.8 9.2 L10 3.4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Added
                        {entry.day ? <span className="normal-case tracking-normal text-muted">· {fmtShort(entry.day)}{entry.time ? ', ' + entry.time : ''}</span> : null}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeEntry(entry.id)}
                        aria-label={'Remove ' + addon.name}
                        className="label-sm text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {!catalogue.length && (
          <p className="text-sm text-body">No enhancements are available for this property yet.</p>
        )}
      </div>
    </div>
  );
}
