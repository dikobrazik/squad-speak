import axios from "axios";

type ActiveSession = {
  id: string;
  deviceId: string;
  createdAt: string;
  lastActiveAt: string;
};

export const getActiveSessions = () =>
  axios
    .get<ActiveSession[]>(`/session/active`)
    .then((response) => response.data);

export const invalidateSession = (sessionId: string) =>
  axios.delete(`/session/${sessionId}`).then((response) => response.data);
