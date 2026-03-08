import { MultiPeerRTC, type MultiPeerRTCOptions } from "./index";

const originalStructuredClone = globalThis.structuredClone;

type TrackMock = {
  id: string;
  stop: jest.Mock<void, []>;
};

type StreamMock = {
  getAudioTracks: jest.Mock<TrackMock[], []>;
};

type SenderMock = {
  track: TrackMock;
  replaceTrack: jest.Mock<void, [TrackMock]>;
};

type PeerMock = {
  getSenders: jest.Mock<SenderMock[], []>;
  addTrack: jest.Mock<void, [TrackMock, StreamMock]>;
};

const createTrack = (id: string): TrackMock => ({
  id,
  stop: jest.fn(),
});

const createStream = (track?: TrackMock): StreamMock => ({
  getAudioTracks: jest.fn(() => (track ? [track] : [])),
});

const createPeer = (senders: SenderMock[] = []): PeerMock => ({
  getSenders: jest.fn(() => senders),
  addTrack: jest.fn(),
});

const createRtc = () => {
  const dataChannel = {
    addDataChannel: jest.fn(),
  } as unknown as MultiPeerRTCOptions["dataChannel"];

  return new MultiPeerRTC({
    dataChannel,
    sendSignal: jest.fn(),
  });
};

const setLocalStream = (rtc: MultiPeerRTC, stream?: StreamMock) => {
  (rtc as unknown as { localStream?: StreamMock }).localStream = stream;
};

const setPeers = (rtc: MultiPeerRTC, peers: Map<string, PeerMock>) => {
  (rtc as unknown as { peers: Map<string, PeerMock> }).peers = peers;
};

const getLocalStream = (rtc: MultiPeerRTC) =>
  (rtc as unknown as { localStream?: StreamMock }).localStream;

describe("MultiPeerRTC.addAudioTrack", () => {
  beforeAll(() => {
    if (!globalThis.structuredClone) {
      globalThis.structuredClone = <T>(value: T): T =>
        JSON.parse(JSON.stringify(value)) as T;
    }
  });

  afterAll(() => {
    globalThis.structuredClone = originalStructuredClone;
  });

  it("does not set localStream when stream has no audio track", () => {
    const rtc = createRtc();

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    rtc.addAudioTrack(createStream() as unknown as MediaStream);

    expect(warnSpy).toHaveBeenCalledWith(
      "No audio track in the provided stream",
    );
    expect(getLocalStream(rtc)).toBeUndefined();

    warnSpy.mockRestore();
  });
});

describe("MultiPeerRTC.replaceAudioTrack", () => {
  beforeAll(() => {
    if (!globalThis.structuredClone) {
      globalThis.structuredClone = <T>(value: T): T =>
        JSON.parse(JSON.stringify(value)) as T;
    }
  });

  afterAll(() => {
    globalThis.structuredClone = originalStructuredClone;
  });

  it("calls addAudioTrack when there is no local stream", () => {
    const rtc = createRtc();
    const stream = createStream(createTrack("new-track"));

    const addAudioTrackSpy = jest.spyOn(rtc, "addAudioTrack");

    rtc.replaceAudioTrack(stream as unknown as MediaStream);

    expect(addAudioTrackSpy).toHaveBeenCalledWith(
      stream as unknown as MediaStream,
    );
  });

  it("warns and exits when new stream has no audio track", () => {
    const rtc = createRtc();
    const oldTrack = createTrack("old-track");

    setLocalStream(rtc, createStream(oldTrack));

    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    rtc.replaceAudioTrack(createStream() as unknown as MediaStream);

    expect(warnSpy).toHaveBeenCalledWith(
      "No audio track in the provided stream",
    );
    expect(oldTrack.stop).not.toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("replaces matching sender track and stops previous local track", () => {
    const rtc = createRtc();

    const oldTrack = createTrack("old-track");
    const newTrack = createTrack("new-track");

    const sender = {
      track: oldTrack,
      replaceTrack: jest.fn(),
    };

    const peer = createPeer([sender]);

    setLocalStream(rtc, createStream(oldTrack));
    setPeers(rtc, new Map([["user-1", peer]]));

    const nextStream = createStream(newTrack);

    rtc.replaceAudioTrack(nextStream as unknown as MediaStream);

    expect(sender.replaceTrack).toHaveBeenCalledWith(newTrack);
    expect(peer.addTrack).not.toHaveBeenCalled();
    expect(oldTrack.stop).toHaveBeenCalledTimes(1);
    expect(getLocalStream(rtc)).toBe(nextStream);
  });

  it("adds track when peer has no senders", () => {
    const rtc = createRtc();

    const oldTrack = createTrack("old-track");
    const newTrack = createTrack("new-track");

    const peer = createPeer([]);

    setLocalStream(rtc, createStream(oldTrack));
    setPeers(rtc, new Map([["user-1", peer]]));

    const nextStream = createStream(newTrack);

    rtc.replaceAudioTrack(nextStream as unknown as MediaStream);

    expect(peer.addTrack).toHaveBeenCalledWith(newTrack, nextStream);
    expect(oldTrack.stop).toHaveBeenCalledTimes(1);
    expect(getLocalStream(rtc)).toBe(nextStream);
  });

  it("adds track when peer has senders but no matching old track sender", () => {
    const rtc = createRtc();

    const oldTrack = createTrack("old-track");
    const newTrack = createTrack("new-track");

    const sender = {
      track: createTrack("another-track"),
      replaceTrack: jest.fn(),
    };

    const peer = createPeer([sender]);

    setLocalStream(rtc, createStream(oldTrack));
    setPeers(rtc, new Map([["user-1", peer]]));

    const nextStream = createStream(newTrack);

    rtc.replaceAudioTrack(nextStream as unknown as MediaStream);

    expect(sender.replaceTrack).not.toHaveBeenCalled();
    expect(peer.addTrack).toHaveBeenCalledWith(newTrack, nextStream);
    expect(oldTrack.stop).toHaveBeenCalledTimes(1);
    expect(getLocalStream(rtc)).toBe(nextStream);
  });

  it("does not crash when old local stream has no audio track", () => {
    const rtc = createRtc();

    const newTrack = createTrack("new-track");
    const peer = createPeer([]);

    setLocalStream(rtc, createStream());
    setPeers(rtc, new Map([["user-1", peer]]));

    const nextStream = createStream(newTrack);

    expect(() =>
      rtc.replaceAudioTrack(nextStream as unknown as MediaStream),
    ).not.toThrow();
    expect(peer.addTrack).toHaveBeenCalledWith(newTrack, nextStream);
    expect(getLocalStream(rtc)).toBe(nextStream);
  });
});
