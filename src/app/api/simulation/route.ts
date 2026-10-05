import { NextResponse } from "next/server";
import { broadcastToClients } from "./stream/route";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const patch = await req.json();
    if (!patch || typeof patch !== "object") {
      return NextResponse.json({ error: "Invalid patch format" }, { status: 400 });
    }

    broadcastToClients(patch);
    return NextResponse.json({ success: true, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Simulation broadcast endpoint error:", err);
    return NextResponse.json({ error: "Failed to broadcast simulation state" }, { status: 500 });
  }
}
