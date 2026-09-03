# The Ranch — Photography manifest

Scraped 2 Sep 2026 from theranchlife.com and its AZDS booking engine (CloudFront-hosted room
photography) at the client's request, for the booking-engine prototype only. Processed with
`sips -Z 1600` (longest edge 1600px) and `sips -s formatOptions 80` (JPEG q80). Nothing under 800px
wide was kept. 17 images: 8 Malibu, 9 Hudson Valley. Alt text is the site's own where it had one;
otherwise written from the frame (marked †).

Licence: see docs/PRODUCTION-NOTES.md → Licensing. theranchlife.com's Terms of Use reserve all
image rights ("Except for non-commercial individual private use, the downloading, retransmission,
or reproduction of the Site … is strictly prohibited") — the client asked for the crawl, but usage
on a separate booking domain still needs written confirmation.

## Malibu — `public/img/malibu/`

| File | Size | Alt | Source |
|---|---|---|---|
| malibu-queen-cottage-01.jpg | 1600×1600 | Queen bed in a Malibu guest cottage, white linen, reclaimed wood floor † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a8efe8492f2d812698648.jpg (engine: Guest Cottage, 1 Queen Bed, image 1) |
| malibu-queen-cottage-02.jpg | 1600×1065 | Guest cottage exterior and gravel path under a live oak † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a8efe84a3e36215576247.jpg (engine: Guest Cottage, 1 Queen Bed, image 3) |
| malibu-king-cottage-01.jpg | 1065×1600 (portrait) | Cottage entrance framed by garden planting † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a8efe8a30b01873403268.jpg (engine: Guest Cottage, 1 King Bed, image 2). **No king-bed interior kept:** the engine's King Cottage image 1 (…6a8efe8a3e501090734932.jpg) is byte-identical to the Queen Cottage's lead photo, and image 3 is 796px wide. Ask the client for a true king-bed frame. |
| malibu-double-queen-cottage-01.jpg | 1600×1064 | Two queen beds in a Malibu guest cottage, doors open to the garden † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a8efe8fbe1e6489023211.jpg (engine: Guest Cottage, 2 Queen Beds, image 1) |
| malibu-private-cottage-01.jpg | 1600×1066 | Queen bed in a Malibu guest cottage, morning light † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a8efe955d34f757897627.jpeg (engine: Guest Cottage with 1 Queen Bed or 1 King Bed, image 1) |
| malibu-cottage-exterior.jpg | 1600×1219 | "Cottage door" (site alt) — cottage doorway with "Basil" name plate | https://www.theranchlife.com/images/content/roomsaltrowimagetwo/malibucottage6.jpg |
| malibu-hero-poster.jpg | 1600×900 | Aerial of The Ranch Malibu in the Santa Monica Mountains, coastal fog beyond † | https://www.theranchlife.com/images/content/videos/250630-malibu.jpg (hero video poster, /locations/malibu) |
| malibu-ranch-house-exterior.jpg | 1600×708 | "The Ranch Malibu exterior" (site alt) — white board-and-batten ranch house, agave and oak | https://www.theranchlife.com/images/hero/partial/_mg_6088-edit-2-1-.jpg |

## Hudson Valley — `public/img/hudson/`

| File | Size | Alt | Source |
|---|---|---|---|
| hudson-petite-deluxe-01.jpg | 1600×1198 | Petite Deluxe room: queen bed, writing desk, courtyard window † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf6e6bac1098946335.jpg (engine: Petite Deluxe Guest Room, 1 Queen Bed, image 1) |
| hudson-deluxe-01.jpg | 1600×1199 | Deluxe room: king bed, armchair and leather bench at the window † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf61283a5195086336.jpg (engine: Deluxe Guest Room, 1 King or 1 Queen Bed, image 1) |
| hudson-deluxe-double-01.jpg | 1600×1199 | Deluxe Double: two queen beds under a dormer window † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf68cec47508635249.jpg (engine: Deluxe Guest Room, 2 Queen Beds, image 1) |
| hudson-junior-suite-01.jpg | 1600×1199 | Junior Suite: king bed, panelled walls, seating area † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf7484222151779410.jpg (engine: Junior Suite, 1 King Bed, image 1) |
| hudson-junior-suite-two-queen-01.jpg | 1600×1199 | Junior Suite Two Queen: two queen beds, desk and courtyard windows † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf7bd2555712657317.jpg (engine: Junior Suite, 2 Queen Beds, image 1) |
| hudson-premier-junior-suite-morgan-01.jpg | 1600×1199 | Premier Junior Suite – Morgan: king bed, sitting area, striped rug, lake-side windows † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf8ddd9ff105090880.jpg (engine: Premier Junior Suite - Morgan, image 1) |
| hudson-premier-junior-suite-hamilton-01.jpg | 1600×1199 | Premier Junior Suite – Hamilton: king bed against original oak panelling † | https://d1t1qzzb2zwrre.cloudfront.net/master/room/6a/6a74bf837f310283663389.jpg (engine: Premier Junior Suite - Hamilton, image 1) |
| hudson-hero-poster.jpg | 1600×900 | Front elevation of the Hudson Valley stone manor and gravel drive † | https://www.theranchlife.com/images/content/videos/250625-hero.jpg (hero video poster, /locations/hudson-valley) |
| hudson-backyard-aerial.jpg | 1600×750 | Aerial of the Hudson Valley estate set in forest † | https://www.theranchlife.com/images/content/testimonials/ariel-hvbackyard.jpeg |

## Downloaded but not kept (under 800px wide)
malibu-aerial.jpg 590×440 (/images/content/home/experience/malibu-aerial.jpg) · malibu-pool.jpg 450×434 (/images/content/cardstwo/pool-umbrella.jpg) · hudson-aerial.jpg 590×440 (/images/content/home/experience/hv-aerial.jpg) · hudson-solarium-pool.jpg 450×434 (/images/content/cardstwo/solarium-pool.jpg) · hudson-estate-exterior.jpg 650×500 (/images/content/altrowsliderTwo/L1003242.jpeg) · hudson-stone-building.jpg 600×620 · malibu queen cottage bathroom 796×522 (engine image 2). The site only serves these at card size; larger originals were not exposed.

## Other engine imagery available (not downloaded — budget)
Each engine room has 2–5 images; only the first was pulled. Full URL lists are in the scratchpad JSON (`azds-malibu-rooms.json`, `azds-hudson-rooms.json`) and are reproducible from
`https://newbooking.azds.com/api/hotel/{ranch-malibu|ranch-hudson-valley}/rooms`.
