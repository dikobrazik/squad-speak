"use client";

import { deviceSettingsService } from "@/src/services/DeviceSettings";
import { DeviceSelect } from "./components/DeviceSelect";

export default function AudioSettingsPage() {
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
    </div>
  );
}
