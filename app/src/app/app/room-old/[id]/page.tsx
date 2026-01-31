"use client";

import { useRoom } from "hooks/useRoom";
import { useSocketIO } from "hooks/useSocketIO";
import { useParams } from "next/navigation";
import { usePeerConnection } from "./hooks/usePeerConnection";

export default function RoomPage() {
  const roomId = String(useParams().id);

  const websocket = useSocketIO(roomId);
  const { usersCount } = useRoom({ websocket });

  const { remoteVideoRef, onCallClick } = usePeerConnection({
    websocket,
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
