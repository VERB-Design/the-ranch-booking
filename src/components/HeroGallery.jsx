/* Full-width hero gallery that sits above all page content:
   one tall image on the left, two stacked on the right. */
export default function HeroGallery({ count = 3, onOpen }) {
  const more = Math.max(0, count - 3);
  const cell = 'ph-img relative w-full overflow-hidden';

  return (
    <div className="mt-6 grid gap-2 md:h-[508px] md:grid-cols-2 md:grid-rows-2">
      <button
        type="button"
        aria-label="Open gallery"
        onClick={() => onOpen?.(0)}
        className={cell + ' h-[260px] md:row-span-2 md:h-full'}
      />
      <button
        type="button"
        aria-label="Open gallery photo 2"
        onClick={() => onOpen?.(1)}
        className={cell + ' hidden md:block'}
      />
      <button
        type="button"
        aria-label="Open gallery photo 3"
        onClick={() => onOpen?.(2)}
        className={cell + ' hidden md:block'}
      >
        {more > 0 && (
          <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-[15px] uppercase tracking-[1.5px] text-white">
            + {more} photos
          </span>
        )}
      </button>
    </div>
  );
}
