import { Select, SelectItem } from "@heroui/select";
import type { SharedSelection } from "@heroui/system";
import { useEffect, useState } from "react";

export const DeviceSelect = ({
  label,
  kind,
  defaultDeviceId,
  onDeviceChange,
}: {
  label: string;
  kind: "audioinput" | "audiooutput";
  defaultDeviceId: string | null;
  onDeviceChange: (deviceId: string) => void;
}) => {
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // FIXME: Duplicate of useDevicesList hook
  const updateDevicesList = async () => {
    const devices = await navigator.mediaDevices.enumerateDevices();

    const kindDevices = devices.filter((device) => device.kind === kind);

    if (
      defaultDeviceId &&
      devices.some((d) => d.deviceId === defaultDeviceId)
    ) {
      setSelectedDevice(defaultDeviceId);
    } else {
      setSelectedDevice(
        kindDevices.length > 0 ? kindDevices[0].deviceId : null,
      );
    }

    setDevices(kindDevices);
  };

  const onSelectedDeviceChange = (event: SharedSelection) => {
    const deviceId = event.currentKey || null;

    setSelectedDevice(deviceId);
    if (onDeviceChange && deviceId) {
      onDeviceChange(deviceId);
    }
  };

  useEffect(() => {
    navigator.mediaDevices.ondevicechange = () => updateDevicesList();

    updateDevicesList();
  }, []);

  return devices.length === 0 ? (
    <p>No output devices found.</p>
  ) : (
    <Select
      label={label}
      selectedKeys={selectedDevice ? [selectedDevice] : []}
      onSelectionChange={onSelectedDeviceChange}
    >
      {devices.map((device) => (
        <SelectItem key={device.deviceId}>
          {device.label || `${label} (${device.deviceId})`}
        </SelectItem>
      ))}
    </Select>
  );
};
