import axios from "axios";

type Room = {
  id: string;
  name: string;
  createdAt: string;
};
export const getRooms = () =>
  axios.get<Room[]>("/room").then((response) => response.data);

export const createRoom = () =>
  axios.post("/room").then((response) => response.data);
