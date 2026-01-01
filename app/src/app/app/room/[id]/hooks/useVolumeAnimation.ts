import { useEffect, useRef } from "react";

export const useVolumeAnimation = ({ stream }: { stream: MediaStream }) => {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();

    const source = audioContext.createMediaStreamSource(stream);

    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;

    source.connect(analyser);

    const dataArray = new Uint8Array(analyser.fftSize);

    function getVolume() {
      analyser.getByteTimeDomainData(dataArray);

      let sum = 0;
      for (let i = 0; i < dataArray.length; i++) {
        const value = (dataArray[i] - 128) / 128;
        sum += value * value;
      }

      const rms = Math.sqrt(sum / dataArray.length);
      return rms; // значение ~ от 0 до 1
    }

    function animate() {
      const volume = getVolume();

      // нормализация
      const height = volume < 0.02 ? 0 : Math.min(volume * 200, 100);

      if (bar.current) {
        bar.current.style.height = `${height}%`;
      }

      requestAnimationFrame(animate);
    }

    animate();

    return () => {
      audioContext.close();
      analyser.disconnect();
      source.disconnect();
    };
  }, [stream]);

  return bar;
};
