/* ============================================================
   The Ranch — Data
   ------------------------------------------------------------
   Real content, crawled from theranchlife.com and its booking engine
   (newbooking.azds.com) on 2 Sep 2026 at the client's request. Every fact
   here has a source URL — see docs/content/CONTENT-SOURCE.md for the
   verbatim quotes and docs/content/ranch-content.json for the same
   content in this shape with `source` / `"UNVERIFIED"` markers. This file
   keeps only what the components read; the `source` strings were left out
   of the runtime object on purpose so this stays a plain catalogue rather
   than a second copy of the audit doc.

   Two properties, one programme rate per room (per person, single
   occupancy — the Ranch sells a fixed-length stay, not a rate-plan
   matrix). Rooms marked `unverified: true` below carry a rate the booking
   engine did not return for the sampled search window; the figure is
   extrapolated proportionally from the rooms that *were* returned (by
   square footage where published, by tier otherwise) — see
   docs/PRODUCTION-NOTES.md, "Content accuracy" for the reasoning behind
   each one and the client sign-off this still needs.
   ============================================================ */

import { naturalJoin } from './utils.js';

const IMG = import.meta.env.BASE_URL + 'img/';

function img(path, alt) {
  return { src: IMG + path, alt };
}

const D = (function () {

  /* ---------- Properties ----------
     `stayRules` is the one property-specific rulebook src/stay.js reads —
     Malibu and Hudson Valley run genuinely different booking mechanics
     (different check-in days, different shapes of "extra night"), not a
     shared rule with different constants. */
  var properties = {
    malibu: {
      id: 'malibu',
      name: 'The Ranch Malibu',
      category: 'Malibu, California',
      address: '12220 Cotharin Road, Malibu, CA 90265',
      transferAirport: 'LAX',
      image: img('malibu/malibu-hero-poster.jpg', 'Aerial of The Ranch Malibu in the Santa Monica Mountains, coastal fog beyond').src,
      imageAlt: 'Aerial of The Ranch Malibu in the Santa Monica Mountains, coastal fog beyond',
      /* Property-wide shots (not tied to a specific room) that pad a
         room's own gallery out to three cells — see docs/content/IMAGES.md.
         `D.galleryFor` reads this; a room's own images always come first. */
      galleryExtras: [
        img('malibu/malibu-hero-poster.jpg', 'Aerial of The Ranch Malibu in the Santa Monica Mountains, coastal fog beyond'),
        img('malibu/malibu-ranch-house-exterior.jpg', 'The Ranch Malibu exterior, white board-and-batten ranch house, agave and oak'),
        img('malibu/malibu-private-cottage-01.jpg', 'Queen bed in a Malibu guest cottage, morning light'),
      ],
      desc: 'The original Ranch, twenty-one private cottages in the Santa Monica Mountains less than an hour from Los Angeles. A regenerative organic garden, ocean air, and the six-night signature program.',
      guestCount: 'up to 25 guests',
      cottages: 21,
      siteUrl: 'https://www.theranchlife.com/locations/malibu',
      /* Named for the "Choose your program" tray/inline chooser (Sep 2026
         pass) — the standard program's own card, alongside whatever
         dated retreat falls inside the guest's stay. */
      programName: 'The Signature Program',
      programDesc: 'The standard Ranch program — six nights of daily hikes, spa treatments and meals built around the property’s own organic garden, with the option to add a night before or after.',
      /* Client's second feedback round (9 Sep 2026): Malibu is a fixed
         6-night Sunday→Saturday core stay — no more Saturday check-in, no
         5-night stays. Guests may add the Saturday night before or the
         Sunday night after, or both (see stay.js's extensionOptions).
         `preNightRate` is quoted by the client for the *pre*-night only;
         the post-night has no rate of its own in the brief, so the same
         figure is charged for both and flagged as an assumption — see
         docs/PRODUCTION-NOTES.md, dated entry. */
      stayRules: {
        preNightRate: 1275, /* per person — charged for either extra night, see note above */
        blocksCopy: 'Stays run Sunday to Saturday, six nights. Add a night before or after, or both.',
        arrival: '12:00 pm (noon)',
        departure: '10:00 am',
      },
      resortFee: 0,
      cancelDays: 40,
      cancelCopy: 'Should your plans change, cancellations made 41 days or more before arrival are subject to a cancellation fee equal to 10% of the deposit paid. Cancellations made within 40 days of arrival are nonrefundable, and all payments will be forfeited.',
      depositCopy: 'A credit card is required to reserve your stay. A deposit equal to 25% of the total stay, including taxes and fees, will be charged at the time of booking. The remaining balance will be charged 40 days prior to arrival. Reservations made within 40 days of arrival require full payment at the time of booking.',
    },
    hudson: {
      id: 'hudson',
      name: 'The Ranch Hudson Valley',
      category: 'Sloatsburg, New York',
      address: '150 Sisters Servants Lane, Sloatsburg, NY 10974',
      transferAirport: 'EWR',
      image: img('hudson/hudson-hero-poster.jpg', 'Front elevation of the Hudson Valley stone manor and gravel drive').src,
      imageAlt: 'Front elevation of the Hudson Valley stone manor and gravel drive',
      galleryExtras: [
        img('hudson/hudson-hero-poster.jpg', 'Front elevation of the Hudson Valley stone manor and gravel drive'),
        img('hudson/hudson-backyard-aerial.jpg', 'Aerial of the Hudson Valley estate set in forest'),
      ],
      desc: 'A stone manor on a historic lakefront estate an hour from New York City, bordered by more than 46,000 acres of protected parkland. Twenty-six guest rooms, a 5,000-square-foot solarium, and three-night stays.',
      guestCount: 'averages 25 guests',
      rooms: 26,
      siteUrl: 'https://www.theranchlife.com/locations/hudson-valley',
      programName: 'The Hudson Valley Program',
      programDesc: 'The standard Hudson Valley program — three nights of guided hikes, spa treatments and seasonal meals inside the stone manor and its grounds, with the option to add the Sunday night before or after.',
      /* Client's second feedback round (9 Sep 2026): a fixed 3-night core
         stay, Thursday→Sunday or Monday→Thursday — no more 4- or 7-night
         options. The one extra night is always the Sunday that sits
         between the two patterns (see stay.js's extensionOptions), priced
         at the room's own nightly rate rather than a flat figure of its
         own, since the brief gives Hudson no separate extension rate —
         see docs/PRODUCTION-NOTES.md, dated entry. This rule is stated by
         the client to begin 1 Nov 2026; applied for every date rather
         than building a date-based switch, per the brief's own
         instruction — see the same PRODUCTION-NOTES entry. */
      stayRules: {
        blocksCopy: 'Stays run Thursday to Sunday or Monday to Thursday, three nights. Add the Sunday night before or after.',
        arrival: '1:00 pm',
        departure: '10:00 am',
      },
      resortFee: 0,
      cancelDays: 40,
      cancelCopy: 'Should your plans change, cancellations made 41 days or more before arrival are subject to a cancellation fee equal to 10% of the deposit paid. Cancellations made within 40 days of arrival are nonrefundable, and all payments will be forfeited.',
      depositCopy: 'A credit card is required to reserve your stay. A deposit equal to 25% of the total stay, including taxes and fees, will be charged at the time of booking. The remaining balance will be charged 40 days prior to arrival. Reservations made within 40 days of arrival require full payment at the time of booking.',
    },
  };
  var propertyList = ['malibu', 'hudson'];

  /* ---------- Rooms ----------
     One nightly programme rate per room, per person, single occupancy.
     `images` is an ordered array of { src, alt } — the room card shows
     images[0], RoomDetail's gallery shows all of them. A room with no
     `images` entry falls back to the shared `.ph-img` placeholder block,
     same as before real photography existed. */
  var rooms = [
    {
      id: 'malibu-queen-cottage',
      property: 'malibu',
      name: 'Queen Cottage',
      bed: 'Queen bed',
      sqft: 273,
      view: null,
      maxOccupants: 1,
      amenities: ['Jolie filtered showerhead', 'Desk', 'Custom linens'],
      detail: 'Private cottage • 1 queen bed • Up to 273 sq.ft.',
      desc: 'A private guest cottage with reclaimed wood floors, a limestone bathroom, and a linen-covered queen bed. No television; Wi-Fi limited to the cottage.',
      images: [
        img('malibu/malibu-queen-cottage-01.jpg', 'Queen bed in a Malibu guest cottage, white linen, reclaimed wood floor'),
        img('malibu/malibu-queen-cottage-02.jpg', 'Guest cottage exterior and gravel path under a live oak'),
      ],
      rate: 1550,
    },
    {
      id: 'malibu-king-cottage',
      property: 'malibu',
      name: 'King Cottage',
      bed: 'California King bed',
      sqft: 305,
      view: null,
      maxOccupants: 2,
      amenities: ['Jolie filtered showerhead', 'Porch (some cottages)', 'Desk'],
      detail: 'Private cottage • California king • Up to 305 sq.ft.',
      desc: 'For couples or those sharing a bed. A California king bed, desk, limestone bathroom with Jolie filtered showerhead, and porch in select cottages.',
      images: [img('malibu/malibu-king-cottage-01.jpg', 'Cottage entrance framed by garden planting')],
      rate: 1700,
      unverified: true,
      rateNote: 'The booking engine did not return a King Cottage rate for a 1-adult search. Extrapolated as a proportional step above the Queen Cottage rate — the site itself says the per-person figure is "very likely" the same $1,550. Confirm with client.',
    },
    {
      id: 'malibu-double-queen-cottage',
      property: 'malibu',
      name: 'Double Queen Cottage',
      bed: 'Two queen beds',
      sqft: 412,
      view: null,
      maxOccupants: 2,
      amenities: ['Private outdoor space (some cottages)', 'Jolie filtered showerhead', 'Desk'],
      detail: 'Private cottage • 2 queen beds • Up to 412 sq.ft.',
      desc: 'The most spacious option, for guests who wish to share a room but prefer separate beds. Private outdoor space in select cottages.',
      images: [
        img('malibu/malibu-double-queen-cottage-01.jpg', 'Two queen beds in a Malibu guest cottage, doors open to the garden'),
        img('malibu/malibu-cottage-exterior.jpg', 'Cottage doorway with a guest name plate'),
      ],
      rate: 1750,
      unverified: true,
      rateNote: 'Not returned by the booking engine for a 1-adult search. Extrapolated as the top of the three-cottage range — confirm with client.',
    },
    {
      id: 'hudson-petite-deluxe',
      property: 'hudson',
      name: 'Petite Deluxe Room',
      bed: 'Queen bed',
      sqft: 290,
      view: 'Courtyard view',
      floor: '2nd floor',
      maxOccupants: 1,
      amenities: ['Walk-in shower', 'Marble vanity', 'Jolie showerhead'],
      detail: 'Courtyard view • 1 queen bed • Up to 290 sq.ft.',
      desc: 'A private room with a queen bed, courtyard view, and bathroom with shower, located on the second floor. No television; Wi-Fi limited to guest rooms.',
      images: [img('hudson/hudson-petite-deluxe-01.jpg', 'Petite Deluxe room: queen bed, writing desk, courtyard window')],
      rate: 1675,
    },
    {
      id: 'hudson-deluxe',
      property: 'hudson',
      name: 'Deluxe Room',
      bed: 'Queen or King bed',
      sqft: 415,
      view: 'Courtyard or trail view',
      floor: '2nd or 3rd floor',
      maxOccupants: 2,
      amenities: ['Walk-in shower', 'Separate bathtub (some rooms)', 'Marble vanity'],
      detail: 'Courtyard or trail view • 1 queen or king bed • Up to 415 sq.ft.',
      desc: 'Serene and spacious, with a king or queen bed and bathroom with a shower, plus separate bathtub in select rooms.',
      images: [img('hudson/hudson-deluxe-01.jpg', 'Deluxe room: king bed, armchair and leather bench at the window')],
      rate: 1825,
    },
    {
      id: 'hudson-deluxe-double',
      property: 'hudson',
      name: 'Deluxe Double Room',
      bed: 'Two queen beds',
      sqft: 415,
      view: 'Lake view',
      floor: '2nd or 3rd floor',
      maxOccupants: 3,
      amenities: ['Lake views', 'Walk-in shower', 'Marble vanity'],
      detail: 'Lake view • 2 queen beds • Up to 415 sq.ft.',
      desc: 'Perfectly suited to guests who desire separate beds while staying together, with two queen beds, bathroom with marble vanity, and views of the lake.',
      images: [img('hudson/hudson-deluxe-double-01.jpg', 'Deluxe Double: two queen beds under a dormer window')],
      rate: 2025,
      unverified: true,
      rateNote: 'Not returned by the booking engine for the sampled window. Extrapolated by interpolating between Deluxe ($1,825, 415 sq ft) and Junior Suite ($2,125, 635 sq ft) — confirm with client. Square footage corrected to 415 sq.ft. per the client’s 9 Sep 2026 copy doc (was 560 sq.ft., extrapolated); the rate figure itself is unchanged and still unverified.',
    },
    {
      id: 'hudson-junior-suite',
      property: 'hudson',
      name: 'Junior Suite',
      bed: 'King bed',
      sqft: 635,
      view: 'Lake or courtyard view',
      floor: '2nd or 3rd floor',
      maxOccupants: 2,
      amenities: ['Seating area', 'Single or double vanity', 'Shower, some with separate bathtub'],
      detail: 'Lake or courtyard view • 1 king bed • Up to 635 sq.ft.',
      desc: 'Airy and inviting, featuring a king bed, separate sitting area, bathroom with a shower and double vanity, and historic millwork throughout.',
      images: [img('hudson/hudson-junior-suite-01.jpg', 'Junior Suite: king bed, panelled walls, seating area')],
      rate: 2125,
    },
    {
      id: 'hudson-junior-suite-two-queen',
      property: 'hudson',
      name: 'Junior Double Suite',
      bed: 'Two queen beds',
      sqft: 635,
      view: 'Lake or courtyard view',
      floor: '2nd or 3rd floor',
      maxOccupants: 3,
      amenities: ['Separate bathtub', 'Walk-in shower', 'Single or double vanity'],
      detail: 'Lake or courtyard view • 2 queen beds • Up to 635 sq.ft.',
      desc: 'A light-filled respite with two lushly appointed queen beds, a bathroom with a shower and separate bathtub/double vanity in select suites.',
      images: [img('hudson/hudson-junior-suite-two-queen-01.jpg', 'Junior Suite Two Queen: two queen beds, desk and courtyard windows')],
      rate: 2150,
      unverified: true,
      rateNote: 'Not returned by the booking engine for the sampled window. Extrapolated as a small step above the (verified) Junior Suite rate at the same square footage — confirm with client.',
    },
    {
      id: 'hudson-premier-junior-suite-morgan',
      property: 'hudson',
      name: 'Premier Junior Suite—Morgan',
      bed: 'King bed',
      sqft: 650,
      view: 'Lake or mountain view',
      floor: '2nd floor',
      maxOccupants: 2,
      amenities: ['Double vanity', 'Separate bathtub and shower', 'Sitting room just outside'],
      detail: 'Lake or mountain view • 1 king bed • Up to 650 sq.ft.',
      desc: 'A spacious second-floor suite featuring a king bed, separate sitting room, and bathroom with double vanity, separate bathtub, and shower.',
      images: [img('hudson/hudson-premier-junior-suite-morgan-01.jpg', 'Premier Junior Suite – Morgan: king bed, sitting area, striped rug, lake-side windows')],
      rate: 2225,
      unverified: true,
      rateNote: 'Not returned by the booking engine for the sampled window. Extrapolated by interpolating between Junior Suite ($2,125, 635 sq ft) and Premier Junior Suite Hamilton ($2,525, 750 sq ft) at this room’s 650 sq ft, rounded up slightly to keep the tier order climbing — confirm with client.',
    },
    {
      id: 'hudson-premier-junior-suite-hamilton',
      property: 'hudson',
      name: 'Premier Junior Suite—Hamilton',
      bed: 'King bed',
      sqft: 750,
      view: 'Courtyard view',
      floor: '1st floor',
      maxOccupants: 2,
      amenities: ['Private entrance option', 'Walk-in closet / dressing room', 'Double vanity, separate bathtub and shower'],
      detail: 'Courtyard view • 1 king bed • Up to 750 sq.ft.',
      desc: 'Secluded first-floor suite with its own private entrance, walk-in closet/dressing room, and spacious bathroom with a double vanity, shower, and separate bathtub.',
      images: [img('hudson/hudson-premier-junior-suite-hamilton-01.jpg', 'Premier Junior Suite – Hamilton: king bed against original oak panelling')],
      rate: 2525,
    },
  ];

  function roomById(id) {
    return rooms.find(function (r) { return r.id === id; }) || null;
  }
  function roomsFor(pid) {
    return rooms.filter(function (r) { return r.property === pid; });
  }
  /* Per-person nightly rates by occupancy for the drawer's Rates block.
     The engine's sampled per-person rate is treated as the double-occupancy
     figure (the industry's usual quoted rate); single occupancy is derived
     above it at the only ratio the site publishes — a past special's
     "$1,325 single / $985 per person double" — rounded to $25.
     UNVERIFIED — see docs/PRODUCTION-NOTES.md. */
  function occupancyRates(pid) {
    var double = fromPrice(pid);
    var single = Math.round((double * (1325 / 985)) / 25) * 25;
    return { single: single, double: double, unverified: true };
  }

  function fromPrice(pid) {
    var list = roomsFor(pid);
    return list.reduce(function (m, r) { return Math.min(m, r.rate); }, Infinity);
  }

  /** A room's own photos first, then its property's non-room-specific
      shots (exterior, aerial) to round the hero gallery out to three
      cells — see `galleryExtras` above and docs/content/IMAGES.md.
      De-duplicates by src in case a room's own image ever also appears
      in the property's extras list. */
  function galleryFor(room) {
    if (!room) return [];
    var prop = properties[room.property];
    var own = room.images || [];
    var extras = (prop && prop.galleryExtras) || [];
    var seen = {};
    own.forEach(function (im) { seen[im.src] = true; });
    var extra = extras.filter(function (im) { return !seen[im.src]; });
    return own.concat(extra);
  }

  /* ---------- Upgrades ----------
     One offer per property: the next category up in the site's own
     published room order. The nightly difference is the two rooms' real
     rates now, not a flat surcharge — see `Upgrade.jsx`. */
  var categoryOrder = {
    malibu: ['malibu-queen-cottage', 'malibu-king-cottage', 'malibu-double-queen-cottage'],
    hudson: [
      'hudson-petite-deluxe', 'hudson-deluxe', 'hudson-deluxe-double',
      'hudson-junior-suite', 'hudson-junior-suite-two-queen',
      'hudson-premier-junior-suite-morgan', 'hudson-premier-junior-suite-hamilton',
    ],
  };
  function upgradeFor(roomId) {
    var room = roomById(roomId);
    if (!room) return null;
    var order = categoryOrder[room.property];
    if (!order) return null;
    var idx = order.indexOf(roomId);
    if (idx === -1 || idx === order.length - 1) return null;
    return roomById(order[idx + 1]);
  }

  /* ---------- Every Stay Includes ----------
     Client's second feedback round (9 Sep 2026): replaced with the
     client's updated eight-line order — the 8 Sep pass's nine lines minus
     Body composition analysis, which the client's copy doc drops
     entirely; the `bodpod` icon key is no longer read anywhere. {airport}
     is filled in by the component with the guest's own property.
     `meditation` and `fitness` are icon keys hand-drawn for the prior
     pass, like `amenities`/`laundry` before them, not exported from the
     client's Figma icon set; see docs/PRODUCTION-NOTES.md, Licensing.
     `stayDescription` (src/stay.js) does not extract nouns from these
     titles — the wording here is long-form list copy, not a noun a
     one-line sentence can safely pull out; that sentence is hard-coded
     instead, see stay.js. */
  var includes = [
    { icon: 'spa', title: 'Daily deep tissue massage', desc: 'A 50-minute deep tissue massage for each full day of the program.' },
    { icon: 'dining', title: 'All meals and snacks', desc: 'Plant-forward, nutritionally dense meals and snacks, plus morning organic coffee and a daily tea bar.' },
    { icon: 'hike', title: 'Guided daily hikes', desc: 'Daily guided hikes across the property’s own trails.' },
    { icon: 'meditation', title: 'Daily fitness, yoga, and meditation classes', desc: 'An afternoon fitness class alongside a daily yoga or meditation class.' },
    { icon: 'amenities', title: 'Access to pool, infra-red sauna, and cold plunge', desc: 'Heated pool, jacuzzi, infra-red sauna and cold plunge; weekly sound bath.' },
    { icon: 'laundry', title: 'Daily wash & fold laundry service', desc: 'Personal laundry, washed and folded, available daily.' },
    { icon: 'transfer', title: 'Return shuttle transfer to airport', desc: 'Departure shuttle transfer to {airport} at 10 am. Arrival is on your own.' },
    { icon: 'fitness', title: 'Unlimited use of fitness facilities', desc: 'Full access to the property’s fitness facilities for the length of your stay.' },
  ];

  /** The room page's five FAQs, built from the property's own rules and
      copy rather than invented — arrival/departure, what the rate
      includes (the same first four `includes` titles the room page's own
      "Every stay includes" paragraph uses), deposit/balance, cancellation
      and the airport transfer. Kept here, next to the copy it quotes, so
      the two can never drift apart. */
  function faqsFor(pid) {
    var prop = properties[pid];
    if (!prop) return [];
    var rules = prop.stayRules;
    var includesList = includes.slice(0, 4).map(function (i) { return i.title.toLowerCase(); });
    return [
      {
        q: 'What time can I arrive, and when do I need to check out?',
        a: 'Arrival is ' + rules.arrival + ' and departure is ' + rules.departure + '. ' + rules.blocksCopy,
      },
      {
        q: 'What does the rate include?',
        a: 'The program rate covers ' + naturalJoin(includesList) + ', for every night of your stay.',
      },
      {
        q: 'How does the deposit and balance work?',
        a: prop.depositCopy,
      },
      {
        q: 'What is the cancellation policy?',
        a: prop.cancelCopy,
      },
      {
        q: 'Is airport transfer included?',
        a: 'A return airport transfer to ' + prop.transferAirport + ' is included, departing at 10 am. Arrival at the property is on your own.',
      },
    ];
  }

  /* ---------- Add-ons ----------
     Real elective services. Cold plunge, sound bath and nutrition talks
     are included in every stay (above), not sold here; equine and surf
     do not exist at either property and were dropped. Several electives
     are listed on site with no published price — `price: null` rather
     than a guessed number; the UI shows "Price on request". `times` is
     not published for any add-on (booking times aren't on site) — the
     arrays below are a prototype necessity so the day/time picker has
     something to offer, not sourced content; see PRODUCTION-NOTES. */
  var addons = [
    {
      id: 'facial-balance-brighten',
      name: 'Tata Harper Facial — Balance & Brighten',
      price: 300,
      per: 'person',
      times: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
      detail: '50 minutes · $300, or 100 minutes · $475',
      desc: 'Sound therapy, guided breathwork and clinical facial massage, with Tata Harper serums and eye creams matched to your skin.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'facial-botanical-sculpt',
      name: 'Tata Harper Facial — Botanical Sculpt',
      price: 300,
      per: 'person',
      times: ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM'],
      detail: '50 minutes · $300, or 100 minutes · $475',
      desc: 'A precision facial that hydrates and firms, with sculpting techniques that lift facial contours.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'honey-cocoon-wrap',
      name: 'Honey Cocoon Body Wrap',
      price: 500,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '100 minutes',
      desc: 'A full-body scrub, a wrap in Tata Harper’s Raw Honey Crystal Mask, and a relaxing massage to finish.',
      properties: ['hudson'],
    },
    {
      id: 'radiant-renewal-ritual',
      name: 'Radiant Renewal Body Ritual',
      price: 500,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '100 minutes',
      desc: 'Dry brushing and thermal Gua Sha stones for lymphatic drainage, finished with Tata Harper’s Resurfacing Body Serum.',
      properties: ['hudson'],
    },
    {
      id: 'double-massage',
      name: 'Double Massage',
      price: null,
      per: 'person',
      times: ['9:00 AM', '10:30 AM', '1:00 PM', '3:00 PM', '4:30 PM'],
      detail: '100 minutes · Extends the daily massage',
      desc: 'Extend your daily massage to 100 minutes for deeper tissue work and longer-lasting relief.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'private-fitness-yoga',
      name: 'Private Fitness & Yoga',
      price: null,
      per: 'person',
      times: ['7:00 AM', '8:00 AM', '5:00 PM'],
      detail: '60 minutes • Customized session • Up to 2 guests',
      desc: 'Customized workouts and yoga sessions, guided by The Ranch team.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'acupuncture',
      name: 'Acupuncture',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '60 minutes · Also offered with cupping in Malibu',
      desc: 'Traditional Chinese medicine to promote healing and ease pain by restoring the body’s energy flow.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'chiropractic',
      name: 'Chiropractic Treatment',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '30 minutes',
      desc: 'Balance, adjust and realign the body to ease pain, improve function and support recovery.',
      properties: ['malibu'],
    },
    {
      id: 'reiki',
      name: 'Reiki',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '60 minutes',
      desc: 'A Reiki Master restores balance on physical, emotional and spiritual levels through gentle touch or non-touch techniques.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'energy-healing',
      name: 'Energy Healing',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '60 minutes',
      desc: 'Intuitive counselling, energy and sound to clear what is holding you back.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'hypnotherapy',
      name: 'Hypnotherapy',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '60 minutes',
      desc: 'A guided state of relaxation to release fears and negative thought patterns.',
      properties: ['hudson'],
    },
    {
      id: 'colon-hydrotherapy',
      name: 'Colon Hydrotherapy',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '45 minutes',
      desc: 'A gentle cleansing process to support digestive health.',
      properties: ['malibu', 'hudson'],
    },
    {
      id: 'iv-therapy',
      name: 'IV Therapy',
      price: null,
      per: 'person',
      times: ['9:00 AM', '11:00 AM', '2:00 PM'],
      detail: '45–60 minutes · NAD+, Detox, Immunity, Lipotropic Fat Burning, Recovery',
      desc: 'Intravenous nutrients for a rapid recovery boost. Choose from the signature IV menu.',
      properties: ['malibu'],
    },
    {
      id: 'physical-therapy',
      name: 'Physical Therapy',
      price: null,
      per: 'person',
      times: ['10:00 AM', '1:00 PM', '3:00 PM'],
      detail: '60 minutes',
      desc: 'One-on-one physical therapy with the Ranch team, worked around the rest of your program.',
      properties: ['hudson'],
    },
  ];
  function addonById(id) {
    return addons.find(function (a) { return a.id === id; }) || null;
  }
  function addonsFor(pid) {
    return addons.filter(function (a) { return a.properties.indexOf(pid) > -1; });
  }

  /* ---------- Retreats ----------
     Real dated events. Every date below lands on a valid check-in day at
     its property (confirmed against src/stay.js's own rules, not just
     copied from the site) — the Erewhon night is a Saturday (a Malibu
     check-in day); both Backbone Trail weeks are Sundays running the
     standard 6-night Sun→Sat block. `desc` is the one-line description
     the retreat modal and card both read (docs/figma/wires/02a–c v2);
     `note` is kept as the longer-form line it grew from.

     Hudson's one entry below is new for this pass and is NOT sourced —
     the site publishes no dated Hudson retreat (Winter Wellness and the
     Culinary Residency are both undated). The 02a–c v2 wires show a
     placeholder "Special program with guest Influencer Namehere" on 17
     September 2026 (a real Hudson check-in day — Thursday, 3-night
     Thu→Sun block); this entry keeps that date and shape so the flow has
     something real to walk, with invented-but-plausible copy standing in
     for the placeholder name. See docs/PRODUCTION-NOTES.md, "Content
     accuracy" — needs a real name/date from the client before ship. */
  var retreats = {
    malibu: [
      {
        date: '2026-10-10',
        name: 'Erewhon × The Ranch — One-Night Retreat',
        desc: 'A one-night collaboration with Erewhon opens the standard Malibu program, October 10, 2026.',
        note: 'A one-night retreat with Erewhon at The Ranch Malibu, October 10, 2026. Booking continues into the standard multi-night program from this date — the one-night format itself isn’t modelled in this prototype.',
      },
      {
        date: '2027-03-21',
        name: 'Backbone Trail Week',
        desc: 'A themed Signature week on the Backbone Trail, six nights at the regular program rate.',
        note: 'A themed Signature week on the Backbone Trail, six nights, at the regular program rate.',
      },
      {
        date: '2027-05-30',
        name: 'Backbone Trail Week',
        desc: 'A second themed week on the Backbone Trail, six nights at the regular program rate.',
        note: 'A themed Signature week on the Backbone Trail, six nights, at the regular program rate.',
      },
    ],
    hudson: [
      {
        date: '2026-09-17',
        name: 'Special Program — Guest Practitioner Week',
        desc: 'A visiting practitioner leads three nights of the regular Hudson Valley program, September 17–20, 2026.',
        note: 'UNVERIFIED — placeholder content standing in for the wireframe\'s "guest Influencer Namehere" text. Real name, dates and copy needed from the client before this ships; see docs/PRODUCTION-NOTES.md.',
        unverified: true,
      },
    ],
  };

  /* ---------- The Ranch Private ----------
     A third, always-available programme choice alongside the property's
     own standard programme and any dated retreat (ProgramChoice.jsx) —
     unlike `retreats` above, this isn't tied to specific dates or a
     single property; it's offered on every stay, at every property,
     capped at `maxGuests` total guests across the party (ProgramChoice
     greys the card out and explains why once the party exceeds it,
     rather than hiding the option). */
  var ranchPrivate = {
    name: 'The Ranch Private',
    desc: 'The Ranch Private is a way for guests to enjoy a more customized experience for guests who may not want the fully communal aspects of our traditional program. You may want a private hike, classes or meals, or may prefer to experience a different schedule to our main cohort of guests.',
    maxGuests: 4,
  };

  /* ---------- Fees & policies ----------
     Client feedback pass (8 Sep 2026): itemised into the real receipt
     lines the booking engine charges, not the earlier "Service charge &
     taxes" combined line the client found confusing next to the fee
     modal's separate "20% service fee" copy (FeeModal.jsx now quotes the
     same 20% "Service charge" line this breakdown does — no more two
     numbers for one thing). Every rate is expressed as a percentage of
     the pre-tax subtotal, derived from the dollar figures on
     docs/content/CONTENT-SOURCE.md section 4's worked examples, rounded
     to two decimals:

     Malibu — $1,550/night example, $334.03 "Service Charge & Taxes" +
     $33.57 "Preservation Fee & Taxes": service charge is a flat 20%
     ($310.00); the remaining $24.03 is tax *on* that service charge,
     24.03/1550 = 1.55%; preservation fee & taxes 33.57/1550 = 2.17%.
     20 + 1.55 + 2.17 = 23.72 → allInMultiplier 1.2372 (was rounded to
     1.24 — now the exact sum of the lines shown, not a rounder number
     the lines were tuned to hit).

     Hudson — $1,675/night example, $363.06 "Service Charge & Taxes" +
     $34.56 "Preservation Fee" + $13.40 "Occupancy Tax" + $7.01 "Food &
     Beverage Sales Tax" + $14.03 "Room Sales Tax": service charge 20%
     ($335.00); tax on the service charge (363.06-335.00)/1675 = 1.68%;
     preservation fee 34.56/1675 = 2.06%; occupancy tax 13.40/1675 =
     0.80%; room sales tax 14.03/1675 = 0.84%; food & beverage sales tax
     7.01/1675 = 0.42%. Sum 20 + 1.68 + 2.06 + 0.80 + 0.84 + 0.42 = 25.80
     → allInMultiplier 1.258 (unchanged from before — this one already
     rounded to the exact sum, Malibu didn't).

     `label`s intentionally never say "service fee" — the client's
     confusion was exactly that clash between the modal's "20% service
     fee" copy and the rail's "Service charge & taxes 21.55%" line; both
     now read "service charge" and show the identical breakdown. */
  var fees = {
    malibu: {
      allInMultiplier: 1.2372,
      breakdown: [
        { label: 'Service charge', rate: 0.20 },
        { label: 'Tax on service charge', rate: 0.0155 },
        { label: 'Preservation fee and taxes', rate: 0.0217 },
      ],
    },
    hudson: {
      allInMultiplier: 1.258,
      breakdown: [
        { label: 'Service charge', rate: 0.20 },
        { label: 'Tax on service charge', rate: 0.0168 },
        { label: 'Preservation fee', rate: 0.0206 },
        { label: 'Occupancy tax', rate: 0.008 },
        { label: 'Room sales tax', rate: 0.0084 },
        { label: 'Food & beverage sales tax', rate: 0.0042 },
      ],
    },
    depositRate: 0.25,
    balanceDueDays: 40,
  };

  var phone = '888.777.2177';
  var phoneAlt = '310.457.8700';

  return {
    properties: properties,
    propertyList: propertyList,
    roomsFor: roomsFor,
    roomById: roomById,
    galleryFor: galleryFor,
    fromPrice: fromPrice,
    occupancyRates: occupancyRates,
    upgradeFor: upgradeFor,
    includes: includes,
    faqsFor: faqsFor,
    addons: addons,
    addonById: addonById,
    addonsFor: addonsFor,
    retreats: retreats,
    ranchPrivate: ranchPrivate,
    fees: fees,
    phone: phone,
    phoneAlt: phoneAlt,
  };
})();

export default D;
