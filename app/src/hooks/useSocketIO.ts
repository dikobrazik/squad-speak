import { WS_BASE_URL } from "config";
import { useAuthContext } from "providers/Auth/hooks";
import { useState } from "react";
import { io } from "socket.io-client";
import { useRoomsPasswordsStore } from "../providers/RoomPasswordStore";

export const useSocketIO = (roomId: string, namespace?: string) => {
  const { userId } = useAuthContext();
  const { passwords } = useRoomsPasswordsStore();

  const [socket] = useState(() =>
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
    }),
  );

  return socket;
};
