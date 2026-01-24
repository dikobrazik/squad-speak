"use client";

import { useQuery } from "@tanstack/react-query";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
} from "react";
import { getUserSettings, type Settings } from "@/src/api";
import { soundService } from "@/src/services/SoundService";

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
    if (data) {
      if (!data.systemSounds) soundService.mute();
    }
  }, [data]);

  return (
    <SettingsContext.Provider value={data ?? defaultSettings}>
      {children}
    </SettingsContext.Provider>
  );
};
