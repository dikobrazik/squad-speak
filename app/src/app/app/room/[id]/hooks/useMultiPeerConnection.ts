import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";
import { getTurnServers } from "@/src/api";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { DataChannel } from "@/src/services/DataChannel";
import { deviceSettingsService } from "@/src/services/DeviceSettings";
import { MultiPeerRTC } from "@/src/services/MultiPeerRTC";
import { SoundService } from "@/src/services/SoundService";
import { useMediaStream } from "./useMediaStream";

// FIXME как же мне эта штука не нравится...
export const useMultiPeerConnection = ({
  websocket,
}: {
  websocket: Socket<
    MultiRoomServerToClientEvents,
    MultiRoomClientToServerEvents
  >;
}) => {
  const router = useRouter();
  const { userId } = useAuthContext();
  const dataChannel = useMemo(() => new DataChannel(userId), [userId]);

  const [rtc, setRtc] = useState<MultiPeerRTC | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<
    Map<string, { stream: MediaStream; muted: boolean }>
  >(new Map());

  const mediaStream = useMediaStream();

  useEffect(() => {
    if (!userId) return;

    new SoundService().playJoinSound();

    const rtc = new MultiPeerRTC({
      dataChannel,
      userId,
      onPeerConnected: (userId) => {
        addToast({ title: `User ${userId} connected`, color: "secondary" });
      },
      onPeerDisconnected: (userId) => {
        addToast({ title: `User ${userId} disconnected`, color: "secondary" });
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.delete(userId);
          return newMap;
        });
      },

      sendSignal: (msg) => {
        websocket.emit(msg.type, msg);
      },

      onRemoteStream: (userId, stream) => {
        setRemoteStreams((prev) => {
          const newMap = new Map(prev);
          newMap.set(userId, { stream, muted: false });
          return newMap;
        });
      },
    });

    setRtc(rtc);

    (async () => {
      const defaultStream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId: deviceSettingsService.getAudioInputDevice() || undefined,
        },
      });

      await getTurnServers().then((response) => {
        rtc.enrichIceServers(response.iceServers);
      });

      rtc.setLocalStream(defaultStream);

      websocket.connect();
    })();

    websocket.on("start-call", (userIds) => {
      userIds.forEach((userId) => {
        rtc.createOffer(userId);
      });
    });
    websocket.on("offer", async (msg) => {
      if (msg.to !== userId) return;
      await rtc.handleOffer(msg.from, msg.data);
    });
    websocket.on("answer", async (msg) => {
      if (msg.to !== userId) return;
      await rtc.handleAnswer(msg.from, msg.data);
    });
    websocket.on("ice-candidate", async (msg) => {
      if (msg.to !== userId) return;
      await rtc.handleIce(msg.from, msg.data);
    });
    websocket.on("connected", (msg) => {
      new SoundService().playJoinSound();
      rtc.closePeer(msg.userId);
    });
    websocket.on("disconnected", (msg) => {
      new SoundService().playLeaveSound();
      rtc.closePeer(msg.userId);
    });
    websocket.on("muted", (msg) => {
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        const entry = newMap.get(msg.userId);
        if (entry) {
          newMap.set(msg.userId, { stream: entry.stream, muted: true });
        }
        return newMap;
      });
    });
    websocket.on("unmuted", (msg) => {
      setRemoteStreams((prev) => {
        const newMap = new Map(prev);
        const entry = newMap.get(msg.userId);
        if (entry) {
          newMap.set(msg.userId, { stream: entry.stream, muted: false });
        }
        return newMap;
      });
    });
    websocket.on("invalid-password", () => {
      addToast({ title: `Invalid room password`, color: "danger" });
      router.push("/app/room");
    });

    return () => {
      rtc.closeAll();
      websocket.offAny();
      websocket.disconnect();
      new SoundService().playLeaveSound();
    };
  }, [userId, websocket]);

  useEffect(() => {
    if (rtc && mediaStream) {
      rtc.replaceAudioTrack(mediaStream);
    }
  }, [rtc, mediaStream]);

  return { dataChannel, localStream: mediaStream, remoteStreams };
};
