// ES Module for Sound Synthesis
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.bgmInterval = null;
  }

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  }

  startBGM() {
    this.init();
    if (this.bgmInterval) return; // BGM already running
    
    // Soft, whimsical pentatonic arpeggio (C4, E4, F4, G4, A4, C5) for a forest theme
    const melody = [261.63, 329.63, 349.23, 392.00, 440.00, 523.25, 440.00, 392.00];
    let noteIdx = 0;
    
    this.bgmInterval = setInterval(() => {
      if (this.muted || !this.ctx) return;
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
        return;
      }
      
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      
      // Soft triangle wave for a cozy woodwind / music-box sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(melody[noteIdx], t);
      
      // Keep background music very soft
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.015, t + 0.05); // quick fade in
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55); // long decay
      
      osc.start(t);
      osc.stop(t + 0.6);
      
      noteIdx = (noteIdx + 1) % melody.length;
    }, 450); // soft tempo
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  setMute(state) {
    this.muted = state;
    if (this.muted) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  play(type) {
    if (this.muted) return;
    this.init();
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    
    const t = this.ctx.currentTime;
    
    switch(type) {
      case 'click': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.frequency.setValueAtTime(600, t);
        osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.1);
        osc.start(t);
        osc.stop(t + 0.1);
        break;
      }
      case 'roll': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(150, t);
        osc.frequency.linearRampToValueAtTime(300, t + 0.4);
        gain.gain.setValueAtTime(0.15, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.4);
        osc.start(t);
        osc.stop(t + 0.4);
        break;
      }
      case 'collect': {
        // Double sweet note
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);
        
        osc1.frequency.setValueAtTime(523.25, t); // C5
        osc1.frequency.setValueAtTime(659.25, t + 0.08); // E5
        osc2.frequency.setValueAtTime(783.99, t + 0.16); // G5
        
        gain.gain.setValueAtTime(0.1, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.35);
        
        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 0.35);
        osc2.stop(t + 0.35);
        break;
      }
      case 'sting': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, t);
        osc.frequency.linearRampToValueAtTime(80, t + 0.3);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.3);
        osc.start(t);
        osc.stop(t + 0.3);
        break;
      }
      case 'hazard': {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(100, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.5);
        gain.gain.setValueAtTime(0.2, t);
        gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
        osc.start(t);
        osc.stop(t + 0.5);
        break;
      }
      case 'win': {
        // Fanfare!
        const notes = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.frequency.setValueAtTime(freq, t + idx * 0.1);
          gain.gain.setValueAtTime(0.12, t + idx * 0.1);
          gain.gain.linearRampToValueAtTime(0.01, t + idx * 0.1 + 0.4);
          osc.start(t + idx * 0.1);
          osc.stop(t + idx * 0.1 + 0.4);
        });
        break;
      }
    }
  }
}

export const sound = new SoundEngine();
