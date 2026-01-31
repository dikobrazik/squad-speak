import { useEffect, useState } from "react";

type Options = {
  onInit?: (devices: MediaDeviceInfo[]) => void;
};

export const useDevicesList = (
  kind: "audioinput" | "audiooutput",
  options?: Options,
) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const updateDevicesList = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const kindDevices = devices.filter((device) => device.kind === kind);

    if (options?.onInit) {
      options.onInit(kindDevices);
    }

    setDevices(kindDevices);
  };

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = () => updateDevicesList();

    updateDevicesList();
  }, []);

  return devices;
};
