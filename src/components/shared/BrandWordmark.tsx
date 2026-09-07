const WORD = "Pravaah";

/**
 * The animated hero wordmark for the root screen only — everywhere else uses
 * the static `BrandMark`. Letters reveal left to right and a thin line sweeps
 * in beneath them, meant to read as flow/coordinated movement rather than a
 * generic app-boot animation. Pure CSS (see the `.brand-*` rules in
 * globals.css); it runs once, ends in its final state, and is skipped
 * entirely under `prefers-reduced-motion: reduce`.
 *
 * The letters are individually spanned to stagger the animation, so the
 * visible text is marked `aria-hidden` and the real word is exposed once via
 * `aria-label` on the wrapper — a screen reader gets "Pravaah", not seven
 * separate one-letter announcements.
 */
export function BrandWordmark({ className = "" }: { className?: string }) {
  return (
    <span
      className={`relative inline-block whitespace-nowrap ${className}`}
      aria-label={WORD}
      role="text"
    >
      <span aria-hidden="true">
        {WORD.split("").map((letter, index) => (
          <span
            key={index}
            className="brand-letter inline-block"
            style={{ animationDelay: `${index * 45}ms` }}
          >
            {letter}
          </span>
        ))}
      </span>
      <span
        aria-hidden="true"
        className="brand-underline absolute -bottom-1 left-0 h-[2px] w-full bg-current"
      />
    </span>
  );
}
