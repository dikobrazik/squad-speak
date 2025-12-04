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
  const [usersCount, setUsersCount] = useState(0);

  useEffect(() => {
    websocket.on("room-status", (payload) => {
      setUsersCount(payload.usersCount);
    });
  }, []);

  return { usersCount };
};
