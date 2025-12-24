import axios from "axios";

type TelegramProfile = {
  id: string;
  user_id: string;
  username: string;
  name: string;
  photo_path: null;
};

export const getProfile = (userId: string) =>
  axios
    .get<TelegramProfile>(`/telegram/profile/${userId}`)
    .then((response) => response.data);

export const getProfilePhotoUrl = (userId: string) =>
  `${axios.defaults.baseURL}/telegram/profile/${userId}/photo`;
