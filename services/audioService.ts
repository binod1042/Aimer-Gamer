class AudioService {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);
      this.masterGain.gain.value = 0.3; // Master volume
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playHit() {
    this.init();
    if (!this.ctx || !this.masterGain) return;
    
    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    // High pitch "coin" sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(1800, t + 0.1);
    
    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playMiss() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Low pitch "dull" sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.linearRampToValueAtTime(100, t + 0.15);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);

    osc.start(t);
    osc.stop(t + 0.15);
  }

  playTick() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Short wooden click
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    osc.start(t);
    osc.stop(t + 0.05);
  }

  playStart() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Rising power up sound
    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.3);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.5, t + 0.1);
    gain.gain.linearRampToValueAtTime(0, t + 0.3);

    osc.start(t);
    osc.stop(t + 0.3);
  }

  playGameOver() {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.connect(gain);
    gain.connect(this.masterGain);

    // Falling sound
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.5);

    gain.gain.setValueAtTime(0.5, t);
    gain.gain.linearRampToValueAtTime(0, t + 0.5);

    osc.start(t);
    osc.stop(t + 0.5);
  }
}

export const audioService = new AudioService();
