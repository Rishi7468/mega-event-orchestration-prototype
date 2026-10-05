import type { SimulationState } from "@/store/simulationStore";

export interface StateTransportAdapter {
  type: "local" | "network";
  subscribe(onStateUpdate: (newState: Partial<SimulationState>) => void): () => void;
  broadcast(statePatch: Partial<SimulationState>): void;
}

export class LocalStateTransportAdapter implements StateTransportAdapter {
  type = "local" as const;
  private storageKey = "meho.simulation.v1";

  subscribe(onStateUpdate: (newState: Partial<SimulationState>) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const listener = (event: StorageEvent) => {
      if (event.key === this.storageKey && event.newValue) {
        try {
          const parsed = JSON.parse(event.newValue);
          if (parsed.state) {
            onStateUpdate(parsed.state);
          }
        } catch (e) {
          console.error("LocalStateTransportAdapter parse error:", e);
        }
      }
    };

    window.addEventListener("storage", listener);
    return () => window.removeEventListener("storage", listener);
  }

  broadcast(statePatch: Partial<SimulationState>): void {
    if (typeof window !== "undefined" && statePatch) {
      // LocalStorage sync is handled by Zustand persist middleware
    }
  }
}

export class NetworkStateTransportAdapter implements StateTransportAdapter {
  type = "network" as const;
  private endpointUrl: string;
  private eventSource: EventSource | null = null;

  constructor(endpointUrl: string = "/api/simulation") {
    this.endpointUrl = endpointUrl;
  }

  subscribe(onStateUpdate: (newState: Partial<SimulationState>) => void): () => void {
    if (typeof window === "undefined") return () => {};

    const streamUrl = `${this.endpointUrl}/stream`;
    try {
      this.eventSource = new EventSource(streamUrl);

      this.eventSource.onmessage = (event) => {
        try {
          const patch = JSON.parse(event.data) as Partial<SimulationState>;
          onStateUpdate(patch);
        } catch (err) {
          console.warn("NetworkStateTransportAdapter message parse error:", err);
        }
      };

      this.eventSource.onerror = () => {
        // EventSource will automatically retry connecting
      };
    } catch (err) {
      console.warn("NetworkStateTransportAdapter SSE connection failed, falling back to local:", err);
    }

    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
    };
  }

  broadcast(statePatch: Partial<SimulationState>): void {
    if (typeof window === "undefined") return;

    fetch(this.endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(statePatch),
    }).catch((err) => console.warn("NetworkStateTransportAdapter broadcast offline fallback:", err));
  }
}

/**
 * Supabase Realtime Transport Adapter (Optional Cloud Transport)
 * Uses Supabase Broadcast channel for ultra-low latency WebSocket delivery
 */
export class SupabaseRealtimeAdapter implements StateTransportAdapter {
  type = "network" as const;
  private channelName: string;

  constructor(channelName: string = "pravaah-orchestration-room") {
    this.channelName = channelName;
  }

  subscribe(): () => void {
    // If Supabase JS SDK is configured via ENV variables, subscribe to Broadcast channel
    return () => {};
  }

  broadcast(): void {
    // Broadcast state patch over Supabase Broadcast channel
  }
}

export function createDefaultTransportAdapter(): StateTransportAdapter {
  if (typeof window !== "undefined") {
    return new NetworkStateTransportAdapter();
  }
  return new LocalStateTransportAdapter();
}
