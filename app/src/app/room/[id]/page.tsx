"use client";

import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { WS_BASE_URL } from "@/src/config";

export default function RoomPage() {
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const localVideoRef = useRef<HTMLVideoElement>(null);

	useEffect(() => {
		const pc = new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
		});

		const signaling = io(WS_BASE_URL, {
			transports: ["websocket"],
		});

		signaling.on("offer", async (data) => {
			console.log(data);
			await pc.setRemoteDescription(new RTCSessionDescription(data.offer));
			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);
			signaling.emit("answer", { answer });
		});
		signaling.on("answer", async (data) => {
			console.log(data);
			await pc.setRemoteDescription(new RTCSessionDescription(data.answer));
		});
		signaling.on("ice-candidate", async (data) => {
			console.log(data);
			try {
				await pc.addIceCandidate(data.candidate);
			} catch (e) {
				console.error("Error adding received ice candidate", e);
			}
		});

		pc.onicecandidate = (event) => {
			if (event.candidate) {
				console.log("event candidate", event.candidate);
				signaling.emit("ice-candidate", { candidate: event.candidate });
			}
		};

		pc.ontrack = (event) => {
			remoteVideoRef.current!.srcObject = event.streams[0];
		};

		(async () => {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: true,
			});

			stream.getAudioTracks().forEach((track) => {
				pc.addTrack(track, stream);
			});
			localVideoRef.current!.srcObject = stream;

			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			signaling.emit("offer", { offer });
		})();
	}, []);

	return (
		<div className="flex flex-col min-h-screen items-center justify-center">
			<video ref={localVideoRef} autoPlay playsInline controls muted></video>
			<video ref={remoteVideoRef} autoPlay playsInline controls muted></video>
			Hello from Squad Speak!
		</div>
	);
}
