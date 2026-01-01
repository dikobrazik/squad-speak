import { Button } from "@heroui/button";
import { useState } from "react";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";
import { Icon } from "@/src/components/Icon";
import { useAuthContext } from "@/src/providers/Auth/hooks";

export const SelfAudioControls = ({
  stream,
  websocket,
  isMuted,
  setIsMuted,
}: {
  websocket: Socket<
    MultiRoomServerToClientEvents,
    MultiRoomClientToServerEvents
  >;
  stream: MediaStream | undefined;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}) => {
  const { userId } = useAuthContext();

  const onToggleMuteClick = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);

        websocket.emit(track.enabled ? "unmute" : "mute", { from: userId });
      });
    }
  };

  return (
    <div>
      <Button
        isIconOnly
        onPress={onToggleMuteClick}
        color={isMuted ? "danger" : "default"}
      >
        {isMuted ? <Icon name="micro" /> : <Icon name="microMuted" />}
      </Button>
    </div>
  );
};
