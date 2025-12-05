import axios from "axios";

export const getRooms = () =>
	axios.get("/room").then((response) => response.data);

export const createRoom = () =>
	axios.post("/room").then((response) => response.data);
