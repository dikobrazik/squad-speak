import { addToast } from "@heroui/toast";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  const queryClient = useQueryClient();
  const router = useRouter();
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    websocket.on("room-status", (payload) => {
      setUsersCount(payload.usersCount);
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    });

    websocket.on("room-full", () => {
      addToast({
        title: "Room is full. Redirecting to home page.",
        color: "danger",
      });
      router.push("/");
    });
  }, []);

  return { usersCount };
};
