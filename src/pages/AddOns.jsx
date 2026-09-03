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

function AddonRow({ addon, open, onToggle, draft, onDraftChange, dates, maxParty, onAdd, ctaLabel = 'Add to plan' }) {
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
            {ctaLabel}
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
  /* { id, index } while an existing booking is being edited; { id, index: null }
     while a second booking of the same enhancement is being made. */
  const [editing, setEditing] = useState(null);

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
    const entry = { id: addon.id, day: draft.day, time: draft.time, party: draft.party || 1 };
    const current = state.addons || [];
    const isEdit = editing && editing.id === addon.id && editing.index != null;
    const next = isEdit ? current.map((e, i) => (i === editing.index ? entry : e)) : [...current, entry];
    set({ addons: next });
    setOpenId(null);
    setEditing(null);
    toast(addon.name + (isEdit ? ' updated.' : ' added to your stay.'));
  }

  function editEntry(addon, index) {
    const e = (state.addons || [])[index];
    if (!e) return;
    setDraft(addon.id, { day: e.day, time: e.time, party: e.party || 1 });
    setEditing({ id: addon.id, index });
    setOpenId(addon.id);
  }

  function addAnother(addon) {
    setDraft(addon.id, { day: null, time: null, party: 1 });
    setEditing({ id: addon.id, index: null });
    setOpenId(addon.id);
  }

  function removeEntry(index) {
    set({ addons: (state.addons || []).filter((_, i) => i !== index) });
    if (editing && editing.index === index) setEditing(null);
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
            <div className="divide-y divide-line bg-light">
              {catalogue.map((addon) => {
                const entries = addedEntries
                  .map((e, index) => ({ ...e, index }))
                  .filter((e) => e.id === addon.id);
                const working = editing && editing.id === addon.id;
                const row = (
                  <AddonRow
                    addon={addon}
                    open={openId === addon.id}
                    onToggle={() => { setOpenId(openId === addon.id ? null : addon.id); if (openId === addon.id) setEditing(null); }}
                    draft={getDraft(addon.id)}
                    onDraftChange={(patch) => setDraft(addon.id, patch)}
                    dates={dates}
                    maxParty={totalGuests}
                    onAdd={() => addToPlan(addon)}
                    ctaLabel={working && editing.index != null ? 'Save changes' : 'Add to plan'}
                  />
                );
                if (!entries.length || working) return <div key={addon.id}>{row}</div>;
                /* An added enhancement stays where it is in the list, faded
                   back under an overlay: a gold "Added" pill with the date,
                   Edit / Remove per booking, and Add another. The row beneath
                   is inert; the overlay's links are the only controls. */
                return (
                  <div key={addon.id} className="relative" style={{ minHeight: entries.length * 40 + 56 }}>
                    <div inert="" aria-hidden="true" className="opacity-30">{row}</div>
                    <div className="absolute inset-0 flex flex-col justify-center gap-2 bg-light/85 px-5">
                      {entries.map((e) => (
                        <div key={e.index} className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <span className="label-sm inline-flex items-center gap-2 bg-accent px-3 py-1.5 text-brown-25">
                            <svg className="h-3 w-3" viewBox="0 0 12 12" aria-hidden="true">
                              <path d="M2 6.5 L4.8 9.2 L10 3.4" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Added
                          </span>
                          <span className="text-sm text-ink">
                            {addon.name} · {e.day ? fmtShort(e.day) : ''}{e.time ? ', ' + e.time : ''}
                            {e.party > 1 ? ' · ' + e.party + ' guests' : ''}
                          </span>
                          <span className="flex items-center gap-4">
                            <button type="button" onClick={() => editEntry(addon, e.index)} aria-label={'Edit ' + addon.name} className="label-sm text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2">Edit</button>
                            <button type="button" onClick={() => removeEntry(e.index)} aria-label={'Remove ' + addon.name} className="label-sm text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2">Remove</button>
                          </span>
                        </div>
                      ))}
                      <button type="button" onClick={() => addAnother(addon)} className="label-sm self-start text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2">
                        Add another
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
