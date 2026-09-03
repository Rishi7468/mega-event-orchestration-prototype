import type { HTMLAttributes } from "react";

type Tone = "surface" | "accent";

// Tailwind utility precedence follows generated CSS order, not className
// string order — so a caller's `bg-accent` in `className` can't reliably
// beat this component's own `bg-surface`. A `tone` prop picks one of two
// non-conflicting class sets instead of letting them fight.
const toneClasses: Record<Tone, string> = {
  surface: "border border-border bg-surface text-foreground",
  accent: "border-none bg-accent text-accent-foreground",
};

type CardProps = HTMLAttributes<HTMLDivElement> & {
  tone?: Tone;
};

export function Card({ tone = "surface", className = "", ...props }: CardProps) {
  return <div className={`rounded-2xl ${toneClasses[tone]} ${className}`} {...props} />;
}
