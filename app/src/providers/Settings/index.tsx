"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from "react";
import { getUserSettings, type Settings } from "@/src/api";

const defaultSettings: Settings = {
  systemSounds: true,
};

const SettingsContext = createContext<Settings>(defaultSettings);
export const useSettings = () => {
  return useContext(SettingsContext);
};

export const SettingsProvider = ({ children }: PropsWithChildren) => {
  const { data } = useQuery({
    queryKey: ["settings"],
    queryFn: getUserSettings,
  });

  useEffect(() => {
    (async () => {
      if (data) {
        const { soundService } = await import("../../services/SoundService");

        if (!data.systemSounds) soundService.mute();
      }
    })();
  }, [data]);

  return (
    <SettingsContext.Provider value={data ?? defaultSettings}>
      {children}
    </SettingsContext.Provider>
  );
};
