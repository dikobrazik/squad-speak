import axios from "axios";

type Room = {
  id: string;
  name: string;
  protected?: string;
  createdAt: string;
};
export const getRooms = () =>
  axios.get<Room[]>("/room").then((response) => response.data);

export const getRoom = (id: string) =>
  axios.get<Room>(`/room/${id}`).then((response) => response.data);

export const checkRoomPassword = (id: string, password: string) =>
  axios
    .post<{ valid: boolean }>(`/room/${id}/check-password`, { password })
    .then((response) => response.data);

type CreateRoomPayload = {
  name: string;
  password?: string;
};

export const createRoom = (payload: CreateRoomPayload) =>
  axios.post("/room", payload).then((response) => response.data);
