export const STUN: RTCIceServer[] = [
  { urls: ["stun:stun.l.google.com:19302", "stun:global.stun.twilio.com:3478"] },
];
export function createPeer(): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: STUN });
}
export async function getShareStream(): Promise<MediaStream> {
  // @ts-ignore
  return await (navigator.mediaDevices as any).getDisplayMedia({
    video: { frameRate: 30 },
    audio: true,
  });
}
