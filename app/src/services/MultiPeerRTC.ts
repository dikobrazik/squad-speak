import { addToast } from "@heroui/toast";
import { getTurnServers } from "../api";

type UserId = string;

export interface SignalMessage {
  from: UserId;
  to: UserId;
  type: "offer" | "answer" | "ice-candidate";
  data: any;
}

export interface MultiPeerRTCOptions {
  userId: string;
  onRemoteStream?: (userId: UserId, stream: MediaStream) => void;
  onPeerConnected?: (userId: UserId) => void;
  onPeerDisconnected?: (userId: UserId) => void;
  sendSignal: (msg: SignalMessage) => void;
}

export class MultiPeerRTC {
  private peers = new Map<UserId, RTCPeerConnection>();
  public localStream?: MediaStream;

  private iceServers: RTCIceServer[] = [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    { urls: "stun:stun.stunprotocol.org:3478" },
    { urls: "stun:stunserver2024.stunprotocol.org:3478" },
  ];

  constructor(private options: MultiPeerRTCOptions) {
    getTurnServers().then((response) => {
      this.iceServers.push(...response.iceServers);
    });
  }

  /* ---------- Local media ---------- */

  async setLocalStream(stream: MediaStream) {
    this.localStream = stream;

    for (const pc of this.peers.values()) {
      stream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }
  }

  /* ---------- Peer management ---------- */

  private createPeer(userId: UserId): RTCPeerConnection {
    if (this.peers.has(userId)) {
      return this.peers.get(userId)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
    });

    this.peers.set(userId, pc);

    console.log(this.localStream);
    // local tracks
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        console.log("local track", track, this.localStream);
        pc.addTrack(track, this.localStream!);
      });
    }

    pc.onicecandidate = ({ candidate }) => {
      console.log("onicecandidate", userId, candidate);
      if (candidate) {
        this.options.sendSignal({
          to: userId,
          from: this.options.userId,
          type: "ice-candidate",
          data: candidate,
        });
      }
    };

    pc.getStats().then((stats) => {
      stats.entries().forEach((stat) => {
        console.log("Initial stat for", userId, stat);
      });
    });

    pc.ontrack = ({ track, streams }) => {
      console.log("ontrack", userId, track, streams);
      track.onunmute = () => {
        console.log("track onunmute", userId, track, streams);
        this.options.onRemoteStream?.(userId, streams[0]);
      };
    };

    pc.onconnectionstatechange = () => {
      console.log("onconnectionstatechange", userId, pc.connectionState);
      if (pc.connectionState === "connected") {
        this.options.onPeerConnected?.(userId);
      }
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.closePeer(userId);
      }
    };

    return pc;
  }

  /* ---------- Offer / Answer ---------- */

  async createOffer(userId: UserId) {
    const pc = this.createPeer(userId);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    this.options.sendSignal({
      from: this.options.userId,
      to: userId,
      type: "offer",
      data: offer,
    });
  }

  async handleOffer(userId: UserId, description: RTCSessionDescriptionInit) {
    const pc = this.createPeer(userId);

    if (
      pc.signalingState !== "stable" &&
      pc.signalingState !== "have-remote-offer"
    ) {
      console.warn(
        "Signaling state is not stable, ignoring offer",
        pc.signalingState,
      );
      return;
    }
    console.log("Handling offer from", userId);

    await pc.setRemoteDescription(description);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    console.log("Sending answer to", userId);

    this.options.sendSignal({
      from: this.options.userId,
      to: userId,
      type: "answer",
      data: answer,
    });
  }

  async handleAnswer(userId: UserId, description: RTCSessionDescriptionInit) {
    console.log("Handling answer from", userId);
    const pc = this.peers.get(userId);
    if (!pc) return;

    console.log("Current signaling state:", pc.signalingState);

    if (pc.signalingState === "have-local-offer") {
      await pc.setRemoteDescription(description);
    } else {
      console.warn("Wrong signaling state for answer", pc.signalingState);
      addToast({
        title: `Wrong signaling state for answer, ${pc.signalingState}`,
        color: "danger",
      });
    }
  }

  /* ---------- ICE ---------- */

  async handleIce(userId: UserId, candidate: RTCIceCandidateInit) {
    const pc = this.peers.get(userId);
    if (!pc) return;

    console.log("Adding ICE candidate from", userId, candidate);

    await pc.addIceCandidate(candidate);
  }

  /* ---------- Cleanup ---------- */

  closePeer(userId: UserId) {
    console.log("Closing peer", userId);
    const pc = this.peers.get(userId);
    if (!pc) return;

    pc.close();
    this.peers.delete(userId);

    this.options.onPeerDisconnected?.(userId);
  }

  closeAll() {
    for (const userId of this.peers.keys()) {
      this.closePeer(userId);
    }
  }
}
