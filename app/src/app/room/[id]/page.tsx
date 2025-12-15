"use client";

import { useParams } from "next/navigation";
import { useSocketIO } from "@/src/app/room/[id]/hooks/useSocketIO";
import { useMultiPeerConnection } from "./hooks/useMultiPeerConnection";
import { usePeerConnection } from "./hooks/usePeerConnection";
import { useRoom } from "./hooks/useRoom";

export default function RoomPage() {
  const roomId = String(useParams().id);

  const websocket = useSocketIO(roomId);
  const websocketMulti = useSocketIO(roomId, "/multi-user");
  const { usersCount } = useRoom({ websocket });

  const { remoteVideoRef, onCallClick } = usePeerConnection({
    websocket,
  });

  const {} = useMultiPeerConnection({
    websocket: websocketMulti,
  });

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      {usersCount} user(s) in the room
      <video ref={remoteVideoRef} autoPlay playsInline controls muted></video>
      <button type="button" onClick={onCallClick}>
        Call
      </button>
      Hello from Squad Speak!
    </div>
  );
}
