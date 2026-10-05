export const dynamic = "force-dynamic";

type SendFn = (data: string) => void;
const clients = new Set<SendFn>();

let serverRevision = 0;

export function broadcastToClients(payload: unknown) {
  serverRevision++;
  const enrichedPayload =
    payload && typeof payload === "object"
      ? { ...payload, _revision: serverRevision, _timestamp: Date.now() }
      : payload;

  const message = `data: ${JSON.stringify(enrichedPayload)}\n\n`;
  for (const clientSend of clients) {
    try {
      clientSend(message);
    } catch {
      clients.delete(clientSend);
    }
  }
}

export async function GET() {
  let clientSend: SendFn | null = null;
  let heartbeatTimer: NodeJS.Timeout | null = null;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      clientSend = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          if (clientSend) clients.delete(clientSend);
        }
      };

      clients.add(clientSend);

      // 1. Initial connection acknowledgement
      controller.enqueue(encoder.encode(`: sse connected (rev ${serverRevision})\n\n`));

      // 2. Periodic SSE heartbeat every 15 seconds to prevent network proxies/browsers from timing out
      heartbeatTimer = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(": heartbeat\n\n"));
        } catch {
          if (heartbeatTimer) clearInterval(heartbeatTimer);
          if (clientSend) clients.delete(clientSend);
        }
      }, 15000);
    },
    cancel() {
      if (heartbeatTimer) clearInterval(heartbeatTimer);
      if (clientSend) clients.delete(clientSend);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
