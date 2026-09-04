import Button from '../ui/Button.jsx';
import { D } from '../../store.jsx';
import { asset } from '../../utils.js';

const LOCKUP = {
  malibu: 'brand/the-ranch-malibu.svg',
  hudson: 'brand/the-ranch-hudson-valley.svg',
};

/* ============================================================
   PropertyBand
   ------------------------------------------------------------
   Nothing below the fold is specified in the Figma wire — a single quiet
   band naming both properties and opening the booking drawer pre-set to
   whichever one was clicked. Copy is the property `category` line already
   written in src/data.js (no new invented content); layout is a two-column
   divide rather than boxed cards, since the brief asks to keep this
   minimal and the wordmark lockups already carry the visual weight.
   ============================================================ */
export default function PropertyBand({ onBook }) {
  return (
    <section aria-label="Our properties" className="border-t border-line bg-page">
      <div className="mx-auto grid w-full max-w-[1440px] gap-10 px-5 py-16 md:grid-cols-2 md:gap-0 md:divide-x md:divide-line md:px-10 md:py-20 xl:px-[103px]">
        {D.propertyList.map((pid, i) => {
          const p = D.properties[pid];
          return (
            <div
              key={pid}
              className={
                'flex flex-col items-start gap-5 ' +
                (i === 1 ? 'md:pl-16' : 'md:pr-16')
              }
            >
              <img src={p.image} alt={p.imageAlt} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              <img src={asset(LOCKUP[pid])} alt={p.name} className="h-auto w-[200px]" />
              <span className="label-sm text-muted">{p.category}</span>
              <Button variant="ghost" onClick={() => onBook(pid)}>
                Book now
              </Button>
            </div>
          );
        })}
      </div>
    </section>
  );
}
