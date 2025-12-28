"use client";

import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { useParams } from "next/navigation";
import { useRoom } from "@/src/hooks/useRoom";
import { useSocketIO } from "@/src/hooks/useSocketIO";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { Participant } from "./components/Participant";
import { UsersCount } from "./components/UsersCount";
import { useMultiPeerConnection } from "./hooks/useMultiPeerConnection";

export default function RoomPage() {
  const { userId } = useAuthContext();
  const roomId = String(useParams().id);

  const websocket = useSocketIO(roomId, "multiuser");

  const { usersCount } = useRoom({ websocket });

  const { localStream, remoteStreams } = useMultiPeerConnection({
    websocket,
  });

  const onToggleMuteClick = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
      });
    }
  };

  return (
    <div className="flex h-full">
      <div className="h-full flex flex-col flex-3 p-4">
        <div className="flex-1"></div>

        <div className="flex-none flex">
          <Input />

          <Button color="warning" onPress={onToggleMuteClick}>
            mute
          </Button>
        </div>
      </div>
      <aside className="flex flex-1 flex-col h-full justify-start border-l p-4">
        {/* <UsersCount count={usersCount} /> */}
        <div className="flex flex-wrap flex-col gap-4">
          {localStream && (
            <Participant
              key="local"
              muted
              isLocal
              userId={String(userId)}
              stream={localStream}
            />
          )}
          {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
            <Participant key={userId} userId={userId} stream={stream} />
          ))}
        </div>
      </aside>
    </div>
  );
}
