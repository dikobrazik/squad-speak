import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { SessionStatus } from "shared/types/session";
import type { SseData } from "shared/types/session/sse";
import { getAuthQr, getSession, setToken } from "@/src/api";
import { BASE_API_URL } from "@/src/config";
import { useSse } from "@/src/hooks/useSse";

type Options = {
  enabled?: boolean;
  rememberMe: boolean;
};

export const useEstablishSession = ({ rememberMe, enabled }: Options) => {
  const [sessionId, setSessionId] = useState<string | null>(null);

  const { data: qrData, refetch: refetchQr } = useQuery({
    enabled,
    queryKey: ["qr-auth"],
    queryFn: getAuthQr,
  });

  const { data } = useSse<SseData>(
    `${BASE_API_URL}/authorization/status/stream/${sessionId}`,
    {
      onMessage: (data) => {
        if (data.status === SessionStatus.EXPIRED) {
          setSessionId(null);
          refetchQr();
        }
        console.log("SSE data:", data);
      },
      enabled: !!sessionId,
    },
  );

  const { data: sessionData } = useQuery({
    enabled: data?.status === SessionStatus.CONFIRMED,
    queryKey: ["qr-auth", { sessionId }],
    queryFn: () => getSession(sessionId!),
  });

  useEffect(() => {
    if (sessionData) {
      setToken(sessionData.accessToken);
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
