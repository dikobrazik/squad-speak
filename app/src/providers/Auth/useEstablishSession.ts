import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { SessionStatus } from "shared/types/session";
import type { SseData } from "shared/types/session/sse";
import { getAuthQr, getSession, setToken } from "@/src/api";
import { BASE_API_URL } from "@/src/config";
import { useSse } from "@/src/hooks/useSse";

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
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { data: qrData, refetch: refetchQr } = useQuery({
    enabled: enabled && !sessionId,
    queryKey: ["qr-auth"],
    queryFn: getAuthQr,
  });

  const onSSEMessage = useCallback((data: SseData) => {
    if (data.status === SessionStatus.EXPIRED) {
      setSessionId(null);
      refetchQr();
    }
  }, []);

  const { data } = useSse<SseData>(
    `${BASE_API_URL}/authorization/status/stream/${sessionId}`,
    {
      onMessage: onSSEMessage,
      enabled: enabled && !!sessionId,
    },
  );

  const { data: sessionData } = useQuery({
    enabled: data?.status === SessionStatus.CONFIRMED,
    queryKey: ["get-session", { sessionId }],
    queryFn: () => getSession(sessionId!),
  });

  useEffect(() => {
    if (sessionData) {
      setToken(sessionData.accessToken);
      setUserId(sessionData.userId);
    }
  }, [sessionData]);

  useEffect(() => {
    if (qrData?.sessionId) {
      setSessionId(qrData.sessionId);
    }
  }, [qrData?.sessionId]);

  let qrUrl: string | null = qrData ? qrData.qrUrl : null;

  if (rememberMe && qrUrl) {
    qrUrl += "_rememberMe";
  }

  return { qrUrl, status: data?.status };
};
