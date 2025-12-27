"use client";

import { useEffect, useState } from "react";

type Options<Data> = {
  enabled?: boolean;
  onMessage: (data: Data) => void;
};

export const useSse = <Data extends string | object = any>(
  url: string,
  options: Options<Data>,
) => {
  const [data, setData] = useState<Data | null>(null);
  const { onMessage, enabled = true } = options;

  useEffect(() => {
    if (!enabled) {
      return;
    }

    const eventSource = new EventSource(url);

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setData(data);
      onMessage(data);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [url, enabled, onMessage]);

  return { data };
};
