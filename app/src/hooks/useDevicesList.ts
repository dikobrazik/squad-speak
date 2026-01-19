import { useEffect, useState } from "react";

export const useDevicesList = (kind: "audioinput" | "audiooutput") => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  const updateDevicesList = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const kindDevices = devices.filter((device) => device.kind === kind);

    setDevices(kindDevices);
  };

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = () => updateDevicesList();

    updateDevicesList();
  }, []);

  return devices;
};
