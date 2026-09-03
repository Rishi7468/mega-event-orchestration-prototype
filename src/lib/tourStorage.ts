const TOUR_KEY = "meho.tour.seen.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * Tiny observable around the first-run flag so components can read it with
 * `useSyncExternalStore` — the SSR-safe way to consume browser-only state
 * without a hydration mismatch or a setState-inside-effect.
 *
 * Storage access is wrapped because it throws outright in some contexts
 * (private windows, blocked site data). A failure must never stop the app
 * rendering, so we fail toward "already seen" and simply skip the tour.
 */
export function subscribeTourSeen(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getTourSeenSnapshot(): boolean {
  try {
    return window.localStorage.getItem(TOUR_KEY) === "1";
  } catch {
    return true;
  }
}

/** During SSR the tour is always treated as seen, so it never renders on the server. */
export function getTourSeenServerSnapshot(): boolean {
  return true;
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function markTourSeen(): void {
  try {
    window.localStorage.setItem(TOUR_KEY, "1");
  } catch {
    // Non-fatal: the tour simply shows again next time.
  }
  emit();
}

export function clearTourSeen(): void {
  try {
    window.localStorage.removeItem(TOUR_KEY);
  } catch {
    // Non-fatal.
  }
  emit();
}
