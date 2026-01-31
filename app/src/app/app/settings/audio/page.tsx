"use client";

import { Checkbox } from "@heroui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getUserSettings, setSystemSounds } from "api";
import { LoadingPage } from "components/LoadingPage";
import { useEffect, useState } from "react";
import { deviceSettingsService } from "services/DeviceSettings";
import { soundService } from "services/SoundService";
import { DeviceSelect } from "./components/DeviceSelect";

export default function AudioSettingsPage() {
  const { data: userSettings, isLoading } = useQuery({
    queryKey: ["user-settings-audio"],
    queryFn: getUserSettings,
  });

  const { mutate: mutateSystemSounds } = useMutation({
    mutationKey: ["set-system-sounds"],
    mutationFn: setSystemSounds,
  });

  const [systemSoundsEnabled, setSystemSoundsEnabled] = useState(
    userSettings?.systemSounds ?? true,
  );

  useEffect(() => {
    if (userSettings) {
      setSystemSoundsEnabled(userSettings.systemSounds);
      if (userSettings.systemSounds) soundService.unmute();
      else soundService.mute();
    }
  }, [userSettings]);

  const onSystemSoundsChange = (enabled: boolean) => {
    setSystemSoundsEnabled(enabled);
    mutateSystemSounds(enabled);

    if (enabled) soundService.unmute();
    else soundService.mute();
  };

  if (isLoading) {
    return <LoadingPage height="full" />;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Audio Settings</h1>

      <section className="mb-6">
        <DeviceSelect
          label="Input Device"
          kind="audioinput"
          defaultDeviceId={deviceSettingsService.getAudioInputDevice()}
          onDeviceChange={deviceSettingsService.setAudioInputDevice.bind(
            deviceSettingsService,
          )}
        />
      </section>

      <section className="mb-6">
        <DeviceSelect
          label="Output Device"
          kind="audiooutput"
          defaultDeviceId={deviceSettingsService.getAudioOutputDevice()}
          onDeviceChange={deviceSettingsService.setAudioOutputDevice.bind(
            deviceSettingsService,
          )}
        />
      </section>

      <Checkbox
        isSelected={systemSoundsEnabled}
        onValueChange={onSystemSoundsChange}
      >
        System sounds
      </Checkbox>
    </div>
  );
}
