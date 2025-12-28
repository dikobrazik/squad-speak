import { addToast } from "@heroui/toast";
import { useEffect, useState } from "react";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";
import { getTurnServers } from "@/src/api";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { MultiPeerRTC } from "@/src/services/MultiPeerRTC";

export const useMultiPeerConnection = ({
  websocket,
}: {
  websocket: Socket<
    MultiRoomServerToClientEvents,
    MultiRoomClientToServerEvents
  >;
}) => {
  const { userId } = useAuthContext();
  const [localStream, setLocalStream] = useState<MediaStream | undefined>(
    undefined,
  );
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );

  useEffect(() => {
    if (!userId) return;

    const rtc = new MultiPeerRTC({
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
          newMap.set(userId, stream);
          return newMap;
        });
      },
    });

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      await getTurnServers().then((response) => {
        rtc.enrichIceServers(response.iceServers);
      });

      setLocalStream(stream);
      await rtc.setLocalStream(stream);

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
      rtc.closePeer(msg.userId);
    });
    websocket.on("disconnected", (msg) => {
      rtc.closePeer(msg.userId);
    });

    return () => {
      rtc.closeAll();
      websocket.offAny();
      websocket.disconnect();
    };
  }, [userId, websocket]);

  return { localStream, remoteStreams };
};
