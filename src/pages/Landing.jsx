import { useRef, useState } from 'react';
import ReserveDrawer from '../components/drawer/ReserveDrawer.jsx';
import ConfigPanel from '../components/ConfigPanel.jsx';
import HeroNav from '../components/home/HeroNav.jsx';
import PropertyBand from '../components/home/PropertyBand.jsx';
import { Footer, Toast } from '../components/Chrome.jsx';
import usePageTitle from '../usePageTitle.js';
import { asset } from '../utils.js';

/* A seamless noise tile, generated with feTurbulence rather than an
   external asset — self-documenting and reproducible without a generator
   script to keep next to it. Sits at very low opacity over the gradient
   ground so the hero reads as photographic rather than flat. */
const GRAIN =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E" +
  "%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E" +
  "%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E";

/* ============================================================
   Landing — entry to the booking engine
   ------------------------------------------------------------
   docs/figma/wires/00-home.png (node 62301:3797), 1440×810: full-bleed
   dark hero, nav row, bottom-centre eyebrow + h1, play/pause control.
   The hero ground is now the real Malibu footage (public/media/hero-
   malibu.mp4 + poster) with the dark gradient + grain kept underneath as
   the fallback if the video fails to load. `prefers-reduced-motion`
   guests never get autoplay — they see the poster frame and the
   play/pause control still works as a manual trigger. See
   docs/PRODUCTION-NOTES.md for the unmeasured LCP cost of an 18MB hero.
   ============================================================ */
export default function Landing() {
  usePageTitle(null);
  const [drawer, setDrawer] = useState(false);
  const [drawerProperty, setDrawerProperty] = useState(null);
  /* Autoplay only when motion is welcome; reduced-motion guests land on
     the still poster frame and press play themselves. */
  const [playing, setPlaying] = useState(
    () => typeof window !== 'undefined' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
  const videoRef = useRef(null);

  function openDrawer(propertyId) {
    setDrawerProperty(propertyId || null);
    setDrawer(true);
  }

  function togglePlay() {
    const v = videoRef.current;
    if (v) {
      if (playing) v.pause();
      else v.play().catch(() => {}); /* autoplay can still be blocked by the browser — fails harmlessly */
    }
    setPlaying((p) => !p);
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-page">
      <header className="absolute inset-x-0 top-0 z-20">
        <HeroNav onBookNow={() => openDrawer(null)} />
      </header>

      {/* The hero (including the page's one h1) previously sat between the
          absolute header and <main>, outside any landmark — a screen-reader
          user jumping by landmark would land on PropertyBand and never
          reach the h1 or the hero copy at all. <main> now wraps both, and
          carries id="main-content" for the skip link + tabIndex so focus
          actually lands here rather than merely scrolling to it. */}
      <main id="main-content" tabIndex={-1} className="outline-none">
        <section className="relative flex min-h-svh flex-col justify-end overflow-hidden bg-dark">
          <div aria-hidden="true" className="absolute inset-0">
            <div className="h-full w-full bg-gradient-to-b from-charcoal-500 via-dark to-charcoal-950" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay"
              style={{ backgroundImage: 'url("' + GRAIN + '")' }}
            />
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover"
              poster={asset('media/hero-malibu-poster.jpg')}
              preload="metadata"
              muted
              autoPlay={playing}
              loop
              playsInline
              aria-hidden="true"
            >
              <source src={asset('media/hero-malibu.mp4')} type="video/mp4" />
            </video>
            {/* Even wash so the nav reads over whatever the frame is doing at
                the top, plus the stronger bottom gradient the headline needs.
                Pixel-sampled against this clip's poster frame: the nav row
                sits over a blown-out window highlight where "Book now"
                (#f2ebdf on this frame) measured as low as ~4.85:1 — just
                over the 4.5:1 floor with almost no margin, and the video
                loops through brighter moments than the one frame that can
                be sampled statically (see docs/ACCESSIBILITY-AUDIT.md,
                "text over photography has no ratio, only one per frame").
                A dedicated top gradient gives that specific band a second,
                stronger pass without darkening the mid-frame photography. */}
            <div className="absolute inset-0 bg-dark/20" />
            <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-charcoal-950/55 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950/75 via-transparent to-transparent" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-[19px] px-5 pb-24 text-center md:pb-20">
            <span className="eyebrow max-w-[510px] text-page">
              Award-Winning Retreats in Malibu and Hudson Valley
            </span>
            <h1 className="h-serif max-w-[510px] text-h3 text-white">A Return to What Matters</h1>
          </div>

          <button
            type="button"
            onClick={togglePlay}
            aria-pressed={playing}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="absolute bottom-5 right-5 z-10 grid h-8 w-8 place-items-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:outline-offset-2"
          >
            <img src={asset('icons/pause.svg')} alt="" aria-hidden="true" className="h-8 w-8" />
          </button>
        </section>

        <PropertyBand onBook={openDrawer} />
      </main>

      <Footer />
      {/* Keeps the footer clear of the fixed bar on a phone. */}
      <div aria-hidden="true" className="h-[52px] md:hidden" />

      {/* Phone only: the Figma "button set" — a full-width dark bar fixed
          to the foot of the screen, Inter Bold 14 / 1.68 tracking, since the
          nav's Book now is hidden at this size. */}
      <div className="fixed inset-x-0 bottom-0 z-[900] md:hidden">
        <button
          type="button"
          onClick={() => openDrawer(null)}
          className="flex w-full items-center justify-center bg-dark px-6 py-4 text-[14px] font-bold uppercase leading-[1.2] tracking-[1.68px] text-btn-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-focus focus-visible:-outline-offset-4"
        >
          Book now
        </button>
      </div>

      <ReserveDrawer
        open={drawer}
        onClose={() => setDrawer(false)}
        presetProperty={drawerProperty}
      />
      <ConfigPanel />
      <Toast />
    </div>
  );
}
