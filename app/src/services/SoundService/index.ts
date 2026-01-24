type Octave = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
type Note =
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

export class SoundService {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private muteGain: GainNode;

  constructor() {
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.muteGain = this.ctx.createGain();

    this.masterGain.connect(this.muteGain);
    this.muteGain.connect(this.ctx.destination);
  }

  mute() {
    this.muteGain.gain.value = 0;
  }

  unmute() {
    this.muteGain.gain.value = 1;
  }

  playJoinSound(duration: number = 0.5) {
    this.createNote("C5", 0.4);
    this.createNote("F5", 0.5, 0.1);

    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(
      0.001,
      this.ctx.currentTime + duration,
      duration,
    );
  }

  playLeaveSound(duration: number = 0.5) {
    this.createNote("F5", 0.4);
    this.createNote("C5", 0.5, 0.1);

    this.masterGain.gain.setValueAtTime(1, this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(
      0.001,
      this.ctx.currentTime + duration,
      duration,
    );
  }

  private createNote(
    freq: `${Note}${Octave}`,
    length: number,
    startOffset: number = 0,
  ) {
    const osc = this.ctx.createOscillator();
    const noteGain = this.ctx.createGain();

    const startTime = this.ctx.currentTime + startOffset;

    osc.type = "sine"; // Мягкая волна
    osc.frequency.setValueAtTime(
      SoundService.getNoteFrequency(freq),
      startTime,
    );
    // Огибающая для конкретной ноты (плавное появление и затухание)
    noteGain.gain.setValueAtTime(1, startTime);
    noteGain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + length);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + length);
  }

  static getNoteFrequency(note: `${Note}${Octave}`): number {
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
}

export const soundService = new SoundService();
