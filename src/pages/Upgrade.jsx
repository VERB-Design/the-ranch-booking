import { PageTitle } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import Button from '../components/ui/Button.jsx';
import { CheckIcon, PriceBlock, RoomCardFrame } from '../components/RoomCard.jsx';
import { D, nights, useBooking } from '../store.jsx';
import usePageTitle from '../usePageTitle.js';

/* Step 5 · Upgrades (docs/BRIEF.md, wire 04; updated per the real content
   pass). One offer, walking the property's own published room order —
   `D.upgradeFor` — priced at the *real* difference between the two
   rooms' rates, not a flat surcharge. store.jsx's pricing() now reads a
   booked room's own rate directly (`lineNightly`), so the number this
   page quotes is the number actually charged once "Upgrade" is pressed.

   The offer applies to the first booked room only. The wire carries no
   "Room 1 of 2" banner the way Rooms does, and the placeholder this page
   replaced already scoped itself to "the single-room upgrade offer" — a
   multi-room upgrade flow isn't specified anywhere in the brief. Noted in
   docs/PRODUCTION-NOTES.md as a scope assumption, not a silent guess. */
export default function Upgrade() {
  usePageTitle('Upgrade Your Stay');
  const { state, set } = useBooking();
  useStep({ label: 'Continue' });

  const rooms = state.rooms || [];
  const slot = rooms[0] || null;
  const originalRoomId = slot ? (slot.upgradedFrom || slot.roomId) : null;
  const originalRoom = originalRoomId ? D.roomById(originalRoomId) : null;
  const upgradeRoom = originalRoomId ? D.upgradeFor(originalRoomId) : null;
  const isUpgraded = !!(slot && slot.upgradedFrom);
  const n = Math.max(1, nights(state));
  const adults = (slot && slot.adults) || 1;
  const diff = upgradeRoom && originalRoom ? Math.max(0, upgradeRoom.rate - originalRoom.rate) : 0;

  function upgrade() {
    if (!slot || !upgradeRoom || !originalRoomId) return;
    const next = rooms.map((r, i) => (i === 0 ? { ...r, roomId: upgradeRoom.id, upgradedFrom: originalRoomId } : r));
    set({ rooms: next });
  }

  function keepMyRoom() {
    if (!slot || !originalRoomId) return;
    const next = rooms.map((r, i) => (i === 0 ? { ...r, roomId: originalRoomId, upgradedFrom: null } : r));
    set({ rooms: next });
  }

  return (
    <div>
      <PageTitle title="Upgrade your stay" sub="A better room for the same dates." />

      {upgradeRoom ? (
        <RoomCardFrame
          room={upgradeRoom}
          layout="horizontal"
          selected={isUpgraded}
          priceSlot={
            <PriceBlock
              nightly={diff}
              nights={n}
              adults={adults}
              pid={upgradeRoom.property}
              total={diff * n * adults}
              suffix=" more per person / night"
              modalTitle="Taxes & fees on the upgrade"
            />
          }
          actions={
            <div className="flex flex-wrap items-center gap-4">
              <Button
                variant={isUpgraded ? 'primary' : 'ghost'}
                selected={isUpgraded}
                icon={isUpgraded ? <CheckIcon /> : undefined}
                onClick={upgrade}
                className="w-full md:w-auto"
              >
                {isUpgraded ? 'Upgraded' : 'Upgrade'}
              </Button>
              {isUpgraded && (
                <button
                  type="button"
                  onClick={keepMyRoom}
                  className="label-sm text-ink underline underline-offset-4 hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
                >
                  Keep my room
                </button>
              )}
            </div>
          }
        />
      ) : (
        <div className="border border-line bg-white p-8 text-center">
          <p className="text-sm text-body">
            {originalRoom
              ? 'Your room is already our best in this category.'
              : 'Choose a room on the previous step to see upgrade options.'}
          </p>
        </div>
      )}
    </div>
  );
}
