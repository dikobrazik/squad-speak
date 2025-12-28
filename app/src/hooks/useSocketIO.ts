import { useState } from "react";
import type {
  SingleRoomClientToServerEvents,
  SingleRoomServerToClientEvents,
} from "shared/types/websockets/single-room";
import { io, type Socket } from "socket.io-client";
import { WS_BASE_URL } from "@/src/config";
import { useAuthContext } from "@/src/providers/Auth/hooks";
import { useRoomsPasswordsStore } from "../providers/RoomPasswordStore";

export const useSocketIO = (roomId: string, namespace?: string) => {
  const { userId } = useAuthContext();
  const { passwords } = useRoomsPasswordsStore();

  const [socket] = useState(
    () =>
      io(new URL(namespace ?? "/", WS_BASE_URL).toString(), {
        autoConnect: false,
        transports: ["websocket"],
        query: {
          roomId,
        },
        auth: {
          userId,
          password: passwords[roomId],
        },
      }) as Socket<
        SingleRoomServerToClientEvents,
        SingleRoomClientToServerEvents
      >,
  );

  return socket;
};
