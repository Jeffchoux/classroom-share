import { NextRequest, NextResponse } from "next/server";
import { kv } from "@/lib/kv";
export const runtime = "edge";
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { roomId, to, msg } = body; // msg: {type, from, payload}
  if (!roomId || !to || !msg) return NextResponse.json({ ok: false }, { status: 400 });
  const key = `rooms:${roomId}:queue:${to}`;
  await kv.rpush(key, JSON.stringify(msg));
  await kv.expire(key, 120);
  return NextResponse.json({ ok: true });
}
