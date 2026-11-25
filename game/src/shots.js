// The staged scenes behind ?shot=start|play|end&seed=N. Each one arranges
// the real game state by hand — the same stations, plates, devices and
// orders a live game would hold — so the frame is the game itself, frozen.
import { RECIPES } from './config.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

/**
 * Set `world` to the named scene and return the screen to draw over it.
 * Any name other than 'play' or 'end' is the start scene.
 */
export function stageShot(name, world) {
  const state = world.state;
  world.reset();

  if (name === 'play') {
    // Mid-service, day well under way: three orders up, food on the move.
    state.elapsed = 46;
    state.dayLeft = 74;
    state.score = 86;
    state.served = 5;
    state.missed = 1;
    state.stars = 4;
    state.orders = [];
    world.addOrder('nasiGoreng', 0.62);
    world.addOrder('mieGoreng', 0.35);
    world.addOrder('sateAyam', 0.82);

    // One pan of rice halfway, an egg already fried and waiting.
    state.pans[0] = { ing: 'rice', t: 2.2, announced: false };
    state.pans[1] = { ing: 'egg', t: 3.4, announced: true };
    // Chicken grilling, meatballs boiling.
    state.grill = { ing: 'chicken', t: 1.6, announced: false };
    state.pot = { ing: 'meatball', t: 3.1, announced: false };

    // On the counter: a Nasi Goreng mid-assembly (rice and egg in, chili
    // still missing) and a finished Sate Ayam, ready to serve.
    state.plates = [
      { parts: ['rice:cooked', 'egg:cooked'], dish: null },
      { parts: [...RECIPES.sateAyam.parts], dish: 'sateAyam' },
    ];

    // The cook hurries toward the counter carrying the missing chili.
    state.player.x = 545;
    state.player.y = 490;
    state.player.faceX = 0;
    state.player.faceY = -1;
    state.player.carrying = { kind: 'item', ing: 'chili', stage: 'chopped' };
    world.popup(706, 300, '+ Cabai', '#fff7e0');
    return SCREEN_PLAY;
  }

  if (name === 'end') {
    // The day is done: a good service, a few orders lost.
    state.elapsed = 120;
    state.dayLeft = 0;
    state.over = true;
    state.score = 214;
    state.served = 12;
    state.missed = 3;
    state.stars = 2;
    state.orders = [];
    state.pans[0] = { ing: 'rice', t: 3.2, announced: true };
    state.plates = [{ parts: [...RECIPES.bakso.parts], dish: 'bakso' }];
    state.player.x = 620;
    state.player.y = 520;
    return SCREEN_OVER;
  }

  // Start scene: a quiet kitchen before the doors open.
  state.orders = [];
  return SCREEN_TITLE;
}
