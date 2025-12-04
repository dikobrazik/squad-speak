export type SingleRoomClientToServerEvents = {
	"ice-candidate": (payload: { candidate: RTCIceCandidate | null }) => void;
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

export type SingleRoomServerToClientEvents = {
	"room-status": (payload: { usersCount: number }) => void;

	offer: (...args: Parameters<SingleRoomClientToServerEvents["offer"]>) => void;
	answer: (
		...args: Parameters<SingleRoomClientToServerEvents["answer"]>
	) => void;
	"ice-candidate": (
		...args: Parameters<SingleRoomClientToServerEvents["ice-candidate"]>
	) => void;
};
