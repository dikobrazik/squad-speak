import axios from "axios";

interface TurnServers {
  iceServers: IceServer[];
}

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

export const getTurnServers = () =>
  axios
    .post<TurnServers>("/turn/credentials")
    .then((response) => response.data);
