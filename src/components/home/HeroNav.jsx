import MenuButton from '../SiteMenu.jsx';
import TextCta from './TextCta.jsx';

/* ============================================================
   HeroNav
   ------------------------------------------------------------
   The home hero's nav row from docs/figma/wires/00-home.png: MENU button
   left, wordmark centred (absolutely, so it stays centred regardless of
   how wide MENU/Book now render), Book now text-CTA right. Renders just
   the <nav> — Landing wraps it in the page's one real <header> landmark
   rather than nesting a second header inside the hero <section>. The
   booking Header in Chrome.jsx follows the same row so the two read as
   one site.
   ============================================================ */
export default function HeroNav({ onBookNow }) {
  return (
    <nav className="relative mx-auto flex w-full max-w-[1440px] items-center justify-between px-5 py-6 md:px-10 md:pt-[51px] xl:px-[103px]">
      <MenuButton tone="light" />
      <img
        src="/brand/the-ranch-nav-white.svg"
        alt="The Ranch"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[22px] w-[184px] -translate-x-1/2 -translate-y-1/2 md:h-[30px] md:w-[250px]"
      />

      <TextCta className="text-off-white-700" onClick={onBookNow}>
        Book now
      </TextCta>
    </nav>
  );
}
