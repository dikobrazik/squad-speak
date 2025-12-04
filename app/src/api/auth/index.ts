import axios from "axios";

export const createGuest = () =>
	axios
		.post<{ id: string }>("/authorization/guest")
		.then((response) => response.data);
