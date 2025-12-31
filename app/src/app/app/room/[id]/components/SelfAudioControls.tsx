import { Button } from "@heroui/button";
import { useState } from "react";
import { Icon } from "@/src/components/Icon";

export const SelfAudioControls = ({
  stream,
}: {
  stream: MediaStream | undefined;
}) => {
  const [isMuted, setIsMuted] = useState(false);

  const onToggleMuteClick = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled;
        setIsMuted(!track.enabled);
      });
    }
  };

  return (
    <div>
      <Button
        isIconOnly
        onPress={onToggleMuteClick}
        color={isMuted ? "danger" : "default"}
      >
        {isMuted ? <Icon name="micro" /> : <Icon name="microMuted" />}
      </Button>
    </div>
  );
};
