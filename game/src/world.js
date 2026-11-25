// Dapur Rush — the day's simulation: the cook, the cookers, the plates and
// the order board. Pure rules, no drawing: step() advances the state and
// reports what happened as event bits so the shell can play sounds.
import {
  CHOP_SECONDS, DAY_SECONDS, FLOOR, INGREDIENTS, INTERACT_RANGE, MAX_ORDERS_EARLY,
  MAX_ORDERS_LATE, MAX_PLATES, PLAYER_RADIUS, PLAYER_SPEED, PLAYER_START, RECIPES,
  RECIPE_IDS, STATIONS, START_STARS, matchRecipe, partKey,
} from './config.js';

export const EVENT_PICKUP = 1;
export const EVENT_PLACE = 2;
export const EVENT_CHOP = 4;
export const EVENT_CHOP_DONE = 8;
export const EVENT_DONE = 16;
export const EVENT_SERVE = 32;
export const EVENT_ERROR = 64;
export const EVENT_BURN = 128;
export const EVENT_EXPIRE = 256;
export const EVENT_OVER = 512;

/** A fresh cooker slot: one item being cooked, timed from zero. */
function emptySlot() {
  return null;
}

export function createWorld(random) {
  const state = {
    elapsed: 0,
    dayLeft: DAY_SECONDS,
    over: false,
    ruined: false,
    score: 0,
    served: 0,
    missed: 0,
    stars: START_STARS,
    player: { x: PLAYER_START.x, y: PLAYER_START.y, faceX: 0, faceY: 1, walk: 0, carrying: null, chopT: 0 },
    pans: [emptySlot(), emptySlot()],
    grill: emptySlot(),
    pot: emptySlot(),
    plates: [],
    orders: [],
    spawnT: 0,
    nextOrderId: 1,
    popups: [],
    shake: 0,
    near: null,
    message: '',
  };

  function popup(x, y, text, color = '#fff7e0') {
    state.popups.push({ x, y, text, color, t: 0, life: 1.15 });
  }

  function addOrder(recipeId, patienceFrac = null) {
    const progress = state.elapsed / DAY_SECONDS;
    const base = 48 - 18 * progress;
    const patienceMax = base * random.range(0.9, 1.12);
    const order = {
      id: state.nextOrderId,
      recipe: recipeId,
      price: RECIPES[recipeId].price,
      patience: patienceFrac === null ? patienceMax : patienceMax * patienceFrac,
      patienceMax,
    };
    state.nextOrderId += 1;
    state.orders.push(order);
    return order;
  }

  function spawnOrder() {
    addOrder(random.pick(RECIPE_IDS));
  }

  /** The station whose block the cook stands close to, else null. */
  function nearestStation() {
    let best = null;
    let bestDist = INTERACT_RANGE;
    for (const station of STATIONS) {
      const dx = Math.max(station.x - state.player.x, 0, state.player.x - (station.x + station.w));
      const dy = Math.max(station.y - state.player.y, 0, state.player.y - (station.y + station.h));
      const dist = Math.hypot(dx, dy);
      if (dist < bestDist) {
        bestDist = dist;
        best = station;
      }
    }
    return best;
  }

  /** True when the cook's circle would overlap a station block. */
  function hitsStation(x, y) {
    for (const station of STATIONS) {
      const pad = PLAYER_RADIUS * 0.55;
      if (x > station.x - pad && x < station.x + station.w + pad && y > station.y - pad && y < station.y + station.h + pad) return true;
    }
    return false;
  }

  function movePlayer(dt, mx, my) {
    const player = state.player;
    if (mx !== 0 || my !== 0) {
      const len = Math.hypot(mx, my);
      const dx = (mx / len) * PLAYER_SPEED * dt;
      const dy = (my / len) * PLAYER_SPEED * dt;
      if (!hitsStation(player.x + dx, player.y)) player.x += dx;
      if (!hitsStation(player.x, player.y + dy)) player.y += dy;
      player.faceX = mx;
      player.faceY = my;
      player.walk += dt * 10;
    }
    player.x = Math.min(FLOOR.x + FLOOR.w - PLAYER_RADIUS, Math.max(FLOOR.x + PLAYER_RADIUS, player.x));
    player.y = Math.min(FLOOR.y + FLOOR.h - PLAYER_RADIUS, Math.max(FLOOR.y + PLAYER_RADIUS, player.y));
  }

  /** Slots of one device kind, so pans, grill and pot share one code path. */
  function deviceSlots(device) {
    if (device === 'pan') return state.pans;
    return device === 'grill' ? [state.grill] : [state.pot];
  }

  function setDeviceSlot(device, index, slot) {
    if (device === 'pan') state.pans[index] = slot;
    else if (device === 'grill') state.grill = slot;
    else state.pot = slot;
  }

  /** Whether `item` may go into this device now. */
  function fitsDevice(item, device) {
    if (!item || item.kind !== 'item') return false;
    const spec = INGREDIENTS[item.ing];
    if (spec.device !== device) return false;
    if (device === 'grill') return item.stage === 'chopped';
    return item.stage === 'raw';
  }

  function deviceInteract(device, station) {
    const player = state.player;
    const slots = deviceSlots(device);
    const cx = station.x + station.w / 2;
    const cy = station.y;
    if (fitsDevice(player.carrying, device)) {
      const free = slots.findIndex((slot) => slot === null);
      if (free >= 0) {
        setDeviceSlot(device, free, { ing: player.carrying.ing, t: 0, announced: false });
        player.carrying = null;
        popup(cx, cy, 'Masak…', '#ffd97a');
        return EVENT_PLACE;
      }
    }
    if (!player.carrying) {
      // Take the most urgent finished item first, then a burnt one.
      let take = slots.findIndex((slot) => slot && slotPhase(slot) === 'done');
      if (take < 0) take = slots.findIndex((slot) => slot && slotPhase(slot) === 'burnt');
      if (take >= 0) {
        const slot = slots[take];
        player.carrying = { kind: 'item', ing: slot.ing, stage: slotPhase(slot) === 'burnt' ? 'burnt' : 'cooked' };
        setDeviceSlot(device, take, null);
        return EVENT_PICKUP;
      }
    }
    return 0;
  }

  /** Where a slot's item stands: still cooking, ready, or burnt. */
  function slotPhase(slot) {
    const spec = INGREDIENTS[slot.ing];
    if (slot.t < spec.cook) return 'cooking';
    if (slot.t < spec.cook + spec.burn) return 'done';
    return 'burnt';
  }

  function platingInteract(station) {
    const player = state.player;
    const cx = station.x + station.w / 2;
    if (player.carrying && player.carrying.kind === 'item') {
      const item = player.carrying;
      if (item.stage === 'raw') {
        popup(cx, station.y, 'Belum siap!', '#ff9d7a');
        return EVENT_ERROR;
      }
      if (item.stage === 'burnt') {
        popup(cx, station.y, 'Itu gosong!', '#ff9d7a');
        return EVENT_ERROR;
      }
      let plate = state.plates.find((p) => !p.dish);
      if (!plate) {
        if (state.plates.length >= MAX_PLATES) {
          popup(cx, station.y, 'Meja penuh!', '#ff9d7a');
          return EVENT_ERROR;
        }
        plate = { parts: [], dish: null };
        state.plates.push(plate);
      }
      plate.parts.push(partKey(item.ing, item.stage));
      plate.dish = matchRecipe(plate.parts);
      player.carrying = null;
      if (plate.dish) {
        popup(cx, station.y - 6, `${RECIPES[plate.dish].name} jadi!`, '#a5e07f');
        return EVENT_CHOP_DONE;
      }
      popup(cx, station.y, `+ ${INGREDIENTS[item.ing].short}`, '#fff7e0');
      return EVENT_PLACE;
    }
    if (player.carrying && player.carrying.kind === 'plate') {
      if (state.plates.length < MAX_PLATES) {
        state.plates.push({ parts: player.carrying.parts, dish: player.carrying.dish });
        player.carrying = null;
        return EVENT_PLACE;
      }
      return EVENT_ERROR;
    }
    if (!player.carrying && state.plates.length > 0) {
      let index = state.plates.findIndex((p) => p.dish);
      if (index < 0) {
        index = state.plates.reduce((best, p, i) => (p.parts.length > state.plates[best].parts.length ? i : best), 0);
      }
      const plate = state.plates.splice(index, 1)[0];
      player.carrying = { kind: 'plate', parts: plate.parts, dish: plate.dish };
      return EVENT_PICKUP;
    }
    return 0;
  }

  function servingInteract(station) {
    const player = state.player;
    const cx = station.x + station.w / 2;
    if (!player.carrying || player.carrying.kind !== 'plate') {
      popup(cx, station.y, 'Bawa piring jadi dulu', '#ff9d7a');
      return EVENT_ERROR;
    }
    if (!player.carrying.dish) {
      popup(cx, station.y, 'Hidangannya belum jadi!', '#ff9d7a');
      return EVENT_ERROR;
    }
    const index = state.orders.findIndex((order) => order.recipe === player.carrying.dish);
    if (index < 0) {
      popup(cx, station.y, 'Tidak ada pesanan ini', '#ff9d7a');
      return EVENT_ERROR;
    }
    const [order] = state.orders.splice(index, 1);
    const tip = Math.round(order.price * 0.6 * (order.patience / order.patienceMax));
    const gain = order.price + tip;
    state.score += gain;
    state.served += 1;
    player.carrying = null;
    popup(cx, station.y - 8, `+Rp ${gain}`, '#a5e07f');
    return EVENT_SERVE;
  }

  function pressInteract(station) {
    const player = state.player;
    switch (station.type) {
      case 'crate': {
        if (!player.carrying) {
          player.carrying = { kind: 'item', ing: station.ingredient, stage: 'raw' };
          return EVENT_PICKUP;
        }
        return 0;
      }
      case 'stove':
        return deviceInteract('pan', station);
      case 'grill':
        return deviceInteract('grill', station);
      case 'pot':
        return deviceInteract('pot', station);
      case 'plating':
        return platingInteract(station);
      case 'serving':
        return servingInteract(station);
      case 'bin': {
        if (player.carrying) {
          player.carrying = null;
          popup(station.x + station.w / 2, station.y, 'Dibuang', '#ffb3a0');
          return EVENT_PLACE;
        }
        return 0;
      }
      default:
        return 0;
    }
  }

  function advanceDevices(dt) {
    let events = 0;
    const all = [
      ...state.pans.map((slot, i) => ({ slot, device: 'pan', index: i })),
      { slot: state.grill, device: 'grill', index: 0 },
      { slot: state.pot, device: 'pot', index: 0 },
    ];
    for (const entry of all) {
      const slot = entry.slot;
      if (!slot) continue;
      const before = slotPhase(slot);
      slot.t += dt;
      const after = slotPhase(slot);
      if (before === 'cooking' && after === 'done') {
        events |= EVENT_DONE;
        const station = STATIONS.find((s) => s.type === entry.device || (entry.device === 'pan' && s.type === 'stove'));
        popup(station.x + station.w / 2, station.y - 4, `${INGREDIENTS[slot.ing].short} matang!`, '#a5e07f');
      } else if (before === 'done' && after === 'burnt') {
        events |= EVENT_BURN;
        state.shake = 0.35;
        const station = STATIONS.find((s) => s.type === entry.device || (entry.device === 'pan' && s.type === 'stove'));
        popup(station.x + station.w / 2, station.y - 4, 'GOSONG!', '#ff7a5c');
      }
    }
    return events;
  }

  function advanceOrders(dt) {
    let events = 0;
    for (let i = state.orders.length - 1; i >= 0; i -= 1) {
      const order = state.orders[i];
      order.patience -= dt;
      if (order.patience <= 0) {
        state.orders.splice(i, 1);
        state.missed += 1;
        state.stars -= 1;
        state.score = Math.max(0, state.score - 5);
        state.shake = Math.max(state.shake, 0.3);
        events |= EVENT_EXPIRE;
        popup(120 + i * 250, 128, `${RECIPES[order.recipe].name} batal!`, '#ff7a5c');
        if (state.stars <= 0) {
          state.over = true;
          state.ruined = true;
          events |= EVENT_OVER;
        }
      }
    }
    const progress = state.elapsed / DAY_SECONDS;
    const maxOrders = progress < 0.5 ? MAX_ORDERS_EARLY : MAX_ORDERS_LATE;
    state.spawnT -= dt;
    if (state.spawnT <= 0 && state.orders.length < maxOrders && !state.over) {
      spawnOrder();
      state.spawnT = 7.5 - 3.3 * progress;
    }
    return events;
  }

  function step(dt, input) {
    let events = 0;
    for (const p of state.popups) {
      p.t += dt;
      p.y -= 26 * dt;
    }
    state.popups = state.popups.filter((p) => p.t < p.life);
    if (state.shake > 0) state.shake -= dt;
    if (state.over) return events;

    state.elapsed += dt;
    state.dayLeft = Math.max(0, DAY_SECONDS - state.elapsed);
    movePlayer(dt, input.mx, input.my);
    state.near = nearestStation();

    const player = state.player;
    // Chopping is held work at the board, on a carried raw choppable item.
    const chopping = state.near && state.near.type === 'board' && player.carrying
      && player.carrying.kind === 'item' && player.carrying.stage === 'raw'
      && INGREDIENTS[player.carrying.ing].chop && input.interactHeld;
    if (chopping) {
      const before = Math.floor(player.chopT / 0.18);
      player.chopT += dt;
      if (Math.floor(player.chopT / 0.18) > before) events |= EVENT_CHOP;
      if (player.chopT >= CHOP_SECONDS) {
        player.carrying = { kind: 'item', ing: player.carrying.ing, stage: 'chopped' };
        player.chopT = 0;
        events |= EVENT_CHOP_DONE;
        popup(player.x, player.y - 44, `${INGREDIENTS[player.carrying.ing].short} dicacah!`, '#ffd97a');
      }
    } else {
      player.chopT = Math.max(0, player.chopT - dt * 2);
    }

    if (input.interactPressed && state.near) events |= pressInteract(state.near);

    events |= advanceDevices(dt);
    events |= advanceOrders(dt);

    if (state.dayLeft <= 0 && !state.over) {
      state.over = true;
      events |= EVENT_OVER;
    }
    return events;
  }

  function reset() {
    const fresh = createWorld(random).state;
    Object.assign(state, fresh);
    spawnOrder();
    spawnOrder();
    state.spawnT = 5;
  }

  return { state, step, reset, addOrder, popup };
}
