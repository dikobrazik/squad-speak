export type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Note =
  | "C"
  | "C#"
  | "Db"
  | "D"
  | "D#"
  | "Eb"
  | "E"
  | "F"
  | "F#"
  | "Gb"
  | "G"
  | "G#"
  | "Ab"
  | "A"
  | "A#"
  | "Bb"
  | "B";

export function getNoteFrequency(note: `${Note}${Octave}`): number {
  const baseNote = note.slice(0, -1) as Note;
  const octave = parseInt(note.slice(-1), 10);

  const noteShiftMap = {
    C: -9,
    "C#": -8,
    Db: -8,
    D: -7,
    "D#": -6,
    Eb: -6,
    E: -5,
    F: -4,
    "F#": -3,
    Gb: -3,
    G: -2,
    "G#": -1,
    Ab: -1,
    A: 0,
    "A#": 1,
    Bb: 1,
    B: 2,
  };

  const octaveShift = (octave - 4) * 12;
  const semitoneShift = noteShiftMap[baseNote] + octaveShift;
  const frequency = 440.0 * 2 ** (semitoneShift / 12);

  return frequency;
}
