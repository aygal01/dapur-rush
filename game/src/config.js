// Dapur Rush — the kitchen's fixed facts: view size, the day, ingredients,
// recipes and where every station stands. Nothing here changes while playing.

export const VIEW = { width: 1280, height: 800 };

/** Length of one service day, in seconds. */
export const DAY_SECONDS = 120;

/** Stars on the board at the start of the day; an expired order costs one. */
export const START_STARS = 5;

/** How long holding the interact key at the chopping board takes, in seconds. */
export const CHOP_SECONDS = 0.7;

/** The plates the plating counter can hold at once. */
export const MAX_PLATES = 2;

/** Orders on the board at once, early and late in the day. */
export const MAX_ORDERS_EARLY = 3;
export const MAX_ORDERS_LATE = 4;

/**
 * One ingredient. `crate` names its crate label; `chop` whether the board
 * prepares it; `device` the cooker it belongs in ('pan', 'grill', 'pot') or
 * null when chopping alone readies it; `cook` and `burn` are the seconds the
 * device takes and the extra seconds before the food burns.
 */
export const INGREDIENTS = {
  rice:     { name: 'Beras',  short: 'Nasi',   chop: false, device: 'pan',   cook: 4.0, burn: 6 },
  noodle:   { name: 'Mie',    short: 'Mie',    chop: false, device: 'pan',   cook: 3.5, burn: 6 },
  egg:      { name: 'Telur',  short: 'Telur',  chop: false, device: 'pan',   cook: 3.0, burn: 5 },
  chicken:  { name: 'Ayam',   short: 'Ayam',   chop: true,  device: 'grill', cook: 4.5, burn: 6 },
  chili:    { name: 'Cabai',  short: 'Cabai',  chop: true,  device: null,    cook: 0,   burn: 0 },
  veg:      { name: 'Sayur',  short: 'Sayur',  chop: true,  device: null,    cook: 0,   burn: 0 },
  meatball: { name: 'Bakso',  short: 'Bakso',  chop: false, device: 'pot',   cook: 4.0, burn: 7 },
};

export const INGREDIENT_IDS = Object.keys(INGREDIENTS);

/** A component key names one prepared part of a dish, e.g. 'rice:cooked'. */
export function partKey(ingredient, stage) {
  return `${ingredient}:${stage}`;
}

/**
 * The menu. `parts` are the component keys a plate must hold, exactly, to
 * become the dish; `price` is what a served order pays before the tip.
 */
export const RECIPES = {
  nasiGoreng: { name: 'Nasi Goreng', price: 18, parts: ['rice:cooked', 'egg:cooked', 'chili:chopped'] },
  mieGoreng:  { name: 'Mie Goreng',  price: 18, parts: ['noodle:cooked', 'egg:cooked', 'veg:chopped'] },
  sateAyam:   { name: 'Sate Ayam',   price: 15, parts: ['chicken:cooked', 'chili:chopped'] },
  bakso:      { name: 'Bakso',      price: 14, parts: ['meatball:cooked', 'veg:chopped'] },
};

export const RECIPE_IDS = Object.keys(RECIPES);

/** The recipe whose parts are exactly `parts` (same multiset), else null. */
export function matchRecipe(parts) {
  const sorted = [...parts].sort();
  for (const id of RECIPE_IDS) {
    const want = [...RECIPES[id].parts].sort();
    if (want.length === sorted.length && want.every((part, i) => part === sorted[i])) return id;
  }
  return null;
}

/**
 * The kitchen's stations. Crates stand down the left wall; cookers and the
 * board down the middle; the plating counter in the middle of the room; the
 * serving counter top right and the bin in the far corner.
 */
export const STATIONS = [
  { id: 'crate-rice',     type: 'crate', ingredient: 'rice',     x: 16,  y: 148, w: 108, h: 62 },
  { id: 'crate-egg',      type: 'crate', ingredient: 'egg',      x: 16,  y: 222, w: 108, h: 62 },
  { id: 'crate-chicken',  type: 'crate', ingredient: 'chicken',  x: 16,  y: 296, w: 108, h: 62 },
  { id: 'crate-chili',    type: 'crate', ingredient: 'chili',    x: 16,  y: 370, w: 108, h: 62 },
  { id: 'crate-veg',      type: 'crate', ingredient: 'veg',      x: 16,  y: 444, w: 108, h: 62 },
  { id: 'crate-noodle',   type: 'crate', ingredient: 'noodle',   x: 16,  y: 518, w: 108, h: 62 },
  { id: 'crate-meatball', type: 'crate', ingredient: 'meatball', x: 16,  y: 592, w: 108, h: 62 },
  { id: 'board',          type: 'board',                          x: 176, y: 148, w: 128, h: 84 },
  { id: 'stove',          type: 'stove',                          x: 176, y: 274, w: 128, h: 168 },
  { id: 'grill',          type: 'grill',                          x: 176, y: 478, w: 128, h: 84 },
  { id: 'pot',            type: 'pot',                            x: 176, y: 596, w: 128, h: 84 },
  { id: 'plating',        type: 'plating',                        x: 430, y: 330, w: 300, h: 110 },
  { id: 'serving',        type: 'serving',                        x: 900, y: 148, w: 330, h: 76 },
  { id: 'bin',            type: 'bin',                            x: 1160, y: 690, w: 72, h: 72 },
];

/** The floor the cook may walk on (the order board owns the top strip). */
export const FLOOR = { x: 8, y: 140, w: 1264, h: 652 };

/** Where the cook stands at the start of the day. */
export const PLAYER_START = { x: 620, y: 560 };
export const PLAYER_SPEED = 265;
export const PLAYER_RADIUS = 20;

/** The gap allowed between the cook and a station's edge for using it. */
export const INTERACT_RANGE = 64;
