"use client";

import { Checkbox } from "@heroui/react";
import { Spinner } from "@heroui/spinner";
import { useQuery } from "@tanstack/react-query";
import ms from "ms";
import Link from "next/link";
import { createContext, type PropsWithChildren, useState } from "react";
import QRCode from "react-qr-code";
import { SessionStatus } from "shared/types/session";
import { refreshToken, setToken } from "@/src/api";
import { LoadingPage } from "@/src/components/LoadingPage";
import { useAddDevicePageUrl, useIsAddDevicePage } from "./useAddDevice";
import { useEstablishSession } from "./useEstablishSession";

export const AuthContext = createContext<{ userId: string }>({
  userId: "",
});

export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [rememberMe, setRememberMe] = useState(false);

  const { isFetched: isAuthorizationFetched, data } = useQuery({
    queryKey: ["refreshToken"],
    queryFn: refreshToken,
    refetchInterval: ms("5m"),
    refetchOnWindowFocus: true,
  });

  const userId = data?.userId || "";
  const isAuthorized = Boolean(userId);

  const { isAddDevicePage } = useIsAddDevicePage();

  // если не авторизован и не на странице добавления устройства
  // если на странице добавления устройства, то редирект происходит в хуке useAddDevice
  const needToEstablishSession =
    isAuthorizationFetched && !isAuthorized && !isAddDevicePage;

  const { qrUrl, status } = useEstablishSession({
    rememberMe,
    enabled: needToEstablishSession,
  });

  const { addDevicePageUrl } = useAddDevicePageUrl({
    isAuthorizationFetched,
    isAuthorized,
    qrUrl,
  });

  if (!isAuthorizationFetched) {
    return <LoadingPage />;
  }

  if (data?.accessToken) {
    setToken(data.accessToken);
  }

  if (!userId) {
    return (
      <AuthContext.Provider value={{ userId: "" }}>
        <div className="h-screen flex flex-col justify-center">
          <div className="relative flex justify-center">
            {qrUrl && (
              <Link href={qrUrl} target="_blank" rel="noopener noreferrer">
                <QRCode value={addDevicePageUrl} />
              </Link>
            )}

            {status === SessionStatus.SCANNED && (
              <div className="absolute z-10 top-0 w-[256px] bottom-0 backdrop-blur-sm flex flex-col justify-center items-center">
                <Spinner />
                <span className="text-white text-center mt-2">
                  Подтвердите вход в приложении телеграм
                </span>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Checkbox isSelected={rememberMe} onValueChange={setRememberMe}>
              Remember me:
            </Checkbox>
          </div>
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ userId }}>{children}</AuthContext.Provider>
  );
};
