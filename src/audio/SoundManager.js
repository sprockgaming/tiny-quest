// SoundManager — procedural audio using Web Audio API through Phaser's AudioContext.
// No external audio files required. All sounds are synthesised at runtime.

export class SoundManager {
  constructor(scene) {
    this._scene = scene;

    // Guard: Phaser may use a NullSoundManager (e.g. test env)
    if (!scene.sound || !scene.sound.context) {
      this._ctx = null;
      return;
    }

    this._ctx = scene.sound.context;

    // Master gain → browser destination
    this._master = this._ctx.createGain();
    this._master.gain.value = 0.55;
    this._master.connect(this._ctx.destination);

    // Music gain → master
    this._musicGain = this._ctx.createGain();
    this._musicGain.gain.value = 0.28;
    this._musicGain.connect(this._master);

    // SFX gain → master
    this._sfxGain = this._ctx.createGain();
    this._sfxGain.gain.value = 0.72;
    this._sfxGain.connect(this._master);

    this._muted = false;
    this._musicPlaying = false;
    this._musicTimer = null;
    this._stepCooldown = 0; // ms

    this._buffers = this._bakeAllSFX();
  }

  // ── Public API ────────────────────────────────────────────────────────────

  play(name) {
    if (!this._ctx || this._muted) return;
    const buf = this._buffers[name];
    if (!buf) return;
    this._playBuffer(buf, this._sfxGain);
  }

  /** Throttled step sound — safe to call every frame. */
  playStep(delta) {
    if (!this._ctx || this._muted) return;
    this._stepCooldown -= delta;
    if (this._stepCooldown > 0) return;
    this._stepCooldown = 350; // ms between footsteps
    this._playBuffer(this._buffers.step, this._sfxGain, 0.45);
  }

  startMusic() {
    if (!this._ctx || this._musicPlaying) return;
    this._musicPlaying = true;
    this._runMusicLoop();
  }

  stopMusic() {
    this._musicPlaying = false;
    if (this._musicTimer) {
      this._musicTimer.remove(false);
      this._musicTimer = null;
    }
  }

  /** Toggle mute. Returns new muted state. */
  toggleMute() {
    if (!this._ctx) return false;
    this._muted = !this._muted;
    this._master.gain.value = this._muted ? 0 : 0.55;
    return this._muted;
  }

  get muted() { return this._muted; }

  // ── SFX Buffer Baking ────────────────────────────────────────────────────

  _bakeAllSFX() {
    const bake = (dur, fn) => this._makeBuffer(dur, fn);
    const sr = this._ctx ? this._ctx.sampleRate : 44100;

    return {
      // Footstep — muffled noise thump
      step: bake(0.08, (d, r) => {
        for (let i = 0; i < d.length; i++) {
          const t = i / r;
          const env = Math.exp(-t * 55) * 0.35;
          d[i] = (Math.random() * 2 - 1) * env;
        }
      }),

      // UI click — short sine blip
      click: bake(0.06, (d, r) => {
        for (let i = 0; i < d.length; i++) {
          const t = i / r;
          const env = Math.exp(-t * 90);
          d[i] = Math.sin(2 * Math.PI * 900 * t) * env * 0.55;
        }
      }),

      // Item pickup — quick ascending arpeggio (C E G)
      pickup: bake(0.45, (d, r) => {
        const notes = [261.63, 329.63, 392.00];
        const noteDur = 0.12;
        for (let i = 0; i < d.length; i++) {
          const t = i / r;
          const ni = Math.floor(t / noteDur);
          if (ni >= notes.length) break;
          const nt = t - ni * noteDur;
          const env = Math.exp(-nt * 20) * (1 - Math.exp(-nt * 200));
          d[i] = (
            Math.sin(2 * Math.PI * notes[ni] * t) * 0.5 +
            Math.sin(2 * Math.PI * notes[ni] * 2 * t) * 0.25
          ) * env * 0.55;
        }
      }),

      // Quest complete — triumphant four-note fanfare (C E G C5)
      complete: bake(2.0, (d, r) => {
        const notes = [261.63, 329.63, 392.00, 523.25];
        const durs  = [0.22,   0.22,   0.22,   0.80 ];
        let base = 0;
        for (let ni = 0; ni < notes.length; ni++) {
          const end = base + durs[ni];
          for (let i = Math.floor(base * r); i < Math.min(Math.floor(end * r), d.length); i++) {
            const t = i / r;
            const nt = t - base;
            const env = (1 - Math.exp(-nt * 60)) * Math.exp(-nt * 2.5);
            d[i] = (
              Math.sin(2 * Math.PI * notes[ni] * t) * 0.55 +
              Math.sin(2 * Math.PI * notes[ni] * 2 * t) * 0.22 +
              Math.sin(2 * Math.PI * notes[ni] * 3 * t) * 0.11
            ) * env * 0.7;
          }
          base = end;
        }
      }),

      // Dialog open — upward sweep
      dialogOpen: bake(0.18, (d, r) => {
        for (let i = 0; i < d.length; i++) {
          const t = i / r;
          const freq = 400 + 600 * (t / 0.18);
          const env = (1 - Math.exp(-t * 60)) * Math.exp(-t * 15);
          d[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.4;
        }
      }),

      // Dialog close — downward sweep
      dialogClose: bake(0.12, (d, r) => {
        for (let i = 0; i < d.length; i++) {
          const t = i / r;
          const freq = 700 - 400 * (t / 0.12);
          const env = Math.exp(-t * 30);
          d[i] = Math.sin(2 * Math.PI * freq * t) * env * 0.35;
        }
      }),

      // Star / reward sound — sparkle arpeggio
      star: bake(0.6, (d, r) => {
        const notes = [523.25, 659.25, 784.00, 1046.50];
        const noteDur = 0.14;
        for (let i = 0; i < d.length; i++) {
          const t = i / r;
          const ni = Math.floor(t / noteDur);
          if (ni >= notes.length) break;
          const nt = t - ni * noteDur;
          const env = Math.exp(-nt * 18) * (1 - Math.exp(-nt * 300));
          d[i] = Math.sin(2 * Math.PI * notes[ni] * t) * env * 0.5;
        }
      }),
    };
  }

  _makeBuffer(duration, fn) {
    if (!this._ctx) return null;
    const sr = this._ctx.sampleRate;
    const n  = Math.max(1, Math.floor(sr * duration));
    const buf = this._ctx.createBuffer(1, n, sr);
    fn(buf.getChannelData(0), sr, n);
    return buf;
  }

  _playBuffer(buf, destination, gainOverride) {
    if (!buf || !this._ctx) return;
    const src = this._ctx.createBufferSource();
    src.buffer = buf;
    if (gainOverride !== undefined) {
      const g = this._ctx.createGain();
      g.gain.value = gainOverride;
      src.connect(g);
      g.connect(destination);
    } else {
      src.connect(destination);
    }
    src.start();
  }

  // ── Background Music Scheduler ───────────────────────────────────────────
  // Pentatonic ambient melody (C major pentatonic: C D E G A)

  _runMusicLoop() {
    if (!this._musicPlaying || !this._ctx) return;

    const ctx = this._ctx;
    const now = ctx.currentTime + 0.05;

    // ── Chord pad (slow whole notes) ──────────────────────────────────
    const PAD_CHORD = [130.81, 164.81, 196.00]; // C3 E3 G3
    PAD_CHORD.forEach(freq => {
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, now);
      env.gain.linearRampToValueAtTime(0.12, now + 0.6);
      env.gain.setValueAtTime(0.12, now + 7.0);
      env.gain.linearRampToValueAtTime(0, now + 8.0);
      osc.connect(env); env.connect(this._musicGain);
      osc.start(now); osc.stop(now + 8.1);
    });

    // ── Arpeggio melody ───────────────────────────────────────────────
    // 8 bars × 4 beats, two notes per beat = 64 events; beat = 0.5 s (120 bpm)
    const PENTA = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const melody = [
      0,2,4,7, 4,2,0,2, 4,7,5,4, 2,0,4,2,   // bars 1-2
      5,7,4,2, 0,2,4,5, 7,5,4,2, 0,4,2,0,   // bars 3-4
    ];
    const beat = 0.38; // slightly slower than 120bpm for ambient feel

    melody.forEach((ni, i) => {
      const t = now + i * beat;
      const freq = PENTA[ni % PENTA.length];
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      const dur = beat * 0.82;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.18, t + 0.025);
      env.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.connect(env); env.connect(this._musicGain);
      osc.start(t); osc.stop(t + dur + 0.01);
    });

    // ── Bass pulse ────────────────────────────────────────────────────
    const bassBeat = beat * 4;
    const bassNotes = [65.41, 73.42, 65.41, 73.42]; // C2 D2 pattern
    bassNotes.forEach((freq, i) => {
      const t = now + i * bassBeat;
      const osc = ctx.createOscillator();
      const env = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      env.gain.setValueAtTime(0, t);
      env.gain.linearRampToValueAtTime(0.25, t + 0.05);
      env.gain.exponentialRampToValueAtTime(0.001, t + bassBeat * 0.85);
      osc.connect(env); env.connect(this._musicGain);
      osc.start(t); osc.stop(t + bassBeat);
    });

    // Schedule next loop slightly before this one ends
    const loopDur = melody.length * beat;
    this._musicTimer = this._scene.time.delayedCall(
      (loopDur - 0.3) * 1000,
      () => {
        if (this._musicPlaying) {
          this._musicTimer = null;
          this._runMusicLoop();
        }
      }
    );
  }
}
