import axios from "axios";
import type { SessionStatus } from "shared/types/session";

export const createGuest = () =>
  axios
    .post<{ id: string }>("/authorization/guest")
    .then((response) => response.data);

export const getAuthQr = () =>
  axios
    .get<{ sessionId: string; qrUrl: string }>("/authorization/qr")
    .then((response) => response.data);

type AuthResult =
  | { status: Exclude<SessionStatus, SessionStatus.CONFIRMED> }
  | {
      status: SessionStatus.CONFIRMED;
      telegramId: number;
      userId: string;
      accessToken: string;
    };

export const getSession = (sessionId: string) =>
  axios
    .get<AuthResult>(`/authorization/status/${sessionId}`)
    .then((response) => response.data);

type RefreshTokenResponse = {
  accessToken: string;
  userId: string;
};

export const refreshToken = () =>
  axios
    .get<RefreshTokenResponse>(`/authorization/refresh`)
    .then((response) => response.data);
