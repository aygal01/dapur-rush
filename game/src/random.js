// A small seeded random source (mulberry32), so a day — and a staged
// screenshot — plays out the same way every time for a given seed.

export function createRandom(seed) {
  let state = (seed >>> 0) || 1;
  function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  return {
    next,
    /** A whole number from 0 to n - 1. */
    below(n) {
      return Math.floor(next() * n);
    },
    /** One element of the list. */
    pick(list) {
      return list[Math.floor(next() * list.length)];
    },
    /** A number between min and max. */
    range(min, max) {
      return min + next() * (max - min);
    },
  };
}
