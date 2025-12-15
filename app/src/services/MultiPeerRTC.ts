import { toast } from "react-toastify";
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
  iceServers?: RTCIceServer[];
  onRemoteStream?: (userId: UserId, stream: MediaStream) => void;
  onPeerConnected?: (userId: UserId) => void;
  onPeerDisconnected?: (userId: UserId) => void;
  sendSignal: (msg: SignalMessage) => void;
}

export class MultiPeerRTC {
  private peers = new Map<UserId, RTCPeerConnection>();
  private localStream?: MediaStream;

  constructor(private options: MultiPeerRTCOptions) {
    this.options.iceServers = [{ urls: ["stun:stun.cloudflare.com:3478"] }];

    getTurnServers().then((response) => {
      this.options.iceServers = response.iceServers;
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
      iceServers: this.options.iceServers,
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
      toast(`Wrong signaling state for answer, ${pc.signalingState}`, {
        type: "error",
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
