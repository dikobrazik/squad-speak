"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useEffect,
  useState,
} from "react";
import QRCode from "react-qr-code";
import { SessionStatus } from "shared/types/session";
import { refreshToken, setToken } from "@/src/api";
import { Loader } from "@/src/components/Loader";
import { useEstablishSession } from "./useEstablishSession";

export const AuthContext = createContext<{ userId: string }>({
  userId: "",
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [userId, setUserId] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const { isFetched, data } = useQuery({
    queryKey: ["refreshToken"],
    queryFn: refreshToken,
    // todo: remove
    refetchOnWindowFocus: false,
  });

  const needToEstablishSession = isFetched && !data;

  useEffect(() => {
    if (data) {
      setToken(data.accessToken);
      setUserId(data.userId);
    }
  }, [data]);

  const { qrUrl, status } = useEstablishSession({
    rememberMe,
    enabled: needToEstablishSession,
  });

  if (!isFetched) {
    return null;
  }

  if (!userId) {
    return (
      <div className="h-full flex flex-col justify-center">
        <div className="relative flex justify-center">
          {qrUrl && <QRCode value={qrUrl} />}

          {status === SessionStatus.SCANNED && (
            <div className="absolute z-10 top-0 w-[256px] bottom-0 backdrop-blur-sm">
              <Loader>
                <span className="text-white text-center mt-2">
                  Подтвердите вход в приложении телеграм
                </span>
              </Loader>
            </div>
          )}
        </div>
        <label className="mt-4 block text-center">
          Remember me:
          <input
            type="checkbox"
            onChange={(e) => {
              setRememberMe(e.target.checked);
            }}
            className="ml-2"
          />
        </label>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ userId }}>{children}</AuthContext.Provider>
  );
};
