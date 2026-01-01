export type MultiRoomClientToServerEvents = {
	"ice-candidate": (payload: { from: string; to: string; data: RTCIceCandidate }) => void;
	offer: (payload: { from: string; to: string; data: RTCSessionDescriptionInit }) => void;
	answer: (payload: { from: string; to: string; data: RTCSessionDescriptionInit }) => void;

	mute: (payload: { from: string }) => void;
	unmute: (payload: { from: string }) => void;
};

export type MultiRoomServerToClientEvents = {
	"connected": (payload: {userId: string}) => void;
	"disconnected": (payload: {userId: string}) => void;

	"room-not-found": () => void;
	"invalid-password": () => void;
	"room-full": () => void;
	"start-call": (userIds: string[]) => void;
	"room-status": (payload: { usersCount: number }) => void;

	"muted": (payload: { userId: string }) => void;
	"unmuted": (payload: { userId: string }) => void;

	offer: (...args: Parameters<MultiRoomClientToServerEvents["offer"]>) => void;
	answer: (
		...args: Parameters<MultiRoomClientToServerEvents["answer"]>
	) => void;
	"ice-candidate": (
		...args: Parameters<MultiRoomClientToServerEvents["ice-candidate"]>
	) => void;
};
