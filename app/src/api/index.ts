import axios from "axios";
import { BASE_API_URL } from "../config";

axios.defaults.baseURL = BASE_API_URL;
axios.defaults.withCredentials = true;

export const setToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export * from "./auth";
export * from "./room";
export * from "./turn";
