import axios from "axios";
import { BASE_API_URL } from "../config";

axios.defaults.baseURL = BASE_API_URL;
axios.defaults.withCredentials = true;

export * from "./auth";
export * from "./room";
export * from "./turn";
