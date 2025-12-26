import { Slider } from "@heroui/slider";
import { useEffect, useRef, useState } from "react";

export const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const [volume, setVolume] = useState(100);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.volume = volume / 100;
    }
  }, [stream]);

  const onVolumeChange = (value: number | number[]) => {
    if (videoRef.current && typeof value === "number") {
      videoRef.current.volume = value / 100;
      setVolume(value);
    }
  };

  return (
    <div>
      {/* biome-ignore lint/a11y/useMediaCaption: <explanation> */}
      <video className="hidden" ref={videoRef} autoPlay playsInline controls />
      <Slider
        label="Volume"
        value={volume}
        className="max-w-md"
        minValue={0}
        maxValue={100}
        onChange={onVolumeChange}
      />
    </div>
  );
};
