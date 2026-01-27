import { useCallback, useState } from "react";

export const useRemoteStreams = () => {
  const [remoteStreams, setRemoteStreams] = useState<
    Map<string, { stream: MediaStream; muted: boolean }>
  >(new Map());

  const removeStream = useCallback((userId: string) => {
    setRemoteStreams((prev) => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  const addStream = useCallback((userId: string, stream: MediaStream) => {
    setRemoteStreams((prev) => {
      const newMap = new Map(prev);
      newMap.set(userId, { stream, muted: false });
      return newMap;
    });
  }, []);

  const unmuteStream = useCallback((userId: string) => {
    setRemoteStreams((prev) => {
      const newMap = new Map(prev);
      const entry = newMap.get(userId);
      if (entry) {
        newMap.set(userId, { stream: entry.stream, muted: false });
      }
      return newMap;
    });
  }, []);

  const muteStream = useCallback((userId: string) => {
    setRemoteStreams((prev) => {
      const newMap = new Map(prev);
      const entry = newMap.get(userId);
      if (entry) {
        newMap.set(userId, { stream: entry.stream, muted: true });
      }
      return newMap;
    });
  }, []);

  return { remoteStreams, muteStream, unmuteStream, addStream, removeStream };
};
