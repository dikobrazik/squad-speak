import { Slider } from "@heroui/slider";
import { useEffect, useRef, useState } from "react";

export const AudioPlayer = ({ stream }: { stream: MediaStream }) => {
  const [volume, setVolume] = useState(100);
  const [gainNode, setGainNode] = useState<GainNode | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current && stream) {
      const audioApi = new AudioContext();
      const source = audioApi.createMediaStreamSource(stream);
      const destination = audioApi.createMediaStreamDestination();
      const gain = audioApi.createGain();
      const compressor = audioApi.createDynamicsCompressor();
      source.connect(compressor);
      compressor.connect(gain);
      gain.connect(destination);
      audioRef.current.volume = 1;
      audioRef.current.srcObject = destination.stream;

      setGainNode(gain);
    }
  }, [stream]);

  const onVolumeChange = (value: number | number[]) => {
    if (audioRef.current && typeof value === "number") {
      if (gainNode) {
        gainNode.gain.value = value / 100;
      }
      setVolume(value);
    }
  };

  return (
    <div>
      {/* biome-ignore lint/a11y/useMediaCaption: нечего выводить в субтитрах */}
      <audio className="hidden" ref={audioRef} autoPlay playsInline controls />
      <Slider
        label="Volume"
        value={volume}
        className="max-w-md"
        minValue={0}
        maxValue={200}
        marks={[
          { value: 0, label: "0" },
          { value: 100, label: "100" },
          { value: 200, label: "200" },
        ]}
        onChange={onVolumeChange}
      />
    </div>
  );
};
