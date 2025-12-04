export type ClientToServerEvents = {
	"ice-candidate": (payload: {
		candidate: RTCIceCandidate | null;
	}) => void;
	offer: (
		payload: {
			description: RTCSessionDescriptionInit | null;
		},
	) => void;
	answer: (
		payload: {
			description: RTCSessionDescriptionInit | null;
		},
	) => void;
};

export type ServerToClientEvents = {
	"room-status": (payload: { usersCount: number }) => void;

	offer: (...args: Parameters<ClientToServerEvents['offer']>) => void;
	answer: (...args: Parameters<ClientToServerEvents['answer']>) => void;
	"ice-candidate": (...args: Parameters<ClientToServerEvents['ice-candidate']>) => void;
};
