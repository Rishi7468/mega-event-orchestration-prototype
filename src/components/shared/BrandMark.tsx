type BrandMarkProps = {
  /**
   * "full" pairs the wordmark with its descriptor — used wherever there's
   * room for two lines (the operator sidebar). "compact" is the wordmark
   * alone, sized for a tight header (the visitor top bar).
   */
  size?: "full" | "compact";
  className?: string;
};

/**
 * Pravaah's small, static product mark — the identity shown in the shell
 * chrome that surrounds the actual work (the operator sidebar, the visitor
 * top bar), as opposed to the animated hero treatment on the root screen.
 * One component so the name reads the same wherever it appears.
 */
export function BrandMark({ size = "full", className = "" }: BrandMarkProps) {
  if (size === "compact") {
    return (
      <p className={`text-[11px] font-semibold tracking-wide text-foreground-muted ${className}`}>
        Pravaah
      </p>
    );
  }

  return (
    <div className={className}>
      <p className="text-sm font-semibold tracking-tight text-foreground">Pravaah</p>
      <p className="text-[11px] text-foreground-muted">Destination intelligence</p>
    </div>
  );
}
