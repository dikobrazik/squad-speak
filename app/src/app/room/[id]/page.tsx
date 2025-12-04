"use client";

import { useParams } from "next/navigation";
import { use, useEffect, useRef, useState } from "react";
import { useSocketIO } from "@/src/app/room/[id]/hooks/useSocketIO";
import { useAuthContext } from "@/src/providers/Auth/hooks";

export default function RoomPage() {
	const roomId = String(useParams().id);
	const { userId } = useAuthContext();
	const remoteVideoRef = useRef<HTMLVideoElement>(null);
	const localVideoRef = useRef<HTMLVideoElement>(null);
	const websocket = useSocketIO(roomId);
	const [polite, setPolite] = useState<boolean>(false);

	const [usersCount, setUsersCount] = useState(0);
	const [pc] = useState(
		new RTCPeerConnection({
			iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
		}),
	);

	useEffect(() => {
		if (roomId && userId) {
			websocket.emit("join-room", { roomId, userId }, (payload) => {
				console.log("Joined room, polite:", payload.polite);
				setPolite(payload.polite);
			});
		}
	}, [roomId, userId]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only for unmount
	useEffect(() => {
		window.addEventListener("unload", () => {
			websocket.emit("leave-room", { roomId, userId: userId! });
		});
		return () => {
			websocket.emit("leave-room", { roomId, userId: userId! });
		};
	}, []);

	useEffect(() => {
		websocket.on("room-status", (payload) => {
			setUsersCount(payload.usersCount);
		});
	}, []);

	useEffect(() => {
		websocket.on("offer", async ({ description }) => {
			console.log("Received offer");
			if (!description) return null;

			if (
				pc.signalingState !== "stable" &&
				pc.signalingState !== "have-remote-offer"
			) {
				console.warn(
					"Signaling state is not stable, ignoring offer",
					pc.signalingState,
				);
				return;
			}

			await pc.setRemoteDescription(description);
			const answer = await pc.createAnswer();
			await pc.setLocalDescription(answer);

			websocket.emit(
				"answer",
				{ userId, roomId, description: pc.localDescription },
				() => {
					console.log("Answer sent");
				},
			);
		});

		websocket.on("answer", async ({ description }) => {
			console.log("Received answer");
			if (!description) return null;

			await pc.setRemoteDescription(description);
		});

		websocket.on("ice-candidate", async ({ candidate }) => {
			try {
				await pc.addIceCandidate(candidate);
			} catch (err) {
				console.error(err);
			}
		});
	}, []);

	useEffect(() => {
		pc.ontrack = ({ track, streams }) => {
			console.log("ontrack", track, streams);
			track.onunmute = () => {
				if (remoteVideoRef.current!.srcObject) {
					return;
				}
				remoteVideoRef.current!.srcObject = streams[0];
			};
		};

		pc.onicecandidate = ({ candidate }) =>
			websocket.emit("ice-candidate", { userId, roomId, candidate });

		(async () => {
			const stream = await navigator.mediaDevices.getUserMedia({
				video: false,
				audio: true,
			});

			const [track] = stream.getAudioTracks();
			pc.addTrack(track, stream);

			localVideoRef.current!.srcObject = stream;
		})();
	}, []);

	const onCallClick = async () => {
		try {
			const offer = await pc.createOffer();
			await pc.setLocalDescription(offer);

			websocket.emit(
				"offer",
				{ userId, roomId, description: pc.localDescription },
				() => {
					console.log("Offer sent");
				},
			);
		} catch (err) {
			console.error(err);
		}
	};

	return (
		<div className="flex flex-col min-h-screen items-center justify-center">
			{usersCount} user(s) in the room
			<video ref={localVideoRef} autoPlay playsInline controls muted></video>
			<video ref={remoteVideoRef} autoPlay playsInline controls muted></video>
			<button type="button" onClick={onCallClick}>
				Call
			</button>
			Hello from Squad Speak!
		</div>
	);
}
