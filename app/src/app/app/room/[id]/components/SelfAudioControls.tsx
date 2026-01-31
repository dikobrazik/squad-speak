import { Button } from "@heroui/button";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { Popover, PopoverContent, PopoverTrigger } from "@heroui/popover";
import { Icon } from "components/Icon";
import { useDevicesList } from "hooks/useDevicesList";
import { useAuthContext } from "providers/Auth/hooks";
import { useEffect, useState } from "react";
import { deviceSettingsService } from "services/DeviceSettings";
import type {
  MultiRoomClientToServerEvents,
  MultiRoomServerToClientEvents,
} from "shared/types/websockets/multi-room";
import type { Socket } from "socket.io-client";

export const SelfAudioControls = ({
  stream,
  websocket,
  isMuted,
  setIsMuted,
}: {
  websocket: Socket<
    MultiRoomServerToClientEvents,
    MultiRoomClientToServerEvents
  >;
  stream: MediaStream | undefined;
  isMuted: boolean;
  setIsMuted: (muted: boolean) => void;
}) => {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);
  const inputDevices = useDevicesList("audioinput");
  const { userId } = useAuthContext();

  const onToggleMuteClick = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);

        websocket.emit(track.enabled ? "unmute" : "mute", { from: userId });
      });
    }
  };

  useEffect(() => {
    const currentDeviceId = deviceSettingsService.getAudioInputDevice();
    setSelectedDeviceId(currentDeviceId);

    deviceSettingsService.addEventListener("input-device-changed", (event) => {
      const newDeviceId = event.deviceId;
      setSelectedDeviceId(newDeviceId || null);
    });
  }, []);

  const onSelectionChange = (selection: "all" | Set<number | string>) => {
    deviceSettingsService.setAudioInputDevice(String([...selection][0]));
  };

  return (
    <div>
      <Popover>
        <PopoverTrigger>
          <div className="flex border-1 border-primary rounded-medium">
            <Button
              isIconOnly
              onPress={onToggleMuteClick}
              color={isMuted ? "danger" : "default"}
            >
              {isMuted ? <Icon name="micro" /> : <Icon name="microMuted" />}
            </Button>

            <div className="p-2 flex items-center">
              <Icon name="arrowUp" size={12} color="heroui-primary" />
            </div>
          </div>
        </PopoverTrigger>
        <PopoverContent>
          <Listbox
            selectionBehavior="replace"
            selectedKeys={[selectedDeviceId].filter((value) => value !== null)}
            selectionMode="single"
            onSelectionChange={onSelectionChange}
          >
            {inputDevices.map((device) => (
              <ListboxItem key={device.deviceId}>
                {device.label || "Unnamed Device"}
              </ListboxItem>
            ))}
          </Listbox>
        </PopoverContent>
      </Popover>
    </div>
  );
};
