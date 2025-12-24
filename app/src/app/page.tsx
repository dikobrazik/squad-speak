"use client";

import { Button } from "@heroui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { createRoom, getRooms } from "../api";

export default function Home() {
  const { data } = useQuery({
    queryKey: ["rooms"],
    queryFn: getRooms,
  });

  const { mutate: mutateRoom } = useMutation({
    mutationKey: ["rooms"],
    mutationFn: createRoom,
    onSuccess: (response) => {
      console.log("Created room:", response);
    },
  });

  const onCreateRoom = async () => {
    mutateRoom();
  };

  return (
    <div className="flex flex-row">
      <div className="w-1/4 p-4 border-r h-screen overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">Rooms</h2>
        <Button onPress={onCreateRoom}>Create Room</Button>
        <ul>
          {data?.map((room) => (
            <Link key={room.id} href={`/room/${room.id}`}>
              <li key={room.id} className="mb-2 p-2 border rounded">
                <p>Room ID: {room.id}</p>
                <p>Room Name: {room.name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </div>
      <div className="w-3/4 p-4"></div>
    </div>
  );
}
