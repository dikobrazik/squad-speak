import axios from "axios";

export type Settings = {
  systemSounds: boolean;
};

export const getUserSettings = () =>
  axios.get<Settings>(`/settings`).then((response) => response.data);

export const setSystemSounds = (enabled: boolean) =>
  axios
    .post(`/settings/system-sounds`, { enabled })
    .then((response) => response.data);
