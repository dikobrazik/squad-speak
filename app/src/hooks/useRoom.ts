import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify/unstyled";
import type {
  SingleRoomClientToServerEvents,
  SingleRoomServerToClientEvents,
} from "shared/types/websockets/single-room";
import type { Socket } from "socket.io-client";

export const useRoom = ({
  websocket,
}: {
  websocket: Socket<
    SingleRoomServerToClientEvents,
    SingleRoomClientToServerEvents
  >;
}) => {
  const router = useRouter();
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    websocket.on("room-status", (payload) => {
      setUsersCount(payload.usersCount);
    });

    websocket.on("room-full", () => {
      toast("Room is full. Redirecting to home page.", { type: "error" });
      router.push("/");
    });
  }, []);

  return { usersCount };
};
