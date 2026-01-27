import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import type { MultiPeerRTC } from "@/src/services/MultiPeerRTC";
import { soundService } from "@/src/services/SoundService";

export const useWebsocketEvents = ({
  websocket,
  rtc,
  muteStream,
  unmuteStream,
}: {
  websocket: Socket<
    MultiRoomServerToClientEvents,
    MultiRoomClientToServerEvents
  >;
  rtc: MultiPeerRTC | null;
  muteStream: (userId: string) => void;
  unmuteStream: (userId: string) => void;
}) => {
  const router = useRouter();
  const { userId } = useAuthContext();

  useEffect(() => {
    if (!rtc) return;

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
      soundService.playJoinSound();
      rtc.closePeer(msg.userId);
    });
    websocket.on("disconnected", (msg) => {
      soundService.playLeaveSound();
      rtc.closePeer(msg.userId);
    });
    websocket.on("muted", (msg) => {
      muteStream(msg.userId);
    });
    websocket.on("unmuted", (msg) => {
      unmuteStream(msg.userId);
    });
    websocket.on("invalid-password", () => {
      addToast({ title: `Invalid room password`, color: "danger" });
      router.push("/app/room");
    });

    websocket.connect();

    return () => {
      websocket.disconnect();
      websocket.removeAllListeners();
    };
  }, [rtc]);
};
