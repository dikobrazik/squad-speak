export type ClientToServerEvents = {
	"join-room": (
		payload: { roomId: string; userId: string },
		ack: (payload: { polite: boolean }) => void,
	) => void;
	"leave-room": (payload: { roomId: string; userId: string }) => void;

	"ice-candidate": (payload: {
		roomId: string;
		userId: string;
		candidate: RTCIceCandidate | null;
	}) => void;

	offer: (
		payload: {
			roomId: string;
			userId: string;
			description: RTCSessionDescriptionInit | null;
		},
		ack: () => void,
	) => void;
	answer: (
		payload: {
			roomId: string;
			userId: string;
			description: RTCSessionDescriptionInit | null;
		},
		ack: () => void,
	) => void;
};

export type ServerToClientEvents = {
	"room-status": (payload: { usersCount: number }) => void;
	offer: (payload: { description: RTCSessionDescriptionInit | null }) => void;
	answer: (payload: { description: RTCSessionDescriptionInit | null }) => void;
	"ice-candidate": (payload: { candidate: RTCIceCandidate | null }) => void;
};
