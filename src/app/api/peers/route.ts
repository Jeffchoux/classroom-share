import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
export const runtime = "edge";
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const roomId = searchParams.get("roomId");
  if (!roomId) return NextResponse.json([]);
  const setKey = `rooms:${roomId}:peers`;
  const ids = await kv.smembers<string[]>(setKey);
  return NextResponse.json(ids);
}
export async function POST(req: NextRequest) {
  const { roomId, peerId } = await req.json();
  if (!roomId || !peerId) return NextResponse.json({ ok: false }, { status: 400 });
  const setKey = `rooms:${roomId}:peers`;
  await kv.sadd(setKey, peerId);
  await kv.expire(setKey, 3600);
  await kv.set(`rooms:${roomId}:present:${peerId}`, "1", { ex: 60 });
  return NextResponse.json({ ok: true });
}
