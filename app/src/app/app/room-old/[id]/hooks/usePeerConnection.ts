import { addToast } from "@heroui/toast";
import { getTurnServers } from "api";
import { useEffect, useMemo, useRef } from "react";
import type {
  SingleRoomClientToServerEvents,
  SingleRoomServerToClientEvents,
} from "shared/types/websockets/single-room";
import type { Socket } from "socket.io-client";

export const usePeerConnection = ({
  websocket,
}: {
  websocket: Socket<
    SingleRoomServerToClientEvents,
    SingleRoomClientToServerEvents
  >;
}) => {
  const pc = useMemo(
    () =>
      new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      }),
    [],
  );

  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getTurnServers().then((response) => pc.setConfiguration(response));
  }, []);

  const onCallClick = async () => {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      websocket.emit("offer", { description: pc.localDescription });
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    websocket.on("offer", async ({ description }) => {
      try {
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

        websocket.emit("answer", { description: pc.localDescription });
      } catch (error) {
        console.error("Error handling offer:", error);
        addToast({
          title: `Error handling offer, ${JSON.stringify(error)}`,
          color: "danger",
        });
      }
    });

    websocket.on("answer", async ({ description }) => {
      if (!description) return null;

      if (pc.signalingState === "have-local-offer") {
        await pc.setRemoteDescription(description);
      } else {
        console.warn("Wrong signaling state for answer", pc.signalingState);
        addToast({
          title: `Wrong signaling state for answer, ${pc.signalingState}`,
          color: "danger",
        });
      }
    });

    websocket.on("ice-candidate", async ({ candidate }) => {
      try {
        await pc.addIceCandidate(candidate);
      } catch (err) {
        console.error(err);
        addToast({
          title: `Error adding ICE candidate, ${JSON.stringify(err)}`,
          color: "danger",
        });
      }
    });

    websocket.on("start-call", () => {
      onCallClick();
    });
  }, []);

  useEffect(() => {
    pc.ontrack = ({ track, streams }) => {
      track.onunmute = () => {
        if (!remoteVideoRef.current) return;

        if (remoteVideoRef.current.srcObject) {
          return;
        }

        remoteVideoRef.current.srcObject = streams[0];
      };
    };

    pc.onicecandidate = ({ candidate }) => {
      websocket.emit("ice-candidate", { candidate });
    };

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: true,
      });

      const [track] = stream.getAudioTracks();
      pc.addTrack(track, stream);

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      websocket.connect();
    })();
  }, []);

  return { localVideoRef, remoteVideoRef, onCallClick };
};
