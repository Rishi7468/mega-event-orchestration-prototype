const RESET_KEY = "meho.demo.reset.v1";

type Listener = () => void;
const listeners = new Set<Listener>();

/**
 * A cross-tab "start over" signal.
 *
 * The simulation store already syncs its phase between tabs, but each tab
 * keeps its own visitor plan (that state is personal, not destination-wide,
 * so it is deliberately never persisted). Without this signal, hitting Reset
 * in the organiser tab would leave the visitor tab still mid-journey — the
 * presenter would start the next run from a half-used state.
 *
 * Writing a bumped counter fires a `storage` event in every *other* tab;
 * the writing tab is notified directly, since browsers don't deliver the
 * event to the tab that made the change.
 */
export function subscribeDemoReset(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit(): void {
  for (const listener of listeners) listener();
}

export function broadcastDemoReset(): void {
  try {
    // A counter, not a timestamp — nothing in this prototype reads the clock.
    const current = Number(window.localStorage.getItem(RESET_KEY) ?? "0");
    window.localStorage.setItem(RESET_KEY, String(current + 1));
  } catch {
    // Non-fatal: other tabs simply won't hear it, this one still resets.
  }
  emit();
}

if (typeof window !== "undefined") {
  window.addEventListener("storage", (event) => {
    if (event.key === RESET_KEY) emit();
  });
}
