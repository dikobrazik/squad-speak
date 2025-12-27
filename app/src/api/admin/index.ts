import axios from "axios";

type TelegramAccount = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  photo_path: null;
};

export const getUsersList = () =>
  axios.get<TelegramAccount[]>("/telegram").then((response) => response.data);
