import { skipToken, useQuery } from "@tanstack/react-query";
import ms from "ms";
import { useEffect } from "react";
import { SessionStatus } from "shared/types/session";
import { getAuthQr, getSession, setToken } from "@/src/api";

type Options = {
  enabled?: boolean;
  rememberMe: boolean;
  setUserId: (userId: string) => void;
};

export const useEstablishSession = ({
  rememberMe,
  enabled,
  setUserId,
}: Options) => {
  const { data: qrData, refetch: refetchQr } = useQuery({
    enabled: enabled,
    queryKey: ["qr-auth"],
    queryFn: getAuthQr,
    refetchInterval: ms("10m"), // refresh QR code every 10 minutes
  });

  const sessionId = qrData?.sessionId || null;
  const hasSessionId = Boolean(sessionId);

  const { data: sessionData } = useQuery({
    enabled: (query) =>
      hasSessionId && query.state.data?.status !== SessionStatus.CONFIRMED,
    queryKey: ["get-session", { sessionId }],
    queryFn: sessionId ? () => getSession(sessionId) : skipToken,
    refetchInterval: 500,
  });

  useEffect(() => {
    if (sessionData && sessionData.status === SessionStatus.CONFIRMED) {
      setToken(sessionData.accessToken);
      setUserId(sessionData.userId);
    }
  }, [sessionData]);

  useEffect(() => {
    if (sessionData?.status === SessionStatus.EXPIRED) {
      refetchQr();
    }
  }, [qrData?.sessionId]);

  let qrUrl: string | null = qrData ? qrData.qrUrl : null;

  if (rememberMe && qrUrl) {
    qrUrl += "_rememberMe";
  }

  return { qrUrl, status: sessionData?.status };
};
