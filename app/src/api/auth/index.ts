import axios from "axios";

export const createGuest = () =>
	axios
		.post<{ id: string }>("/authorization/guest")
		.then((response) => response.data);

export const getAuthQr = () =>
	axios
		.get<{ sessionId: string; qrUrl: string }>("/authorization/qr")
		.then((response) => response.data);
