// Tiny kitchen sounds made with the WebAudio oscillator — no sound files.
// The context opens lazily on the first user gesture; staged screenshots and
// muted browsers simply stay silent.

export function createAudio() {
  let context = null;

  function open() {
    if (context) {
      if (context.state === 'suspended') context.resume();
      return context;
    }
    try {
      context = new (window.AudioContext || window.webkitAudioContext)();
    } catch {
      context = null;
    }
    return context;
  }

  function tone(freq, seconds, type = 'square', volume = 0.05, when = 0) {
    const ctx = open();
    if (!ctx) return;
    const start = ctx.currentTime + when;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(gain).connect(ctx.destination);
    osc.start(start);
    osc.stop(start + seconds);
  }

  return {
    unlock() {
      open();
    },
    chop() {
      tone(180, 0.05, 'square', 0.04);
    },
    pickup() {
      tone(520, 0.06, 'sine', 0.05);
    },
    place() {
      tone(340, 0.06, 'sine', 0.05);
    },
    done() {
      tone(880, 0.09, 'sine', 0.06);
      tone(1320, 0.12, 'sine', 0.05, 0.08);
    },
    serve() {
      tone(660, 0.09, 'triangle', 0.07);
      tone(880, 0.09, 'triangle', 0.07, 0.09);
      tone(990, 0.16, 'triangle', 0.07, 0.18);
    },
    error() {
      tone(140, 0.16, 'sawtooth', 0.05);
    },
    burn() {
      tone(220, 0.2, 'sawtooth', 0.06);
      tone(180, 0.24, 'sawtooth', 0.06, 0.1);
    },
    expire() {
      tone(392, 0.12, 'triangle', 0.06);
      tone(311, 0.2, 'triangle', 0.06, 0.11);
    },
  };
}
