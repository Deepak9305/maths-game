// Simple synthesizer using Web Audio API to avoid external assets
let audioCtx: AudioContext | null = null;
let musicInterval: ReturnType<typeof setInterval> | null = null;
let musicGain: GainNode | null = null;
let activeMusicTrack: 'menu' | 'game' | null = null;
let audioAvailable = true;

const GAME_MUSIC_VOLUME = 0.35;
const MENU_MUSIC_VOLUME = 0.16;
const MUSIC_FADE_SECONDS = 0.45;

const initAudio = (): AudioContext | null => {
  if (!audioAvailable) return null;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      void audioCtx.resume().catch(() => {
        // Browsers may require a user gesture before resuming audio.
      });
    }
    return audioCtx;
  } catch (e) {
    console.warn('Web Audio API unavailable, audio disabled', e);
    audioAvailable = false;
    return null;
  }
};

const ensureMusicGain = (ctx: AudioContext) => {
  if (!musicGain) {
    musicGain = ctx.createGain();
    musicGain.gain.value = 0;
    musicGain.connect(ctx.destination);
  }
  return musicGain;
};

const fadeMusicGain = (ctx: AudioContext, target: number) => {
  if (!musicGain) return;

  const now = ctx.currentTime;
  musicGain.gain.cancelScheduledValues(now);
  musicGain.gain.setValueAtTime(Math.max(0, musicGain.gain.value), now);
  musicGain.gain.linearRampToValueAtTime(target, now + MUSIC_FADE_SECONDS);
};

const clearMusicLoop = () => {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
  activeMusicTrack = null;
};

// Enhanced tone generator with ADSR envelope for cleaner sound
const playTone = (freq: number, type: OscillatorType, duration: number, startTime = 0, vol = 0.1) => {
  const ctx = initAudio();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, ctx.currentTime + startTime);
  
  // ADSR Envelope to prevent clicks and make sounds punchy
  const now = ctx.currentTime + startTime;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(vol, now + 0.01); // Attack
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration); // Decay/Release

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.1); // Allow tail to fade
};

export const playSound = {
  click: () => {
    playTone(800, 'sine', 0.05, 0, 0.05);
  },
  correct: () => {
    // Pleasant major triad
    playTone(880, 'sine', 0.1, 0, 0.1); // A5
    playTone(1108, 'sine', 0.1, 0.05, 0.1); // C#6
    playTone(1318, 'sine', 0.2, 0.1, 0.1); // E6
  },
  wrong: () => {
    // Discordant buzz
    playTone(200, 'sawtooth', 0.3, 0, 0.2);
    playTone(150, 'sawtooth', 0.3, 0.1, 0.2);
  },
  levelUp: () => {
    const ctx = initAudio();
    // Fast upward arpeggio
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
      playTone(freq, 'square', 0.1, i * 0.08, 0.1);
    });
  },
  powerUp: () => {
    playTone(1200, 'sine', 0.1, 0, 0.2);
    playTone(1500, 'sine', 0.3, 0.1, 0.2);
  }
};

export const music = {
  startMenuMusic: () => {
    if (activeMusicTrack === 'menu' && musicInterval) return;

    clearMusicLoop();
    const ctx = initAudio();
    if (!ctx) return;

    const music_gain = ensureMusicGain(ctx);
    activeMusicTrack = 'menu';
    fadeMusicGain(ctx, MENU_MUSIC_VOLUME);

    // Original, low-volume ambient progression. No external audio asset or recording.
    const chords = [
      [220, 261.63, 329.63],
      [196, 246.94, 293.66],
      [174.61, 220, 261.63],
      [196, 246.94, 293.66]
    ];
    const chordDuration = 5.6;
    const playChord = (chord: number[]) => {
      const start = ctx.currentTime;

      chord.forEach((frequency, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        const voiceVolume = index === 0 ? 0.035 : 0.025;

        osc.type = index === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(frequency, start);
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, start);
        filter.Q.value = 0.5;

        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.linearRampToValueAtTime(voiceVolume, start + 0.8);
        gain.gain.linearRampToValueAtTime(voiceVolume * 0.7, start + 3.8);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + chordDuration);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(music_gain);
        osc.start(start);
        osc.stop(start + chordDuration + 0.1);
      });

      // A barely-there high shimmer keeps the menu feeling spacious without adding percussion.
      const shimmer = ctx.createOscillator();
      const shimmerGain = ctx.createGain();
      shimmer.type = 'sine';
      shimmer.frequency.setValueAtTime(chord[2] * 2, start);
      shimmerGain.gain.setValueAtTime(0.0001, start);
      shimmerGain.gain.linearRampToValueAtTime(0.008, start + 1.1);
      shimmerGain.gain.exponentialRampToValueAtTime(0.0001, start + 4.8);
      shimmer.connect(shimmerGain);
      shimmerGain.connect(music_gain);
      shimmer.start(start);
      shimmer.stop(start + 5);
    };

    let chordIndex = 0;
    playChord(chords[chordIndex]);
    musicInterval = setInterval(() => {
      if (audioCtx?.state === 'suspended') void audioCtx.resume().catch(() => { });
      chordIndex = (chordIndex + 1) % chords.length;
      playChord(chords[chordIndex]);
    }, 5200);
  },
  startGameMusic: (difficulty: string) => {
    clearMusicLoop();

    const ctx = initAudio();
    if (!ctx) return;
    let step = 0;

    // Dynamic tempo based on difficulty
    let tempo = 105;
    if (difficulty === 'easy') tempo = 95;
    if (difficulty === 'medium') tempo = 110;
    if (difficulty === 'hard') tempo = 125;
    if (difficulty === 'survival') tempo = 115;

    const stepTime = (60 / tempo) * 1000 / 4; // 16th notes

    const music_gain = ensureMusicGain(ctx);
    activeMusicTrack = 'game';
    fadeMusicGain(ctx, GAME_MUSIC_VOLUME);
    
    // Deep driving bass notes sequence (A Minor)
    const bassSequence = [55, 55, 49, 49, 41.2, 41.2, 49, 49]; // A1, G1, E1...

    musicInterval = setInterval(() => {
      if (audioCtx?.state === 'suspended') audioCtx.resume();
      
      const t = ctx.currentTime;
      
      // 1. KICK - Deep & Thumpy (Heartbeat style)
      // Playing 4-on-the-floor
      if (step % 4 === 0) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(100, t); // Lower pitch kick
        osc.frequency.exponentialRampToValueAtTime(0.01, t + 0.4);
        
        gain.gain.setValueAtTime(0.8, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        
        osc.connect(gain);
        gain.connect(music_gain!);
        osc.start(t);
        osc.stop(t + 0.4);
      }

      // 2. BASS - Dark & Filtered (The driving force)
      // Playing 8th notes
      if (step % 2 === 0) { 
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();
        
        osc.type = 'sawtooth';
        const note = bassSequence[Math.floor((step / 8) % bassSequence.length)];
        osc.frequency.setValueAtTime(note, t);

        // Lowpass filter to remove harsh buzz, making it deep and rumbling
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, t); // Very low cutoff
        filter.Q.value = 2; // Slight resonance for punch

        // Envelope
        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(music_gain!);
        osc.start(t);
        osc.stop(t + 0.3);
      }

      // 3. HI-HAT - Soft ticks (High frequency texture)
      if (step % 4 === 2) {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         const filter = ctx.createBiquadFilter();
         
         // Use square wave as base for metallic sound
         osc.type = 'square';
         osc.frequency.setValueAtTime(1000, t); 
         
         // Highpass filter to leave only the "tick"
         filter.type = 'highpass';
         filter.frequency.setValueAtTime(3000, t);

         gain.gain.setValueAtTime(0.08, t);
         gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

         osc.connect(filter);
         filter.connect(gain);
         gain.connect(music_gain!);
         osc.start(t);
         osc.stop(t + 0.05);
      }

      // 4. ATMOSPHERE - Sparse Radar Ping (Every 2 bars)
      // Adds space without being repetitive
      if (step % 32 === 0) {
         const osc = ctx.createOscillator();
         const gain = ctx.createGain();
         
         osc.type = 'sine';
         osc.frequency.setValueAtTime(880, t); // High A
         
         gain.gain.setValueAtTime(0, t);
         gain.gain.linearRampToValueAtTime(0.1, t + 0.05); // Slow attack
         gain.gain.exponentialRampToValueAtTime(0.001, t + 1.5); // Long echo/decay
         
         osc.connect(gain);
         gain.connect(music_gain!);
         osc.start(t);
         osc.stop(t + 2);
      }

      step++;
    }, stepTime);
  },
  stop: () => {
    clearMusicLoop();
    if (musicGain && audioCtx) {
      fadeMusicGain(audioCtx, 0);
    }
  }
};
