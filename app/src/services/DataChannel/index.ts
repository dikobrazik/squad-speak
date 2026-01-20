export type ChatMessage = {
  id: string;
  from: string;
  data: string;
  createdAt: number;
};

export class MessageEvent extends CustomEvent<ChatMessage> {
  constructor(id: string, from: string, data: string, createdAt: number) {
    super("message", { detail: { id, from, data, createdAt } });
  }
}

export class DataChannel extends EventTarget {
  private dataChannels = new Map<string, RTCDataChannel>();
  private messageHistory: {
    id: string;
    from: string;
    data: string;
    createdAt: number;
  }[] = [];

  constructor(private userId: string) {
    super();

    this.addEventListener("message", (message) => {
      const { id, from, data, createdAt } = message;
      this.messageHistory.push({ id, from, data, createdAt });
    });
  }

  addDataChannel(userId: string, dc: RTCDataChannel) {
    this.dataChannels.set(userId, dc);

    // this.sendMessageHistory(dc);

    dc.addEventListener("message", (event) => {
      const eventData = JSON.parse(event.data);

      if (eventData.type === "message") {
        this.dispatchEvent(
          new MessageEvent(
            eventData.id,
            userId,
            eventData.data,
            eventData.createdAt,
          ),
        );
      } else if (eventData.type === "history") {
        for (const msg of eventData.data) {
          this.dispatchEvent(
            new MessageEvent(msg.id, msg.from, msg.data, msg.createdAt),
          );
        }
      }
    });
  }

  send(data: string) {
    const messageId = crypto.randomUUID();

    this.dispatchEvent(
      new MessageEvent(messageId, this.userId, data, Date.now()),
    );

    for (const dc of this.dataChannels.values()) {
      if (dc.readyState === "open") {
        this.sendMessage(dc, messageId, data);
      }
    }
  }

  // @ts-expect-error Override
  addEventListener(
    _type: "message",
    callback: ((event: ChatMessage) => void) | null,
  ): void {
    super.addEventListener("message", (event) => {
      const message = (event as MessageEvent).detail;
      if (callback) {
        callback(message);
      }
    });
  }

  private sendMessage(dc: RTCDataChannel, messageId: string, data: string) {
    dc.send(JSON.stringify({ type: "message", id: messageId, data }));
  }

  private sendMessageHistory(dc: RTCDataChannel) {
    dc.send(JSON.stringify({ type: "history", data: this.messageHistory }));
  }
}
