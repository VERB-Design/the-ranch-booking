# The Ranch — Content Source

Crawled 2 September 2026 at the client's request. ~60 sequential requests against
`theranchlife.com` (server-rendered Kentico site — sitemap, home, both location pages, programs,
FAQ, terms, contact, modalities, Tata Harper, Private, 2-night reset, booking landing pages) and the
booking engine it embeds, `newbooking.azds.com` (AZDS, Synxis-backed), whose public `rooms` and
`rates` endpoints return the live room catalogue and live nightly pricing.

Every fact below carries its source. Quotes are verbatim. Where the site does not state something
the prototype needs, it says **NOT ON SITE**. Machine-readable version: `ranch-content.json`.

Legend: **CONFIRMS** / **CONTRADICTS** / **NOT ON SITE** — against the prototype assumptions in
`src/data.js`.

---

## 1. Properties

### The Ranch Malibu
- **Location:** "12220 Cotharin Road, Malibu, CA 90265" — https://www.theranchlife.com/contact-us. CONFIRMS "Malibu, California".
- **Setting:** "Less than an hour from Los Angeles, The Ranch Malibu is nestled amidst the scenic Santa Monica Mountains and perched on rugged coastline." — https://www.theranchlife.com/locations
- **Scale:** "21 private guest cottages" · "The Barn, our 3,000 sq. foot gym" · "Heated outdoor pool and jacuzzi" · "Cold plunge" · "Infrared Sauna" · "Massage Village" · "Regenerative-certified organic garden and outdoor garden cafe" · "Distraction-free space (no TVs) and limited Wi-Fi available exclusively in guests' private cottage" — https://www.theranchlife.com/locations/malibu
- **Group size:** "intentionally limited to just 25 guests" — https://www.theranchlife.com/locations/malibu
- **Transfer airport — LAX. CONFIRMS.** "Return airport transfer to LAX on Saturday or Sunday morning at 10 am" — https://www.theranchlife.com/locations/malibu. FAQ: "Guests will come on their own to The Ranch Malibu on the day of their arrival. The program begins at noon and at the conclusion of the program, we depart The Ranch at 10:00 am and take guests to LAX by 11:30 am. If you plan to use our shuttle service to LAX, we recommend you book a flight that departs at 1:00 pm or later." — https://www.theranchlife.com/faq. Private jets: "Camarillo Airport (CMA) is the closest private airport." — FAQ.
- **Prototype's "working ranch above the Pacific — hikes by day, a shared table by night"** — written; the site's own line is "This is where transformation science meets California luxury". Needs sign-off either way.

### The Ranch Hudson Valley
- **Location:** "150 Sisters Servants Lane, Sloatsburg, NY 10974" — https://www.theranchlife.com/contact-us. CONFIRMS "Sloatsburg, New York".
- **Setting:** "Set on a historic lakefront estate adjacent to over 46,000 acres of protected parkland" · "Located just one hour from New York City and three major airports" — https://www.theranchlife.com/locations/hudson-valley. **CONTRADICTS** the prototype's "Forty acres an hour from Manhattan" — no acreage for the estate itself is published; the 46,000 acres is the adjacent parkland, and hikes are in "the 4,000-acre Ringwood State Park".
- **Scale:** "26 beautifully appointed private guest rooms" · "2,000-square foot former ballroom reimagined as The Ranch Gym" · "5,000-square foot solarium featuring a year-round heated pool, infrared sauna, and hot and cold contrast plunge pools" · "Distraction-free space (no TVs)" — https://www.theranchlife.com/locations/hudson-valley
- **Group size:** "Averages 25 guests per session" (https://www.theranchlife.com/locations); "up to 30 guests in each program" (FAQ).
- **Transfer airport — EWR. CONFIRMS.** "Return transfer to Newark (EWR) on departure day at 10 am" — https://www.theranchlife.com/locations/hudson-valley. FAQ: "Guests arrive to The Ranch Hudson Valley on their own on arrival day. The program begins at 1:00pm. At the conclusion of the program, we will depart at 10:00am and transport guests to Newark Liberty Airport (EWR) for arrival before 11:30am." Note the site is inconsistent on the day: FAQ says "on Sunday or Thursday at 10am"; the programs page says "on Monday or Thursday at 10 am" (https://www.theranchlife.com/programs/hudson-valley/programs) — the Monday is almost certainly a typo. Car service: "our preferred car service, KLS by calling 332-233-7788"; helicopter via BLADE "can land directly on our lawn" — FAQ.
- **Prototype's "barns, trails, and a slower clock"** — written; the estate is a stone manor with a ballroom gym and a solarium, not barns. Rewrite against the photography.

---

## 2. Stay lengths and check-in days

### Malibu
- **Signature: 6, 7 or 8 nights. CONTRADICTS the prototype's 3 / 4 / 7.** "intimate groups of guests follow our signature 6, 7, or 8 - night program" — https://www.theranchlife.com/locations/malibu. "The Ranch Malibu (6, 7, or 8 nights) · The Ranch Multi-Week (13 nights or more) · The Ranch Private (6, 7, or 8 nights) · The Ranch Private Multi-Week (13 nights or more)" — https://www.theranchlife.com/locations. FAQ: "Stays at The Ranch are at least a week. The program is offered 52 weeks a year for 6-, 7-, and 8-night programs along with multiweek stays."
- **NEW short stays: 3 and 4 nights.** "Introducing Shorter Days — The Ranch Malibu introduces a new way to reset—our Signature experience, now reimagined for shorter stays. Discover a thoughtfully curated 3- and 4-night retreat … 4-Night Sunday–Thursday | 3-Night Thursday–Sunday" — https://www.theranchlife.com/locations/malibu. This is only on the Malibu location page; the FAQ, /locations summary and programs page still describe Malibu as 6-night minimum. **Partially CONFIRMS the prototype's 3/4-night shape, but as a new secondary product, not the core.**
- **Check-in days: Saturday or Sunday. CONTRADICTS the prototype's Sunday/Thursday.** "In Malibu, weeklong programs begin on Saturday or Sunday depending on your length of stay." — FAQ. "The Ranch Malibu encourages guests arriving on Saturday to stay at The Ranch the night prior to the program commencement on Sunday … This overnight stay includes check-in at noon (unless you have already begun your stay), elective wellness programming, meals and a weekend massage." — FAQ. The booking engine confirms the mechanics: a Sat 3 Oct → Sat 10 Oct 2026 search prices Saturday at $1,275 and Sunday–Friday at $1,550 each.
- **Extra night:** the prototype's "extra night ending Thursday" is NOT ON SITE. The real extension model is the Saturday pre-night (above) and the 8-night variant. The programme "concludes" with a Saturday or Sunday 10 am departure.

### Hudson Valley
- **3, 4 or 7 nights. CONFIRMS the prototype exactly.** "complete reset in just 3, 4 or 7 - night stays" — https://www.theranchlife.com/locations/hudson-valley. FAQ: "Guests can choose between 3-night (Thursday- Sunday), 4-night (Sunday- Thursday) or 7-night (starting Thursday or Sunday) retreats." "Offered for stay lengths of 3, 4 7+ nights" — location page WHAT'S INCLUDED.
- **Check-in days: Thursday and Sunday. CONFIRMS.** "The perfect reset, our 3-night programs begin on Thursdays and conclude Sundays. 4 night begin Sundays and conclude Thursdays." · "Commit to your health with our 7- night stay, Sundays to Sundays or Thursdays to Thursdays." — https://www.theranchlife.com/locations/hudson-valley
- **Same-day rule (both):** "Because our programs are meant to be done as a group experience, we ask that all guests arrive and depart on the same day." — FAQ.
- A **2-night** format has been run as a special (Aug 7–9, "2-Night Wellness Reset with The Ranch & Private Medical", https://www.theranchlife.com/2-night-reset-hudson-valley) — not a standing product.

### Check-in / check-out times — CONTRADICTS the prototype's 4:00 PM / 11:00 AM
- Malibu: programme "begins at noon"; departure "10:00 am" — FAQ.
- Hudson: "The program begins at 1:00pm"; "we will depart at 10:00am" — FAQ.

---

## 3. Rooms

### Malibu — three published cottage types (the prototype's five named rooms are NOT ON SITE)
Source: https://www.theranchlife.com/locations/malibu "Accommodations" + booking engine https://newbooking.azds.com/api/hotel/ranch-malibu/rooms

| Site name | Engine name (code) | Bed | Sq ft | View | Max occ. |
|---|---|---|---|---|---|
| Queen Cottage | Guest Cottage, 1 Queen Bed (R1Q) | Queen | NOT ON SITE | NOT ON SITE | 1 |
| King Cottage | Guest Cottage, 1 King Bed (R1K) | "California King" | NOT ON SITE | NOT ON SITE ("some also include a porch") | 2 |
| Double Queen Cottage | Guest Cottage, 2 Queen Beds (R2Q) | Two queens | NOT ON SITE ("Our most spacious option") | NOT ON SITE ("some also including private outdoor space") | 2 |
| — | Guest Cottage with 1 Queen Bed or 1 King Bed (P1K) | Queen or King | NOT ON SITE | NOT ON SITE | 2 — this is the room the engine sells for **The Ranch Private** |

- Queen Cottage: "Guests traveling alone or coming with a friend or loved one and desiring separate rooms will be staying in a Private Guest cottage with one queen bed. These charming cottages include a desk should you need to attend to any business during your stay and the bathroom features premium amenities including Jolie filtered showerheads, paraben-free shampoo and conditioner, and our signature Ranch soap."
- King Cottage: "Couples or those sharing a bed with a loved one stay in our King Cottages. Featuring a California King bed, some also include a porch. All cottages offer a desk … Jolie filtered showerheads, paraben-free shampoo and conditioner, and our signature Ranch soap."
- Double Queen Cottage: "Our most spacious option, with some also including private outdoor space, guests who wish to share a room but prefer seperate beds will enjoy our Double Queen Cottages. These rooms offer two queen beds, a desk, and bathroom featuring premium amenities…"
- FAQ description of all cottages: "You will stay in your own private guest cottage beautifully decorated with reclaimed wood floors, limestone bathrooms, and linen-covered queen or king-size bed (king beds are reserved for couples), air conditioning and premium amenities including wi-fi service. Rooms with two queen beds are also available."
- Engine amenity list (all cottages): "Queen Bed / King Bed / 2 Queen Beds", "Morning Coffee & Daily Tea Bar", "Custom Linens", "Housekeeping & Daily Laundry", "Pool", "Wifi", "Daily Fitness Classes", "Shower (Featuring Jolie showerhead)".
- **Prototype's Casita King / Garden View / Ocean View / Ranch House Suite / Founder's Cottage — NOT ON SITE.** No ocean-view or mountain-view room tiers, no soaking tubs, balconies, fireplaces or outdoor showers are published for Malibu.

### Hudson Valley — "four categories" on the site, seven sub-types listed with sizes
Source: https://www.theranchlife.com/locations/hudson-valley "Accommodations" (verbatim spec lines) + https://newbooking.azds.com/api/hotel/ranch-hudson-valley/rooms

| Site name | Engine name (code) | Bed | Sq ft | View | Bath | Floor |
|---|---|---|---|---|---|---|
| Petite Deluxe | Petite Deluxe Guest Room, 1 Queen Bed (S1Q) | "Queen Bed" | "Up to 290 Square Feet" | "Courtyard View" | "Shower" | "2nd Floor" |
| Deluxe | Deluxe Guest Room, 1 King or 1 Queen Bed (R1Q) | "Queen or King Bed" | "Up to 415 Square Feet" | "Courtyard or Trail View" | "Shower or Shower & Separate Bathtub" | "2nd or 3rd Floor" |
| Deluxe Double | Deluxe Guest Room, 2 Queen Beds (R2Q) | "2 Queen Beds or 1 Shared King" | "Up to 560 Square Feet" | "Lake or Courtyard View" | "Shower or Shower & Separate Bathtub" | "2nd or 3rd Floor" |
| Junior Suite | Junior Suite, 1 King Bed (J1K) | "King Bed" | "Up to 635 Square Feet" | "Lake or Courtyard View" | "Shower or Shower & Separate Bathtub", "Single or Double Vanity" | "2nd or 3rd Floor" |
| Junior Suite Two Queen | Junior Suite, 2 Queen Beds (J2Q) | "2 Queen Beds" | "Up to 635 Square Feet" | "Lake or Courtyard View" | "Shower & Separate Bathtub or Shower" | "2nd or 3rd Floor" |
| Premier Junior Suite – Morgan | Premier Junior Suite - Morgan, 1 King Bed (PJSM) | "King Bed" | "650 Square Feet" | "Lake or Mountain Views" | "Shower and Separate Bathtub", "Double Vanity" | "2nd Floor" |
| Premier Junior Suite – Hamilton | Premier Junior Suite - Hamilton, 1 King Bed (PJSH) | "King Bed" | "750 Square Feet" | "Front Courtyard and Lawn Views" | "Shower and Separate Bathtub", "Double Vanity" | "1st Floor" |

The engine also lists a "Guest House, One Queen Bed" (GH1Q) with no copy or images — likely an overflow/staff unit; ignore.

- Petite Deluxe: "Our Petite Deluxe Rooms offer guests a charming space for their time with us. With a lovely courtyard view, queen bed, and bathroom featuring a shower, these rooms provide a peaceful retreat following the active day."
- Deluxe: "Our Deluxe Rooms are a bit more spacious with king or queen beds. Some offer both a shower and a separate bathtub and all feature views of the courtyard or trail."
- Deluxe Double: "Our Deluxe Double rooms offer more space for those desiring separate beds or a shared king bed. Our rooms with two queen beds feature beautiful views of the lake and surrounding grounds and a shower while rooms with king beds may include both a separate shower and bathtub with courtyard views."
- Junior Suite: "Guests staying in our Junior Suites will enjoy spacious rooms with a king bed, seating area, and shower while some also offer a double vanity. Views of our onsite lake and the surrounding mountains or courtyard immerse guest in our natural surroundings."
- Junior Suite Two Queen: "Our two queen room offers a light-filled respite with views of the courtyard and a bathroom with a separate bathtub."
- Premier Junior Suite – Morgan: "abundant with natural light. Perched on the second floor, this room offers breathtaking views of our lake and surrounding mountains. The spacious bathroom features a double vanity and a separate bathtub and shower. There is also a sitting room just outside."
- Premier Junior Suite – Hamilton: "This suite is private and secluded, situated on the first floor with the option of a separate entrance to and from the estate. The room is uniquely designed, honoring the historic details of the building, and features the original wood paneling for a warm and inviting feel. A walk-in closet/dressing room and a spacious bathroom includes a double vanity and a separate bathtub and shower."
- FAQ, all rooms: "Staying in one of 26 beautifully appointed private rooms, guests have the choice of four room types along with the option for double occupancy rooms with two queen beds or a shared king bed … Blending custom upholstered and antique furnishings, each room has the feel of staying in a luxurious guest room with lake, landscaped courtyard and/or mountain views. Bathrooms feature single or double vanities, and separate showers with some including a bathtub."
- Engine amenity list: "Morning Coffee & Daily Tea Bar", "Custom Linens", "Daily Fitness Classes", "Housekeeping & Daily Laundry", "Separate Shower & Soaking Tub" (Deluxe, J2Q, both Premiers) or "Shower (Featuring Jolie Showerhead)", "Wifi", "Indoor & Outdoor Pool".
- **Prototype's Farmhouse Room / Meadow View / Barn Suite / Hilltop Cottage — NOT ON SITE.** Hudson Valley is a single stone manor; there are no cottages, barns, porches, fireplaces or wood-burning stoves published.

---

## 4. Rates

**No rate is printed on theranchlife.com itself.** The only on-page number is a past special: "Fully inclusive program rates starting from $1325/night single occupancy, or $985/night per person double occupancy, excluding service charge/taxes" — https://www.theranchlife.com/2-night-reset-hudson-valley (Aug 7–9, Private Medical reset).

The booking engine does return live nightly rates. These are per person, single occupancy, before the service charge, preservation fee and taxes, and they will move with season and availability — treat them as "what it cost on 2 Sep 2026 for one October window", not a rate card.

### Malibu — sample: Sat 3 Oct → Sat 10 Oct 2026, 1 adult
Source: https://newbooking.azds.com/api/hotel/ranch-malibu/rates?from=10/03/2026&to=10/10/2026&adults=1&rooms=1

| Rate | Room | Sat pre-night | Sun–Fri per night | 7-night base | Total with taxes & fees | Deposit due |
|---|---|---|---|---|---|---|
| RI7NPRS "The Ranch Signature Program" | R1Q Guest Cottage 1 Queen | $1,275 | **$1,550** | $10,575 | $13,082.97 | $3,270.74 |
| RI7NPRS "The Ranch Signature Program" | P1K Guest Cottage Queen or King | $1,275 | $1,550 | $10,575 | $13,082.97 | $3,270.74 |
| RP7NPRS "The Ranch Private" | R1Q | $1,775 | **$2,050** | $14,075 | $17,413.03 | $4,353.26 |
| RP7NPRS "The Ranch Private" | P1K | $1,775 | $2,050 | $14,075 | $17,413.03 | $4,353.26 |

- R1K (King) and R2Q (Double Queen) were not returned for a 1-adult search — NOT VERIFIED. Since the rate is per person and R1Q = P1K, the king and double-queen per-person rate is very likely the same $1,550; confirm.
- **CONTRADICTS the prototype's Malibu $1,150–$1,650 spread across five rooms** — there is one programme rate per programme (Signature vs Private), not per cottage.
- Malibu 3-/4-night "Shorter Days" rates: NOT ON SITE and not sampled (a Sun 4 Oct → Sun 11 Oct search returned no rates, i.e. no Sunday-start 7-night product).

### Hudson Valley — sample: Thu 8 Oct → Sun 11 Oct 2026 (3 nights), 1 adult
Source: https://newbooking.azds.com/api/hotel/ranch-hudson-valley/rates?from=10/08/2026&to=10/11/2026&adults=1&rooms=1

| Rate | Room | Per night | 3-night base | Total with taxes & fees | Deposit due |
|---|---|---|---|---|---|
| RI3N "The Ranch 3-Night Signature Program" | S1Q Petite Deluxe | **$1,675** | $5,025 | $6,321.18 | $1,580.30 |
| RI3N | R1Q Deluxe (1 King or 1 Queen) | **$1,825** | $5,475 | $6,887.25 | $1,721.81 |
| RI3N | J1K Junior Suite King | **$2,125** | $6,375 | $8,019.42 | $2,004.86 |
| RI3N | PJSH Premier Junior Suite – Hamilton | **$2,525** | $7,575 | $9,528.93 | $2,382.23 |

- R2Q, J2Q and PJSM not returned for this search — NOT VERIFIED.
- **CONTRADICTS the prototype's Hudson $950–$1,450** — the real floor is $1,675 and Hudson is *more* per night than Malibu, not less (shorter stay, higher nightly).
- **CONFIRMS** the prototype's shape of one nightly programme rate per room with a ~$150–$400 step between tiers.

### Taxes and fees (from the engine's line items — replaces the prototype's flat 11.8%)
Hudson, Petite Deluxe, $1,675/night: "Service Charge & Taxes" $363.06 (21.68% — a 20% service charge, itself taxed) · "Preservation Fee" $34.56 (2.06%) · "Occupancy Tax" $13.40 · "Food & Beverage Sales Tax" $7.01 · "Room Sales Tax" $14.03. All-in multiplier **1.258×** base.
Malibu, $1,550/night: "Service Charge & Taxes" $334.03 (21.55%) · "Preservation Fee & Taxes" $33.57 (2.17%). All-in multiplier **1.237×** base.
Site copy: "There is a service charge, including taxes, on all reservations" — https://www.theranchlife.com/programs/hudson-valley/programs.

**Service-charge percentage is inconsistent on the site:** FAQ deposit answer says "a 18% service charge"; FAQ gratuity answer says "the 20% service fee"; the engine charges 20%. Client to confirm.

---

## 5. Every Stay Includes

Prototype's four lines vs site — **CONFIRMS in substance, but the site's list is longer and more specific.**

Malibu WHAT'S INCLUDED — https://www.theranchlife.com/locations/malibu (verbatim list):
"Private accommodations for each guest · Daily guided hikes and afternoon fitness class · Daily yoga or meditation class · Daily massage for each full day · Plant-forward and nutritionally dense meals and snacks designed to nourish & detoxify · Bod Pod body composition analysis · Evening elective nutrition and wellness discussions · Cooking demonstration and garden tour · Access to amenities including infrared sauna, outdoor heated pool, jacuzzi and cold plunges · Personal laundry, washed & folded, available daily · Return airport transfer to LAX on Saturday or Sunday morning at 10 am"

Hudson WHAT'S INCLUDED — https://www.theranchlife.com/locations/hudson-valley (verbatim list):
"Offered for stay lengths of 3, 4 7+ nights · Private accommodations · Daily guided hikes and afternoon fitness class · Daily yoga or meditation class · Daily massage for each full day of your stay · Plant-forward and nutritionally dense meals and snacks designed to nourish & detoxify · Evening elective mindfulness and wellness discussions · Cooking demonstrations · Access to amenities including a 5,000 square foot solarium with a year round heated pool, infrared sauna, and hot and cold plunge · Personal laundry, washed & folded, available daily · Return transfer to Newark (EWR) on departure day at 10 am"

Detail on the massage: "Each full day in the program includes a 50-minute deep tissue massage." — https://www.theranchlife.com/wellbeing/modalities. **Note "each full day"** — a 3-night stay has two full days, so two massages, not three; the prototype's "One treatment a day, chosen from the spa menu on arrival" is CONTRADICTED (it is a set deep-tissue massage, not a menu choice).
Beverages: the site says "meals and snacks"; the engine package adds "Morning organic coffee and daily tea bar". The prototype's "non-alcoholic beverages throughout" is not stated.
Also included per modalities page: "Heated Pools", "Cold Plunge", "Jacuzzi", "Infrared Sauna", "Sound Bath" (weekly; "60-minute sound baths" in Malibu).

---

## 6. Add-ons ("Elective services")

Priced on site (https://www.theranchlife.com/tata-harper-facials):
- "Balance & Brighten … 50 Min/$300 100 Min/$475" — both properties ("Reserve as part of your stay at either Malibu or Hudson Valley.")
- "Botanical Sculpt … 50 Min/$300 100 Min/$475" — both properties
- "The Honey Cocoon Body Wrap (100 minutes, $500)" — Hudson Valley only
- "The Radiant Renewal Body Ritual (100 minutes, $500)" — Hudson Valley only

Listed, **no price, no times** (https://www.theranchlife.com/wellbeing/modalities "Elective Healing Modalities"; https://www.theranchlife.com/locations/malibu and /locations/hudson-valley "Elective services"):
- Malibu list: "IV Therapy · Colon Hydrotherapy · Double Massage · Chiropractic Treatment · Acupuncture + Cupping · Energy Healing · Reiki"
- Hudson list: "Facials · Energy Therapy · Reiki · Colon Hydrotherapy · Private Fitness & Yoga Classes · Acupuncture · Physical Therapy · Hypnotherapy · Double Massage · Bod Pod body composition analysis · Subject to Availability."
- Modalities descriptions: "Additional Massage: Extend your daily massage to 100 minutes"; "Private Fitness & Yoga: Customized workouts and yoga sessions"; "IV Therapy … NAD+, Detox, Immunity, Lipotropic Fat Burning and Recovery"; Acupuncture, Chiropractic, Cupping, Reiki, Energy Healing, Hypnotherapy, Colon Hydrotherapy.

Against the prototype's eight:
- Custom Facial $75 — **CONTRADICTED**: real facials are Tata Harper, $300 / $475.
- Deep-Tissue Massage $150 / 80 min — **CONTRADICTED**: the included daily massage is already deep tissue; the upsell is "Double Massage" (to 100 min), price NOT ON SITE.
- Private Yoga $200 — exists as "Private Fitness & Yoga"; price NOT ON SITE.
- Nutrition Consult (free) — not a bookable item; "Evening elective nutrition and wellness discussions" are included.
- Cold Plunge (free) — **included amenity**, not an add-on.
- Equine Session — **NOT ON SITE.**
- Surf Lesson — **NOT ON SITE.**
- Sound Bath $40 — **included** ("Weekly sound bath").
- Booking times for any add-on — NOT ON SITE.

---

## 7. Retreats / special weeks

- "Join Erewhon and The Ranch for an exclusive one-night retreat at The Ranch Malibu October 10, 2026." — https://www.theranchlife.com/ (banner; detail page /erewhonretreat2026 not fetched)
- Backbone Trail weeks, Malibu: "March 21 - 27, 2027 · May 30 - June 5, 2027" — https://www.theranchlife.com/locations/malibu
- "The Ranch Culinary Residency — The Ranch's executive chefs will trade coasts for a limited three-week residency" — https://www.theranchlife.com/theexperience/programs (dates on /chefexchange2026, not fetched)
- Hudson: "In the Winter, we offer exclusive programming to celebrate the season … Winter Wellness Program" — FAQ, no dates.
- Past: "2-Night Wellness Reset with The Ranch & Private Medical", "August 7–9" — https://www.theranchlife.com/2-night-reset-hudson-valley
- **Prototype's "Women's Retreat", "Founders Week", "Fall Reset Retreat" — NOT ON SITE.**

---

## 8. Policies

**Deposit — CONTRADICTS the prototype's "one night's programme rate".** Two versions on the client's own properties:
- FAQ (https://www.theranchlife.com/faq): "All reservations require a $2,000.00 deposit per person. The remaining balance, including a 18% service charge and all associated taxes, will be billed to the credit card on file, 40 days prior to your arrival."
- Booking engine (`guaranteePolicy`, both properties): "A credit card is required for booking, as a deposit of 25% of total will be charged upon booking. The balance will be charged 40 days prior to arrival. If booking within 40 days of arrival, the full amount, inclusive of tax and fees, will be charged."

**Cancellation — CONTRADICTS the prototype's "14 days, full refund".**
- Engine (`cancellationText`): "If you cancel outside 41 days from your stay, a 10% fee will apply. Within 40 days of your stay, all payments are non-refundable and non-cancellable."
- FAQ: "If you cancel more than 40 days prior to your stay, a 10% cancellation fee will apply. You may choose to apply your deposit toward a future stay within 18 months of your original cancellation date. Within 40 days of your stay, all payments are non-refundable and the reservation is non-cancellable. We strongly recommend that guests purchase travel insurance to protect against unforeseen circumstances that may require cancellation . For coverage options, we suggest Allianz Travel, or you may contact your insurance provider for details."

**Gratuity:** "While 22% of the 20% service fee is shared with our team, guests are welcome to provide additional gratuity for outstanding service." — FAQ.
**Couples:** "Couples are welcome and can choose to share a room or have private accommodations." — FAQ.
**Minors / site terms:** the Terms of Use (https://www.theranchlife.com/terms-conditions) are website terms only — no booking T&Cs are published there. Note its "Restriction on Use of Materials" clause for the photography licence warning.

---

## 9. Contact

- **Phone — CONTRADICTS the prototype's +1 555 555-5555.** "P: 888.777.2177 or 310.457.8700" — both properties, https://www.theranchlife.com/contact-us. Terms page DMCA block: "(310) 457-8700".
- Reservations email exists ("Reservations and Guest Relations E: …") but every address is Cloudflare-obfuscated in the markup — NOT RECOVERABLE without JS. Ask the client.

---

## 10. Brand copy worth lifting (verbatim, for the landing/confirmation screens)

- "This is life, well lived." — home
- "Mindful Moments, Meaningful Changes" — home hero
- "A retreat is a journey. A return. Not a pause from your life, but a path back to it." — https://www.theranchlife.com/theexperience
- "What begins at The Ranch doesn't end here. When you come back to balance, you come back to yourself." — same
- Pillars: "Simplicity · Connection · Movement · Nourishment · Nature" — https://www.theranchlife.com/theexperience/theranchlife
- Awards (home carousel): TIME World's Greatest Places 2025 (Hudson Valley); Vogue 100 Best Spas Worldwide 2024 (Hudson Valley); Architectural Digest Hotel Great Design Awards 2024 (Hudson Valley); The Goop List 2024 (Malibu); Men's Health Travel Awards 2024 (Hudson Valley).
- Daily schedule (Malibu): "Guest Wake-Up · Morning Stretches · Breakfast · Hiking · Lunch · Fitness Class, Restorative Yoga · Deep Tissue Massage · Free Time · Dinner · Bed Time" — https://www.theranchlife.com/theexperience/programs. Private page gives times: "6:00am – Awaken with Tibetan chimes … 4:00pm – Restorative massage … 6:00pm – Private dinner or 7:00pm group dinner".

---

## Pages fetched
sitemap.xml · / · /locations · /locations/malibu · /locations/hudson-valley · /theexperience · /theexperience/theranchlife · /theexperience/programs · /theexperience/privates · /programs/hudson-valley/programs · /wellbeing/modalities · /tata-harper-facials · /2-night-reset-hudson-valley · /faq · /terms-conditions · /contact-us · /book-malibu · /book-hudson-valley (the last two are empty shells that load the AZDS widget) · newbooking.azds.com `rooms` and `rates` for both hotels.
Not fetched (budget): /erewhonretreat2026, /chefexchange2026, /backbonetrail, /theexperience/buyout, /corporateretreats, /wellbeing/food, /gift-card, newsletters.
