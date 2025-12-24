"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { getProfile, getProfilePhotoUrl } from "@/src/api/telegram";
import { useRoom } from "@/src/hooks/useRoom";
import { useSocketIO } from "@/src/hooks/useSocketIO";
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

const Stream = ({
  userId,
  stream,
}: {
  userId: string;
  stream: MediaStream;
}) => {
  const { data } = useQuery({
    queryKey: ["telegram", "profile", userId],
    queryFn: () => getProfile(userId),
  });

  return (
    <div key={userId}>
      <Image
        src={getProfilePhotoUrl(userId)}
        alt={data?.name || "User Photo"}
        width={50}
        height={50}
      />
      {data ? <div>{data?.name}</div> : <div>Loading...</div>}
      <VideoPlayer stream={stream} />
    </div>
  );
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
          <Stream key={userId} userId={userId} stream={stream} />
        ))}
      </div>
    </div>
  );
}
