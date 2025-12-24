import type { SessionStatus } from ".";

export type SseData =
	| {
			status:
				| SessionStatus.EXPIRED
				| SessionStatus.SCANNED
				| SessionStatus.PENDING;
	  }
	| {
			status: SessionStatus.CONFIRMED;
			telegramId: number;
			accessToken: string;
	  };
