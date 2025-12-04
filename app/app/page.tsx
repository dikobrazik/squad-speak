"use client";

import { useEffect, useRef } from "react";

export default function Home() {
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  // const remoteVideo = remoteVideoRef.current!;
  const localVideoRef = useRef<HTMLVideoElement>(null);
  // const localVideo = localVideoRef.current!;

  useEffect(() => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    // const signaling = new WebSocket("wss://your-signaling-server.example");

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("event candidate", event.candidate);
        // signaling.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    pc.ontrack = (event) => {
      remoteVideoRef.current!.srcObject = event.streams[0];
    };

    (async () => {
      // navigator.mediaDevices.enumerateDevices().then((devices) => {
      //   devices.forEach((device) => {
      //     console.log(
      //       `${device.kind}: ${device.label} id = ${device.deviceId}`,
      //     );
      //   });
      // });

      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      stream.getTracks().forEach((track) => {
        if (track.kind === "audio") {
          console.log(track.getSettings());
        }
        pc.addTrack(track, stream);
      });
      localVideoRef.current!.srcObject = stream;

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      pc.setRemoteDescription(offer);

      console.log("offer", offer);
      // отправляем offer через сигнальный канал
      // signaling.send(JSON.stringify({ offer }));
    })();
  }, []);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <video ref={localVideoRef} autoPlay playsInline controls muted></video>
      <video ref={remoteVideoRef} autoPlay playsInline controls muted></video>
      Hello from Squad Speak!
    </div>
  );
}
