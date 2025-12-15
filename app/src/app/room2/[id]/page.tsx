"use client";

import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useRoom } from "@/src/app/room/[id]/hooks/useRoom";
import { useSocketIO } from "@/src/app/room/[id]/hooks/useSocketIO";
import { useMultiPeerConnection } from "./hooks/useMultiPeerConnection";

const VideoPlayer = ({ stream }: { stream: MediaStream }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // biome-ignore lint/a11y/useMediaCaption: <explanation>
  return <video ref={videoRef} autoPlay playsInline controls />;
};

export default function RoomPage() {
  const roomId = String(useParams().id);

  const websocket = useSocketIO(roomId, "multiuser");

  const { usersCount } = useRoom({ websocket });

  const { remoteStreams } = useMultiPeerConnection({
    websocket,
  });

  return (
    <div className="flex flex-col min-h-screen items-center justify-center">
      {usersCount} user(s) in the room
      <div className="flex flex-wrap gap-4">
        {Array.from(remoteStreams.entries()).map(([userId, stream]) => (
          <div key={userId}>
            <p>User: {userId}</p>
            <VideoPlayer stream={stream} />
          </div>
        ))}
      </div>
    </div>
  );
}
