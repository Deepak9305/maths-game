// Simple synthesizer using Web Audio API to avoid external assets
let audioCtx: AudioContext | null = null;

const initAudio = () => {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
};

const playTone = (freq: number, type: OscillatorType, duration: number, startTime = 0) => {
  const ctx = initAudio();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  gain.gain.setValueAtTime(0.1, ctx.currentTime + startTime);
  gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(ctx.currentTime + startTime);
  osc.stop(ctx.currentTime + startTime + duration);
};

export const playSound = {
  click: () => {
    playTone(600, 'sine', 0.05);
  },
  correct: () => {
    playTone(600, 'sine', 0.1);
    playTone(800, 'sine', 0.1, 0.1);
    playTone(1200, 'triangle', 0.3, 0.2);
  },
  wrong: () => {
    playTone(300, 'sawtooth', 0.2);
    playTone(200, 'sawtooth', 0.4, 0.1);
  },
  levelUp: () => {
    const ctx = initAudio();
    const now = ctx.currentTime;
    [440, 554, 659, 880].forEach((freq, i) => {
      playTone(freq, 'square', 0.2, i * 0.1);
    });
    playTone(880, 'square', 0.6, 0.4);
  },
  powerUp: () => {
    playTone(1200, 'sine', 0.5);
  }
};
