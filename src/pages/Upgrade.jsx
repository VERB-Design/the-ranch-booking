import { PageTitle } from '../components/Chrome.jsx';
import { useStep } from '../components/Layout.jsx';
import { nextStepKey, useConfig } from '../config.jsx';
import Button from '../components/ui/Button.jsx';
import Checkbox from '../components/ui/Checkbox.jsx';
import { CheckIcon, PriceBlock, RoomCardFrame } from '../components/RoomCard.jsx';
import { D, nights, normalizeExtension, pricing, programPriceMultiplier, useBooking } from '../store.jsx';
import { EXTENSION_LABELS, extensionOptions, parse } from '../stay.js';
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

  const rooms = state.rooms || [];
  const slot = rooms[0] || null;
  const originalRoomId = slot ? (slot.upgradedFrom || slot.roomId) : null;
  const originalRoom = originalRoomId ? D.roomById(originalRoomId) : null;
  const upgradeRoom = originalRoomId ? D.upgradeFor(originalRoomId) : null;
  const config = useConfig();
  const isUpgraded = !!(slot && slot.upgradedFrom);

  /* The button says what the guest is doing: declining the offer, or
     carrying the upgrade on to whatever step comes next. */
  const nextKey = nextStepKey(config, 'upgrades');
  useStep({
    label: !isUpgraded
      ? 'No Thank You, Continue'
      : nextKey === 'add-ons' ? 'Continue to Enhancements' : 'Continue to Check-out',
  });
  const n = Math.max(1, nights(state));
  const adults = (slot && slot.adults) || 1;
  /* The two rooms' real rate difference, at whichever programme's price
     the guest chose back on the Program step — multiplying the raw diff
     is equivalent to multiplying each room's rate first and subtracting
     (the multiplier factors out), without recomputing both rates here. */
  const diff = upgradeRoom && originalRoom
    ? Math.max(0, upgradeRoom.rate - originalRoom.rate) * programPriceMultiplier(state.program)
    : 0;

  /* The whole stay's real total with this upgrade actually applied to
     the first room — not just the rate difference — so "New total"
     below and its "Excluding taxes and fees" breakdown both show what
     Checkout would actually charge (other booked rooms and any add-ons
     included), not only the upgrade's own increment. This never writes
     to the store; `upgrade()` still does that when the guest commits. */
  const previewRooms = upgradeRoom
    ? rooms.map((r, i) => (i === 0 ? { ...r, roomId: upgradeRoom.id, upgradedFrom: originalRoomId } : r))
    : rooms;
  const previewPricing = upgradeRoom ? pricing({ ...state, rooms: previewRooms }) : null;

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

  /* "Extend your stay" — the same two extension checkboxes ReserveDrawer's
     DatePicker offers on the first tray, reused here rather than
     re-specified: each one writes `state.extension.pre` /
     `.post` exactly as DatePicker does, gated by the same
     `extensionOptions` (src/stay.js) that says which direction(s) this
     stay's dates actually allow. Both controls read the same store
     field, so they can never disagree — ticking one here and reopening
     the drawer shows it already ticked, and vice versa. Renders beneath
     the upgrade card, and also when there is no upgrade to offer
     (originalRoom already at the top of its category, or no room chosen
     yet upstream). */
  const pid = state.property;
  const prop = pid ? D.properties[pid] : null;
  const checkInDate = state.checkIn ? parse(state.checkIn) : null;
  const checkOutDate = state.checkOut ? parse(state.checkOut) : null;
  const extendOptions = prop ? extensionOptions(pid, checkInDate, checkOutDate) : { pre: false, post: false };
  const extendable = extendOptions.pre || extendOptions.post;
  const ext = normalizeExtension(state.extension);

  function toggleExtension(key, checked) {
    if (!prop) return;
    set({ extension: { ...ext, [key]: checked } });
  }

  return (
    <div>
      <PageTitle title="Upgrade Your Stay" sub="A better room for the same dates." />

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
              total={previewPricing ? previewPricing.total : diff * n * adults}
              totalLabel="New total"
              suffix=" more per person / night"
              modalTitle="Taxes & fees on the upgrade"
              feePricing={previewPricing}
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
        <div className="bg-light p-5 text-center md:p-8">
          <p className="text-sm text-body">
            {originalRoom
              ? 'Your room is already our best in this category.'
              : 'Choose a room on the previous step to see upgrade options.'}
          </p>
        </div>
      )}

      {extendable && (
        <div className="mt-6 bg-light p-5 md:p-8">
          <h2 className="h-serif text-lg text-ink">Extend Your Stay</h2>
          <p className="mt-2 text-sm text-body">
            Settle into the program or linger longer and enjoy the property&rsquo;s amenities.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {extendOptions.pre && (
              <Checkbox
                checked={ext.pre}
                onChange={(v) => toggleExtension('pre', v)}
                label={EXTENSION_LABELS.pre}
              />
            )}
            {extendOptions.post && (
              <Checkbox
                checked={ext.post}
                onChange={(v) => toggleExtension('post', v)}
                label={EXTENSION_LABELS.post}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
