import { getNoteFrequency } from "./utils";

describe("SoundService", () => {
  it.each([
    ["D0", 18.35],
    ["F2", 87.31],
    ["C#6", 1108.73],
    ["Db6", 1108.73],
    ["A4", 440],
    ["C4", 261.63],
    ["E4", 329.63],
    ["G4", 392.0],
    ["Bb4", 466.16],
  ])("should return correct frequency for note %s - %f Hz", (note, expectedFrequency) => {
    const freq = getNoteFrequency(note as any);
    expect(freq).toBeCloseTo(expectedFrequency, 1);
  });
});
