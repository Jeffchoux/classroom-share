"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Monitor, Users, Share2, Video, StopCircle } from "lucide-react";
import { createPeer, getShareStream } from "@/lib/webrtc";

type Role = "teacher" | "student";
type Peer = { id: string; pc: RTCPeerConnection; stream?: MediaStream };
type Msg = { type: "offer" | "answer" | "candidate" | "ping"; from: string; to?: string; payload?: any };

export default function Page() {
  const [roomId, setRoomId] = useState<string>("family");
  const [name, setName] = useState<string>("");
  const [role, setRole] = useState<Role>("student");
  const [joined, setJoined] = useState(false);
  const [sharing, setSharing] = useState(false);
  const selfId = useMemo(() => uuid(), []);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [peers, setPeers] = useState<Record<string, Peer>>({});
  const localStreamRef = useRef<MediaStream | null>(null);

  const push = async (to: string, msg: Msg) => {
    await fetch("/api/push", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ roomId, to, msg }) });
  };
  const poll = async (): Promise<Msg[]> => (await fetch(`/api/poll?roomId=${roomId}&self=${selfId}`)).json();
  const listPeers = async (): Promise<string[]> => (await fetch(`/api/peers?roomId=${roomId}`)).json();
  const announce = async () => { await fetch(`/api/peers`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ roomId, peerId: selfId }) }); };

  useEffect(() => { if (!joined) return; announce(); const i = setInterval(announce, 30000); return () => clearInterval(i); }, [joined]);

  useEffect(() => {
    if (!joined) return;
    let alive = true;
    const loop = async () => {
      while (alive) {
        const msgs = await poll();
        for (const m of msgs) {
          if (m.type === "offer") {
            const from = m.from;
            const pc = peers[from]?.pc || createPeer();
            pc.onicecandidate = (e) => { if (e.candidate) push(from, { type: "candidate", from: selfId, payload: e.candidate.toJSON() }); };
            pc.ontrack = (ev) => { const stream = ev.streams[0]; setPeers((prev) => ({ ...prev, [from]: { id: from, pc, stream } })); };
            await pc.setRemoteDescription(new RTCSessionDescription(m.payload));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            await push(from, { type: "answer", from: selfId, payload: answer });
            setPeers((prev) => ({ ...prev, [from]: { id: from, pc } }));
          } else if (m.type === "answer") {
            const from = m.from; const pc = peers[from]?.pc; if (!pc) continue;
            await pc.setRemoteDescription(new RTCSessionDescription(m.payload));
          } else if (m.type === "candidate") {
            const from = m.from; const pc = peers[from]?.pc; if (!pc) continue;
            try { await pc.addIceCandidate(new RTCIceCandidate(m.payload)); } catch {}
          }
        }
        await new Promise((r) => setTimeout(r, 400));
      }
    };
    loop();
    return () => { alive = false; };
  }, [joined, peers]);

  const handleJoin = async () => { setJoined(true); };
  const startShare = async () => {
    const stream = await getShareStream();
    localStreamRef.current = stream;
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      localVideoRef.current.muted = true;
      await localVideoRef.current.play().catch(() => {});
    }
    setSharing(true);
  };
  const stopShare = () => {
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    setSharing(false);
  };
  const callPeer = async (toPeerId: string) => {
    console.log('Calling peer:', toPeerId);
    if (!localStreamRef.current) {
      console.error('No local stream available');
      return;
    }
    const pc = createPeer();
    localStreamRef.current.getTracks().forEach((t) => pc.addTrack(t, localStreamRef.current!));
    pc.onicecandidate = (e) => { if (e.candidate) push(toPeerId, { type: "candidate", from: selfId, payload: e.candidate.toJSON() }); };
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    console.log('Sending offer to peer:', toPeerId);
    await push(toPeerId, { type: "offer", from: selfId, payload: offer });
    setPeers((prev) => ({ ...prev, [toPeerId]: { id: toPeerId, pc } }));
  };
  const connectAllViewers = async () => {
    try {
      console.log('Connecting all viewers...');
      const others = (await listPeers()).filter((id) => id !== selfId);
      console.log('Found peers:', others);
      if (others.length === 0) {
        console.log('No other peers to connect to');
        return;
      }
      await Promise.all(others.map((id) => callPeer(id)));
      console.log('Connected to all viewers successfully');
    } catch (error) {
      console.error('Error connecting to viewers:', error);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl p-6">
        <header className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3"><Monitor className="h-6 w-6" /><h1 className="text-xl font-semibold">ClassroomShare</h1></div>
          <div className="text-sm text-neutral-600">Same Wi‑Fi • WebRTC • No install • No Firebase</div>
        </header>
        {!joined ? (
          <Card>
            <CardHeader><h2 className="text-lg font-medium">Créer / Rejoindre une salle</h2></CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div><label className="mb-1 block text-sm">Room ID</label><Input value={roomId} onChange={(e) => setRoomId(e.target.value)} placeholder="ex: family" /></div>
                <div><label className="mb-1 block text-sm">Votre nom (optionnel)</label><Input value={name} onChange={(e) => setName(e.target.value)} placeholder="ex: Alice" /></div>
                <div><label className="mb-1 block text-sm">Rôle</label><div className="flex gap-2"><Button variant={role === "teacher" ? "default" : "outline"} onClick={() => setRole("teacher")}>Prof</Button><Button variant={role === "student" ? "default" : "outline"} onClick={() => setRole("student")}>Élève</Button></div></div>
              </div>
              <div className="mt-4"><Button onClick={handleJoin} className="w-full md:w-auto">Rejoindre</Button></div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader><div className="flex items-center gap-2"><Users className="h-5 w-5" /><h3 className="text-base font-semibold">Votre écran</h3></div></CardHeader>
              <CardContent>
                <video ref={localVideoRef} className="aspect-video w-full rounded-xl bg-black" playsInline muted />
                <div className="mt-3 flex flex-wrap gap-2">{!sharing ? (<Button onClick={startShare}><Share2 className="mr-2 h-4 w-4"/>Partager mon écran</Button>) : (<Button variant="outline" onClick={stopShare}><StopCircle className="mr-2 h-4 w-4"/>Arrêter</Button>)}</div>
                <p className="mt-2 text-sm text-neutral-600">Conseil: utilisez Chrome/Edge pour la capture d'écran + audio.</p>
                {role === "teacher" && (<div className="mt-3"><Button onClick={connectAllViewers} disabled={!sharing}><Video className="mr-2 h-4 w-4"/>Connecter tous les spectateurs</Button></div>)}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><h3 className="text-base font-semibold">Lien de la salle</h3></CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700">Envoyez ce lien (WhatsApp, etc.). Tout le monde rejoint la même <strong>Room ID</strong>.</p>
                <div className="mt-3 rounded-xl border bg-neutral-100 p-3 text-sm">{typeof window !== 'undefined' ? window.location.origin : ""}/?room={roomId}</div>
              </CardContent>
            </Card>
            <div className="md:col-span-3">
              <Card>
                <CardHeader><h3 className="text-base font-semibold">Flux reçus</h3></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.values(peers).map((p) => (
                      <div key={p.id} className="rounded-xl border p-2">
                        <video className="aspect-video w-full rounded-lg bg-black" playsInline autoPlay muted={false} ref={(el) => { if (el && p.stream) { (el as HTMLVideoElement).srcObject = p.stream; (el as HTMLVideoElement).play().catch(() => {}); } }} />
                        <div className="mt-1 break-all text-xs text-neutral-600">Peer: {p.id}</div>
                      </div>
                    ))}
                    {Object.values(peers).length === 0 && (<div className="text-sm text-neutral-600">Aucun flux pour l’instant. Quand un autre utilisateur partage, il apparaîtra ici.</div>)}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
