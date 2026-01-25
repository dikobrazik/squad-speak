import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import ms from "ms";
import { useEffect } from "react";
import { SessionStatus } from "shared/types/session";
import { getAuthQr, getSession, setToken } from "@/src/api";
import { getQueryData } from "@/src/utils/react-query";

type Options = {
  enabled?: boolean;
  rememberMe: boolean;
};

export const useEstablishSession = ({ rememberMe, enabled }: Options) => {
  const queryClient = useQueryClient();

  const { data: qrData, refetch: refetchQr } = useQuery({
    enabled,
    queryKey: ["qr-auth"],
    queryFn: getAuthQr,
    refetchInterval: ms("10m"),
  });

  const sessionId = qrData?.sessionId || null;
  const hasSessionId = Boolean(sessionId);

  const { data: sessionData } = useQuery({
    enabled: (query) =>
      hasSessionId && getQueryData(query)?.status !== SessionStatus.CONFIRMED,
    queryKey: ["get-session", { sessionId }],
    queryFn: sessionId ? () => getSession(sessionId) : skipToken,
    refetchInterval: ms("1s"),
  });

  useEffect(() => {
    if (sessionData && sessionData.status === SessionStatus.CONFIRMED) {
      setToken(sessionData.accessToken);
      queryClient.refetchQueries({ queryKey: ["refreshToken"] });
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData?.status === SessionStatus.EXPIRED) {
      refetchQr();
    }
  }, [sessionData?.status, qrData?.sessionId]);

  let qrUrl: string | null = qrData ? qrData.qrUrl : null;

  if (rememberMe && qrUrl) {
    qrUrl += "_rememberMe";
  }

  return { qrUrl, status: sessionData?.status };
};
