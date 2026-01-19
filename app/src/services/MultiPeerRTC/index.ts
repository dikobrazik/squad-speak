import type { DataChannel } from "../DataChannel";
import { ICE_SERVERS } from "./constants";

type UserId = string;

export interface SignalMessage {
  from: UserId;
  to: UserId;
  type: "offer" | "answer" | "ice-candidate";
  data: any;
}

export interface MultiPeerRTCOptions {
  dataChannel: DataChannel;
  userId: string;
  onRemoteStream?: (userId: UserId, stream: MediaStream) => void;
  onPeerConnected?: (userId: UserId) => void;
  onPeerDisconnected?: (userId: UserId) => void;
  sendSignal: (msg: SignalMessage) => void;
}

export class MultiPeerRTC {
  private peers = new Map<UserId, RTCPeerConnection>();
  private localStream?: MediaStream;

  private iceServers: RTCIceServer[] = structuredClone(ICE_SERVERS);

  constructor(private options: MultiPeerRTCOptions) {}

  enrichIceServers(servers: RTCIceServer[]) {
    this.iceServers.push(...servers);
  }

  /* ---------- Change media stream ---------- */

  replaceAudioTrack(stream: MediaStream) {
    const newTrack = stream.getAudioTracks()[0];

    if (!newTrack) {
      console.warn("No audio track in the provided stream");
      return;
    }

    this.localStream?.getAudioTracks().forEach((oldTrack) => {
      for (const pc of this.peers.values()) {
        const sender = pc.getSenders().find((s) => s.track === oldTrack);
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      }
      oldTrack.stop();
    });

    this.localStream = stream;
  }

  /* ---------- Local media ---------- */

  setLocalStream(stream: MediaStream) {
    this.localStream = stream;

    for (const pc of this.peers.values()) {
      this.localStream.getAudioTracks().forEach((track) => {
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

    // local tracks
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach((track) => {
        pc.addTrack(track, this.localStream!);
      });
    }

    this.createDataChannel(userId, pc);

    pc.ondatachannel = (e) => {
      this.options.dataChannel.addDataChannel(userId, e.channel);
    };

    pc.onicecandidate = ({ candidate }) => {
      // console.info("onicecandidate", userId, candidate);
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
      track.onunmute = () => {
        this.options.onRemoteStream?.(userId, streams[0]);
      };
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "connected") {
        this.options.onPeerConnected?.(userId);
      }
      if (pc.connectionState === "failed" || pc.connectionState === "closed") {
        this.closePeer(userId);
      }
    };

    pc.onsignalingstatechange = () => {
      if (pc.signalingState === "closed") {
        this.closePeer(userId);
      }
    };

    return pc;
  }

  private createDataChannel(userId: string, pc: RTCPeerConnection) {
    const dc = pc.createDataChannel("chat", {
      ordered: true,
    });

    this.options.dataChannel.addDataChannel(userId, dc);
  }

  /* ---------- Offer / Answer ---------- */

  async createOffer(userId: UserId) {
    const pc = this.createPeer(userId);

    if (pc.signalingState !== "stable") {
      console.warn(
        "Signaling state is not stable, cannot create offer",
        pc.signalingState,
      );
      return;
    }

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
    console.info("Handling offer from", userId);

    await pc.setRemoteDescription(description);

    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);

    console.info("Sending answer to", userId);

    this.options.sendSignal({
      from: this.options.userId,
      to: userId,
      type: "answer",
      data: answer,
    });
  }

  async handleAnswer(userId: UserId, description: RTCSessionDescriptionInit) {
    const pc = this.peers.get(userId);
    if (!pc) return;

    if (pc.signalingState !== "have-local-offer") {
      console.warn("Wrong signaling state for answer", pc.signalingState);
      return;
    }

    console.info("Handling answer from", userId);

    await pc.setRemoteDescription(description);
  }

  /* ---------- ICE ---------- */

  async handleIce(userId: UserId, candidate: RTCIceCandidateInit) {
    const pc = this.peers.get(userId);
    if (!pc) return;

    // console.info("Adding ICE candidate from", userId, candidate);

    await pc.addIceCandidate(candidate);
  }

  /* ---------- Cleanup ---------- */

  closePeer(userId: UserId) {
    const pc = this.peers.get(userId);

    if (!pc) return;

    pc.close();
    this.peers.delete(userId);

    this.options.onPeerDisconnected?.(userId);
  }

  closeAll() {
    this.localStream?.getAudioTracks().forEach((track) => {
      track.stop();
    });

    for (const userId of this.peers.keys()) {
      this.closePeer(userId);
    }
  }
}
