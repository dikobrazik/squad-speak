import { Select, SelectItem } from "@heroui/select";
import type { SharedSelection } from "@heroui/system";
import { useDevicesList } from "hooks/useDevicesList";
import { useState } from "react";

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

  const devices = useDevicesList(kind, {
    onInit: (devices) => {
      if (
        defaultDeviceId &&
        devices.some((d) => d.deviceId === defaultDeviceId)
      ) {
        setSelectedDevice(defaultDeviceId);
      } else {
        setSelectedDevice(devices.length > 0 ? devices[0].deviceId : null);
      }
    },
  });

  const onSelectedDeviceChange = (event: SharedSelection) => {
    const deviceId = event.currentKey || null;

    setSelectedDevice(deviceId);
    if (onDeviceChange && deviceId) {
      onDeviceChange(deviceId);
    }
  };

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
