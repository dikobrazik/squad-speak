type Message = {
  id: string;
  from: string;
  data: string;
};

export class MessageEvent extends CustomEvent<Message> {
  constructor(id: string, from: string, data: string) {
    super("message", { detail: { id, from, data } });
  }
}

export class DataChannel extends EventTarget {
  private dataChannels = new Map<string, RTCDataChannel>();
  private messageHistory: { id: string; from: string; data: string }[] = [];

  constructor(private userId: string) {
    super();

    this.addEventListener("message", (message) => {
      const { id, from, data } = message;
      this.messageHistory.push({ id, from, data });
    });
  }

  addDataChannel(userId: string, dc: RTCDataChannel) {
    this.dataChannels.set(userId, dc);

    // this.sendMessageHistory(dc);

    dc.addEventListener("message", (event) => {
      const eventData = JSON.parse(event.data);

      if (eventData.type === "message") {
        this.dispatchEvent(
          new MessageEvent(eventData.id, userId, eventData.data),
        );
      } else if (eventData.type === "history") {
        for (const msg of eventData.data) {
          this.dispatchEvent(new MessageEvent(msg.id, msg.from, msg.data));
        }
      }
    });
  }

  send(data: string) {
    for (const dc of this.dataChannels.values()) {
      if (dc.readyState === "open") {
        const messageId = crypto.randomUUID();

        this.sendMessage(dc, messageId, data);

        this.dispatchEvent(new MessageEvent(messageId, this.userId, data));
      }
    }
  }

  // @ts-expect-error Override
  addEventListener(
    _type: "message",
    callback: ((event: Message) => void) | null,
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
