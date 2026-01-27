import { getNoteFrequency, type Note, type Octave } from "./utils";

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
    osc.frequency.setValueAtTime(getNoteFrequency(freq), startTime);
    // Огибающая для конкретной ноты (плавное появление и затухание)
    noteGain.gain.setValueAtTime(1, startTime);
    noteGain.gain.linearRampToValueAtTime(0.2, startTime + 0.05);
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + length);

    osc.connect(noteGain);
    noteGain.connect(this.masterGain);

    osc.start(startTime);
    osc.stop(startTime + length);
  }
}

export const soundService = new SoundService();
