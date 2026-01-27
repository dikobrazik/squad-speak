import { addToast } from "@heroui/toast";
import { useEffect, useMemo, useState } from "react";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";
import { getTurnServers } from "@/src/api";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { DataChannelService } from "@/src/services/DataChannel";
import { MultiPeerRTC } from "@/src/services/MultiPeerRTC";
import { soundService } from "@/src/services/SoundService";
import { useMediaStream } from "./useMediaStream";
import { useRemoteStreams } from "./useRemoteStreams";
import { useWebsocketEvents } from "./useWebsocketEvents";

export const useMultiPeerConnection = ({
  websocket,
}: {
  websocket: Socket<
    MultiRoomServerToClientEvents,
    MultiRoomClientToServerEvents
  >;
}) => {
  const { userId } = useAuthContext();
  const dataChannelService = useMemo(
    () => new DataChannelService(userId),
    [userId],
  );

  const [rtc, setRtc] = useState<MultiPeerRTC | null>(null);

  const mediaStream = useMediaStream();

  const { remoteStreams, addStream, removeStream, muteStream, unmuteStream } =
    useRemoteStreams();

  useWebsocketEvents({
    websocket,
    rtc,
    muteStream,
    unmuteStream,
  });

  useEffect(() => {
    soundService.playJoinSound();

    const rtc = new MultiPeerRTC({
      dataChannel: dataChannelService,
      onPeerConnected: (userId, stream) => {
        addToast({ title: `User ${userId} connected`, color: "secondary" });
        addStream(userId, stream);
      },
      onPeerDisconnected: (userId) => {
        addToast({ title: `User ${userId} disconnected`, color: "secondary" });
        removeStream(userId);
      },
      sendSignal: ({ type, ...msg }) => {
        websocket.emit(type, { from: userId, ...msg });
      },
    });

    (async () => {
      const { iceServers } = await getTurnServers();

      rtc.enrichIceServers(iceServers);

      setRtc(rtc);
    })();

    return () => {
      rtc.closeAll();
      soundService.playLeaveSound();
    };
  }, []);

  useEffect(() => {
    if (rtc && mediaStream) {
      rtc.replaceAudioTrack(mediaStream);
    }
  }, [rtc, mediaStream]);

  return {
    dataChannel: dataChannelService,
    localStream: mediaStream,
    remoteStreams,
  };
};
