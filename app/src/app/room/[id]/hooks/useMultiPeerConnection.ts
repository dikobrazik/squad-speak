import { useEffect, useState } from "react";
import { toast } from "react-toastify/unstyled";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";
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
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );

  useEffect(() => {
    if (!userId) return;

    const rtc = new MultiPeerRTC({
      userId,
      onPeerConnected: (userId) => {
        toast.info(`User ${userId} connected`);
      },
      onPeerDisconnected: (userId) => {
        toast.info(`User ${userId} disconnected`);
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

      await rtc.setLocalStream(stream);

      websocket.connect();
    })();

    // incoming signals
    const handleStartCall = (userIds: string[]) => {
      userIds.forEach((userId) => {
        rtc.createOffer(userId);
      });
    };
    const handleOffer = async (msg: any) => {
      if (msg.to !== userId) return;
      await rtc.handleOffer(msg.from, msg.data);
    };
    const handleAnswer = async (msg: any) => {
      if (msg.to !== userId) return;
      await rtc.handleAnswer(msg.from, msg.data);
    };
    const handleIce = async (msg: any) => {
      if (msg.to !== userId) return;
      await rtc.handleIce(msg.from, msg.data);
    };
    const handleDisconnected = async (msg: any) => {
      rtc.closePeer(msg.userId);
    };
    const handleConnected = async (msg: any) => {
      toast(`User ${msg.userId} connected`);
      rtc.closePeer(msg.userId);
    };

    websocket.on("start-call", handleStartCall);
    websocket.on("offer", handleOffer);
    websocket.on("answer", handleAnswer);
    websocket.on("ice-candidate", handleIce);
    websocket.on("connected", handleConnected);
    websocket.on("disconnected", handleDisconnected);

    return () => {
      rtc.closeAll();
      websocket.off("start-call", handleStartCall);
      websocket.off("offer", handleOffer);
      websocket.off("answer", handleAnswer);
      websocket.off("ice-candidate", handleIce);
      websocket.off("connected", handleConnected);
      websocket.off("disconnected", handleDisconnected);
    };
  }, [userId, websocket]);

  return { remoteStreams };
};
