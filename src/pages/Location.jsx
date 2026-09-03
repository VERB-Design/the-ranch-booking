import { useNavigate } from 'react-router-dom';
import { PageTitle } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import { D, useBooking } from '../store.jsx';
import { nextPathAfter, useConfig } from '../config.jsx';
import usePageTitle from '../usePageTitle.js';

/* Step 1 · Location (docs/figma/wires/01) — two property cards; picking
   one both selects it and continues, so there is nothing for the shared
   ButtonBar to gate here. useStep() still runs so Layout knows this is a
   step (for the stepper highlight) even though its own Continue is inert. */
export default function Location() {
  usePageTitle('Choose Your Location');
  const { set } = useBooking();
  const config = useConfig();
  const navigate = useNavigate();
  useStep({ canContinue: false });

  function choose(pid) {
    set({ property: pid, rooms: [{ uid: 'r1', roomId: null, adults: 2, upgradedFrom: null }] });
    navigate(nextPathAfter(config, 'location'));
  }

  return (
    <div>
      <PageTitle title="Choose your location" sub="Select the property you would like to book." flush />
      <div className="grid gap-6 pb-12 md:grid-cols-2 md:gap-8">
        {D.propertyList.map((pid) => {
          const p = D.properties[pid];
          return (
            <button
              key={pid}
              type="button"
              onClick={() => choose(pid)}
              className="group flex flex-col border border-line bg-white text-left transition-colors hover:border-dark focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
            >
              <img src={p.image} alt={p.imageAlt} className="h-[258px] w-full object-cover" />
              <span className="flex flex-1 flex-col p-6">
                <span className="eyebrow text-accent">{p.category}</span>
                <span className="h-serif mt-1 text-h5 text-ink">{p.name}</span>
                <span className="mt-2 text-sm text-body">{p.desc}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
