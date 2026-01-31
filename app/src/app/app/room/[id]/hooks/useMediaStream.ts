import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { deviceSettingsService } from "services/DeviceSettings";

export const useMediaStream = () => {
  const router = useRouter();
  const [mediaStream, setMediaStream] = useState<MediaStream>();

  const initializeMediaStream = async (deviceId: string | undefined) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: {
          deviceId,
        },
      });

      setMediaStream(stream);
    } catch (e) {
      if (e instanceof DOMException) {
        switch (e.name) {
          case "NotAllowedError":
            addToast({
              title: "Microphone access denied",
              description:
                "Please allow microphone access to join the room with audio",
              color: "danger",
            });
            break;
          case "NotFoundError":
            deviceSettingsService.resetAudioInputDevice();

            addToast({
              title: "No microphone found",
              description:
                "Please connect a microphone to join the room with audio",
              color: "danger",
            });
            break;
          default:
            console.log("Error accessing media devices:", e);
        }

        router.push("/app");
        return;
      }
    }
  };

  useEffect(() => {
    initializeMediaStream(
      deviceSettingsService.getAudioInputDevice() || undefined,
    );

    deviceSettingsService.addEventListener("input-device-changed", (event) => {
      initializeMediaStream(event.deviceId || undefined);
    });
  }, []);

  return mediaStream;
};
