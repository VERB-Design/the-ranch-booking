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
      desc: 'The original Ranch, twenty-one private cottages in the Santa Monica Mountains less than an hour from Los Angeles. A regenerative organic garden, ocean air, and the six-, seven- or eight-night signature programme.',
      guestCount: 'up to 25 guests',
      cottages: 21,
      /* Named for the "Choose your program" tray/inline chooser (Sep 2026
         pass) — the standard programme's own card, alongside whatever
         dated retreat falls inside the guest's stay. */
      programName: 'The Signature Programme',
      programDesc: 'The standard Ranch programme — six, seven or eight nights of daily hikes, spa treatments and meals built around the property’s own organic garden.',
      stayRules: {
        checkInDays: ['Saturday', 'Sunday'],
        lengths: [6, 7, 8],
        shorterStays: false, /* "Introducing Shorter Days" — 3-night Thu→Sun, 4-night Sun→Thu — exists only on /locations/malibu; the FAQ, /locations summary and programs page all still describe Malibu as 6-night minimum, so this ships off by default. Flip to true once the client confirms it's a standing product, not a limited-time page. Verified off: a Sunday check-in returns exactly two checkouts (6n Sat, 7n Sun), matching the task's own worked dates. */
        preNightRate: 1275, /* per person — the Saturday pre-night before a Sunday check-in */
        extensionType: 'pre',
        extensionLabel: 'Add an extra night before your stay',
        blocksCopy: 'Stays run in blocks of 6, 7 or 8 nights. Guests checking in Sunday can add a Saturday pre-night before the programme begins.',
        arrival: '12:00 pm (noon)',
        departure: '10:00 am',
      },
      resortFee: 0,
      cancelDays: 40,
      cancelCopy: 'If you cancel outside 41 days from your stay, a 10% fee will apply. Within 40 days of your stay, all payments are non-refundable and non-cancellable.',
      depositCopy: 'A credit card is required for booking, as a deposit of 25% of total will be charged upon booking. The balance will be charged 40 days prior to arrival. If booking within 40 days of arrival, the full amount, inclusive of tax and fees, will be charged.',
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
      desc: 'A stone manor on a historic lakefront estate an hour from New York City, bordered by more than 46,000 acres of protected parkland. Twenty-six guest rooms, a 5,000-square-foot solarium, and three-, four- or seven-night stays.',
      guestCount: 'averages 25 guests',
      rooms: 26,
      programName: 'The Hudson Valley Programme',
      programDesc: 'The standard Hudson Valley programme — three, four or seven nights of guided hikes, spa treatments and seasonal meals inside the stone manor and its grounds.',
      stayRules: {
        checkInDays: ['Thursday', 'Sunday'],
        lengths: [3, 4, 7],
        shorterStays: false,
        extensionType: 'post', /* one extra night, Friday, after a Thursday check-out */
        extensionLabel: 'Add an extra night (Fri)',
        blocksCopy: 'Stays run in blocks of 3, 4 or 7 nights. Guests can add an extra night to stays ending on Thursdays.',
        arrival: '1:00 pm',
        departure: '10:00 am',
      },
      resortFee: 0,
      cancelDays: 40,
      cancelCopy: 'If you cancel outside 41 days from your stay, a 10% fee will apply. Within 40 days of your stay, all payments are non-refundable and non-cancellable.',
      depositCopy: 'A credit card is required for booking, as a deposit of 25% of total will be charged upon booking. The balance will be charged 40 days prior to arrival. If booking within 40 days of arrival, the full amount, inclusive of tax and fees, will be charged.',
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
      detail: 'Queen bed · Up to 290 sq ft · Courtyard view',
      desc: 'A charming space for your time with us — a courtyard view, a queen bed and a bathroom with a shower. A peaceful retreat following the active day.',
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
      detail: 'Queen or King · Up to 415 sq ft · Courtyard or trail view',
      desc: 'A bit more spacious, with a king or queen bed and views of the courtyard or trail. Some offer both a shower and a separate bathtub.',
      images: [img('hudson/hudson-deluxe-01.jpg', 'Deluxe room: king bed, armchair and leather bench at the window')],
      rate: 1825,
    },
    {
      id: 'hudson-deluxe-double',
      property: 'hudson',
      name: 'Deluxe Double Room',
      bed: 'Two queen beds or one shared king',
      sqft: 560,
      view: 'Lake or courtyard view',
      floor: '2nd or 3rd floor',
      maxOccupants: 3,
      amenities: ['Lake views', 'Walk-in shower', 'Marble vanity'],
      detail: 'Two queens or shared king · Up to 560 sq ft · Lake or courtyard view',
      desc: 'More space for those who want separate beds or a shared king. Two-queen rooms look over the lake and grounds; king rooms may include a separate shower and bathtub with courtyard views.',
      images: [img('hudson/hudson-deluxe-double-01.jpg', 'Deluxe Double: two queen beds under a dormer window')],
      rate: 2025,
      unverified: true,
      rateNote: 'Not returned by the booking engine for the sampled window. Extrapolated by interpolating between Deluxe ($1,825, 415 sq ft) and Junior Suite ($2,125, 635 sq ft) at this room’s 560 sq ft — confirm with client.',
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
      detail: 'King bed · Up to 635 sq ft · Lake or courtyard view',
      desc: 'A spacious room with a king bed, a seating area and a shower; some also offer a double vanity. Views of the lake and surrounding mountains, or the courtyard.',
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
      detail: 'Two queens · Up to 635 sq ft · Lake or courtyard view',
      desc: 'A light-filled respite with two queen beds, courtyard views and a bathroom with a separate bathtub.',
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
      view: 'Lake or mountain views',
      floor: '2nd floor',
      maxOccupants: 2,
      amenities: ['Double vanity', 'Separate bathtub and shower', 'Sitting room just outside'],
      detail: 'King bed · 650 sq ft · Lake or mountain views',
      desc: 'Abundant with natural light on the second floor, with views of the lake and surrounding mountains. A spacious bathroom with double vanity, separate bathtub and shower, and a sitting room just outside.',
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
      view: 'Front courtyard and lawn views',
      floor: '1st floor',
      maxOccupants: 2,
      amenities: ['Private entrance option', 'Walk-in closet / dressing room', 'Double vanity, separate bathtub and shower'],
      detail: 'King bed · 750 sq ft · Courtyard and lawn views',
      desc: 'Private and secluded on the first floor, with the option of a separate entrance. Original wood panelling honours the historic building; a walk-in dressing room and a spacious bathroom with double vanity, separate bathtub and shower.',
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
     The site's own longer list, wire's four items first (spa/dining/
     hike/transfer) then the extras it actually publishes. {airport} is
     filled in by the component with the guest's own property. */
  var includes = [
    { icon: 'spa', title: 'Daily massage', desc: 'A 50-minute deep tissue massage for each full day of the programme.' },
    { icon: 'dining', title: 'All meals and snacks', desc: 'Plant-forward, nutritionally dense meals and snacks, plus morning organic coffee and a daily tea bar.' },
    { icon: 'hike', title: 'Daily hikes, fitness and yoga', desc: 'Daily guided hikes, an afternoon fitness class, and a restorative yoga or meditation class.' },
    { icon: 'transfer', title: 'Return airport transfer', desc: 'Departure transfer to {airport} at 10 am. Arrival is on your own.' },
    { icon: 'amenities', title: 'Pool, sauna and cold plunge', desc: 'Heated pool, jacuzzi, infrared sauna and cold plunge; weekly sound bath.' },
    { icon: 'laundry', title: 'Daily laundry service', desc: 'Personal laundry, washed and folded, available daily.' },
    { icon: 'bodpod', title: 'Bod Pod analysis', desc: 'Body composition analysis, plus a cooking demonstration and evening nutrition talks.' },
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
        a: 'The programme rate covers ' + naturalJoin(includesList) + ', for every night of your stay.',
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
      desc: 'One-on-one physical therapy with the Ranch team, worked around the rest of your programme.',
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
        desc: 'A one-night collaboration with Erewhon opens the standard Malibu programme, October 10, 2026.',
        note: 'A one-night retreat with Erewhon at The Ranch Malibu, October 10, 2026. Booking continues into the standard multi-night programme from this date — the one-night format itself isn’t modelled in this prototype.',
      },
      {
        date: '2027-03-21',
        name: 'Backbone Trail Week',
        desc: 'A themed Signature week on the Backbone Trail, six nights at the regular programme rate.',
        note: 'A themed Signature week on the Backbone Trail, six nights, at the regular programme rate.',
      },
      {
        date: '2027-05-30',
        name: 'Backbone Trail Week',
        desc: 'A second themed week on the Backbone Trail, six nights at the regular programme rate.',
        note: 'A themed Signature week on the Backbone Trail, six nights, at the regular programme rate.',
      },
    ],
    hudson: [
      {
        date: '2026-09-17',
        name: 'Special Program — Guest Practitioner Week',
        desc: 'A visiting practitioner leads three nights of the regular Hudson Valley programme, September 17–20, 2026.',
        note: 'UNVERIFIED — placeholder content standing in for the wireframe\'s "guest Influencer Namehere" text. Real name, dates and copy needed from the client before this ships; see docs/PRODUCTION-NOTES.md.',
        unverified: true,
      },
    ],
  };

  /* ---------- Fees & policies ----------
     Replaces the old flat 11.8% with the booking engine's own line
     items, expressed as an all-in multiplier per property with a
     breakdown for the fee modal. Malibu: 20% service charge (itself
     taxed) + preservation fee & taxes. Hudson: service charge & taxes +
     preservation fee + occupancy/room/F&B taxes. See
     docs/content/CONTENT-SOURCE.md section 4 for the line-item source. */
  var fees = {
    malibu: {
      allInMultiplier: 1.24,
      breakdown: [
        { label: 'Service charge & taxes', rate: 0.2155 },
        { label: 'Preservation fee & taxes', rate: 0.0245 },
      ],
    },
    hudson: {
      allInMultiplier: 1.26,
      breakdown: [
        { label: 'Service charge & taxes', rate: 0.2168 },
        { label: 'Preservation fee & taxes', rate: 0.0432 },
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
    upgradeFor: upgradeFor,
    includes: includes,
    faqsFor: faqsFor,
    addons: addons,
    addonById: addonById,
    addonsFor: addonsFor,
    retreats: retreats,
    fees: fees,
    phone: phone,
    phoneAlt: phoneAlt,
  };
})();

export default D;
