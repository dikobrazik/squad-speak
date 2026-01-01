"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useRoom } from "@/src/hooks/useRoom";
import { useSocketIO } from "@/src/hooks/useSocketIO";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { Chat } from "./components/Chat";
import { Participant } from "./components/Participant";
import { SelfAudioControls } from "./components/SelfAudioControls";
import { UsersCount } from "./components/UsersCount";
import { useMultiPeerConnection } from "./hooks/useMultiPeerConnection";

export default function RoomPage() {
  const { userId } = useAuthContext();
  const roomId = String(useParams().id);
  const [isLocalMuted, setIsLocalMuted] = useState(false);

  const websocket = useSocketIO(roomId, "multiuser");

  const { usersCount } = useRoom({ websocket });

  const { dataChannel, localStream, remoteStreams } = useMultiPeerConnection({
    websocket,
  });

  return (
    <div className="flex h-full">
      <div className="h-full flex flex-col flex-3 p-4">
        <Chat
          dataChannel={dataChannel}
          controls={
            <SelfAudioControls
              websocket={websocket}
              stream={localStream}
              isMuted={isLocalMuted}
              setIsMuted={setIsLocalMuted}
            />
          }
        />
      </div>
      <aside className="flex flex-1 flex-col h-full justify-start border-l p-4">
        {/* <UsersCount count={usersCount} /> */}
        <div className="flex flex-wrap flex-col gap-4">
          {localStream && (
            <Participant
              key="local"
              muted={isLocalMuted}
              isLocal
              userId={String(userId)}
              stream={localStream}
            />
          )}
          {Array.from(remoteStreams.entries()).map(
            ([userId, { stream, muted }]) => (
              <Participant
                key={userId}
                userId={userId}
                stream={stream}
                muted={muted}
              />
            ),
          )}
        </div>
      </aside>
    </div>
  );
}
