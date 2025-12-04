import { useState } from "react";
import type {
  SingleRoomClientToServerEvents,
  SingleRoomServerToClientEvents,
} from "shared/types/websockets/single-room";
import { io, type Socket } from "socket.io-client";
import { WS_BASE_URL } from "@/src/config";
import { useAuthContext } from "@/src/providers/Auth/hooks";

export const useSocketIO = (roomId: string) => {
  const { userId } = useAuthContext();

  const [socket] = useState(
    () =>
      io(WS_BASE_URL, {
        // autoConnect: false,
        transports: ["websocket"],
        query: {
          roomId,
        },
        auth: {
          userId,
        },
      }) as Socket<
        SingleRoomServerToClientEvents,
        SingleRoomClientToServerEvents
      >,
  );

  return socket;
};
