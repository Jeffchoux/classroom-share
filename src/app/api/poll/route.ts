import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
export const runtime = "edge";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  const self = searchParams.get("self");
  if (!roomId || !self) return NextResponse.json([]);
  const key = `rooms:${roomId}:queue:${self}`;
  const msgs: string[] = [];
  while (true) {
    const item = await kv.lpop<string>(key);
    if (!item) break;
    msgs.push(item);
  }
  return NextResponse.json(msgs.map((s) => JSON.parse(s)));
}
