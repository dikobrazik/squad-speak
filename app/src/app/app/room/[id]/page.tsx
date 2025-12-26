"use client";

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

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      <UsersCount count={usersCount} />
      <div className="flex flex-wrap gap-4">
        {localStream && (
          <Participant
            key="local"
            userId={String(userId)}
            stream={localStream}
          />
        )}
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
          <Participant key={userId} userId={userId} stream={stream} />
        ))}
      </div>
    </div>
  );
}
