// Dapur Rush — everything the player sees: the order board, the kitchen,
// the food, the cook, and the title / pause / day-end screens. Canvas 2D,
// all drawn in code; nothing is loaded from a file.
import { INGREDIENTS, RECIPES, STATIONS, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const INK = '#2d1a0c';
const PAPER = '#fff7e0';
const GOLD = '#ffd97a';
const RED = '#d64541';
const GREEN = '#58a05c';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, value, x, y, size, color = INK, align = 'center', weight = 'bold') {
  ctx.font = `${weight} ${size}px system-ui, 'Segoe UI', sans-serif`;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, x, y);
}

/** One ingredient or component, drawn as food. stage: raw | chopped | cooked | burnt. */
export function drawFood(ctx, ing, stage, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (stage === 'burnt') {
    ctx.fillStyle = '#2b2320';
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.78, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#453831';
    ctx.beginPath();
    ctx.ellipse(-r * 0.3, -r * 0.2, r * 0.4, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  const cooked = stage === 'cooked';
  const chopped = stage === 'chopped';
  if (ing === 'rice') {
    ctx.fillStyle = '#8a5a2b';
    ctx.beginPath(); ctx.ellipse(0, r * 0.25, r * 1.05, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cooked ? '#e8a33d' : '#f7f3e6';
    ctx.beginPath(); ctx.ellipse(0, -r * 0.1, r * 0.95, r * 0.62, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = cooked ? '#c97b2d' : '#ddd6c2';
    for (const [dx, dy] of [[-0.4, -0.15], [0.1, -0.3], [0.45, 0.05], [-0.1, 0.1]]) {
      ctx.beginPath(); ctx.ellipse(r * dx, r * dy, r * 0.16, r * 0.09, dx * 3, 0, Math.PI * 2); ctx.fill();
    }
    if (cooked) { ctx.fillStyle = '#58a05c'; ctx.fillRect(-r * 0.5, -r * 0.45, r * 0.3, r * 0.12); ctx.fillRect(r * 0.25, -r * 0.5, r * 0.3, r * 0.12); }
  } else if (ing === 'noodle') {
    ctx.fillStyle = '#38618c';
    ctx.beginPath(); ctx.ellipse(0, r * 0.25, r * 1.05, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = cooked ? '#e0a83c' : '#f2d98c';
    ctx.lineWidth = r * 0.16;
    for (const dy of [-0.28, -0.05, 0.16]) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, r * dy);
      ctx.bezierCurveTo(-r * 0.2, r * dy - r * 0.3, r * 0.25, r * dy + r * 0.3, r * 0.7, r * dy);
      ctx.stroke();
    }
  } else if (ing === 'egg') {
    ctx.fillStyle = '#fdfdf6';
    ctx.beginPath(); ctx.ellipse(0, 0, r * (cooked ? 1.05 : 0.72), r * (cooked ? 0.8 : 0.95), 0, 0, Math.PI * 2); ctx.fill();
    if (cooked) { ctx.strokeStyle = '#d99a3c'; ctx.lineWidth = 2; ctx.stroke(); }
    ctx.fillStyle = '#f5a623';
    ctx.beginPath(); ctx.arc(cooked ? r * 0.1 : 0, -r * 0.05, r * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffc95e';
    ctx.beginPath(); ctx.arc(-r * 0.12, -r * 0.2, r * 0.16, 0, Math.PI * 2); ctx.fill();
  } else if (ing === 'chicken') {
    if (cooked) {
      ctx.strokeStyle = '#a5712f';
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.moveTo(-r * 0.9, r * 0.85); ctx.lineTo(r * 0.8, -r * 0.8); ctx.stroke();
      ctx.fillStyle = '#b45f2d';
      for (const t of [-0.45, 0.05, 0.55]) {
        ctx.save();
        ctx.translate(r * t, -r * t);
        ctx.rotate(-0.7);
        roundRect(ctx, -r * 0.34, -r * 0.26, r * 0.68, r * 0.52, r * 0.2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#7e3f16';
      ctx.fillRect(-r * 0.2, -r * 0.3, r * 0.5, r * 0.14);
    } else if (chopped) {
      ctx.fillStyle = '#e8907c';
      for (const [dx, dy] of [[-0.45, -0.2], [0.1, -0.35], [0.45, 0.1], [-0.15, 0.3], [0.3, -0.05]]) {
        roundRect(ctx, r * dx - r * 0.22, r * dy - r * 0.18, r * 0.44, r * 0.36, r * 0.12);
        ctx.fill();
      }
    } else {
      ctx.fillStyle = '#e8907c';
      ctx.beginPath(); ctx.ellipse(-r * 0.15, -r * 0.1, r * 0.62, r * 0.48, -0.6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#f7f3e6';
      ctx.beginPath(); ctx.ellipse(r * 0.5, r * 0.45, r * 0.2, r * 0.32, 0.6, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(r * 0.62, r * 0.62, r * 0.13, 0, Math.PI * 2); ctx.fill();
    }
  } else if (ing === 'chili') {
    ctx.strokeStyle = '#3f7d33';
    ctx.lineWidth = r * 0.14;
    if (chopped) {
      ctx.fillStyle = '#d63a2f';
      for (const [dx, dy] of [[-0.4, -0.15], [0.05, -0.3], [0.42, 0.05], [-0.1, 0.28], [0.3, 0.32]]) {
        ctx.beginPath(); ctx.ellipse(r * dx, r * dy, r * 0.2, r * 0.13, dx * 4, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.strokeStyle = '#d63a2f';
      ctx.lineWidth = r * 0.3;
      ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.4); ctx.quadraticCurveTo(r * 0.1, r * 0.55, r * 0.65, r * 0.3); ctx.stroke();
      ctx.strokeStyle = '#3f7d33';
      ctx.lineWidth = r * 0.16;
      ctx.beginPath(); ctx.moveTo(-r * 0.6, -r * 0.4); ctx.lineTo(-r * 0.78, -r * 0.62); ctx.stroke();
    }
  } else if (ing === 'veg') {
    ctx.fillStyle = '#4e9b47';
    if (chopped) {
      for (const [dx, dy] of [[-0.42, -0.1], [0.05, -0.32], [0.45, -0.05], [-0.12, 0.3], [0.32, 0.28]]) {
        ctx.save(); ctx.translate(r * dx, r * dy); ctx.rotate(dx * 5);
        ctx.fillRect(-r * 0.22, -r * 0.09, r * 0.44, r * 0.18);
        ctx.restore();
      }
    } else {
      for (const a of [-0.7, -0.25, 0.25, 0.7]) {
        ctx.save(); ctx.rotate(a);
        ctx.beginPath(); ctx.ellipse(0, -r * 0.45, r * 0.24, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = '#e8833a';
      ctx.beginPath(); ctx.ellipse(0, r * 0.35, r * 0.3, r * 0.22, 0, 0, Math.PI * 2); ctx.fill();
    }
  } else if (ing === 'meatball') {
    ctx.fillStyle = cooked ? '#38618c' : '#8a5a2b';
    ctx.beginPath(); ctx.ellipse(0, r * 0.25, r * 1.05, r * 0.55, 0, 0, Math.PI * 2); ctx.fill();
    if (cooked) { ctx.fillStyle = '#bcd8ea'; ctx.beginPath(); ctx.ellipse(0, -r * 0.05, r * 0.9, r * 0.5, 0, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#8a5a3b';
    for (const [dx, dy] of [[-0.4, -0.1], [0.15, -0.28], [0.45, 0.12]]) {
      ctx.beginPath(); ctx.arc(r * dx, r * dy, r * 0.3, 0, Math.PI * 2); ctx.fill();
    }
  }
  ctx.restore();
}

/** A finished dish, plated. */
function drawDish(ctx, recipeId, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * 0.95, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9c2ae'; ctx.lineWidth = 2; ctx.stroke();
  if (recipeId === 'nasiGoreng') {
    drawFood(ctx, 'rice', 'cooked', 0, r * 0.08, r * 0.8);
    drawFood(ctx, 'egg', 'cooked', -r * 0.55, -r * 0.4, r * 0.42);
    drawFood(ctx, 'chili', 'chopped', r * 0.55, -r * 0.35, r * 0.36);
  } else if (recipeId === 'mieGoreng') {
    drawFood(ctx, 'noodle', 'cooked', 0, r * 0.05, r * 0.85);
    drawFood(ctx, 'egg', 'cooked', r * 0.5, -r * 0.42, r * 0.4);
    drawFood(ctx, 'veg', 'chopped', -r * 0.55, -r * 0.3, r * 0.36);
  } else if (recipeId === 'sateAyam') {
    drawFood(ctx, 'chicken', 'cooked', 0, 0, r * 0.9);
    drawFood(ctx, 'chili', 'chopped', r * 0.45, r * 0.4, r * 0.34);
  } else {
    drawFood(ctx, 'meatball', 'cooked', 0, 0, r * 0.9);
    drawFood(ctx, 'veg', 'chopped', -r * 0.6, -r * 0.45, r * 0.32);
  }
  ctx.restore();
}

/** A plate on the counter or in hand: parts as piles, or the finished dish. */
function drawPlate(ctx, plate, x, y, r) {
  if (plate.dish) {
    drawDish(ctx, plate.dish, x, y, r);
    return;
  }
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = '#fdfdf8';
  ctx.beginPath(); ctx.ellipse(0, 0, r * 1.25, r * 0.95, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#c9c2ae'; ctx.lineWidth = 2; ctx.stroke();
  const spots = [[-0.45, -0.1], [0.45, -0.15], [0, 0.4]];
  plate.parts.forEach((part, i) => {
    const [ing, stage] = part.split(':');
    const [dx, dy] = spots[i % spots.length];
    drawFood(ctx, ing, stage, r * dx, r * dy, r * 0.45);
  });
  ctx.restore();
}

function drawOrderBoard(ctx, state) {
  ctx.fillStyle = '#4a2c14';
  ctx.fillRect(0, 0, VIEW.width, 132);
  ctx.fillStyle = '#5d3a1c';
  ctx.fillRect(0, 126, VIEW.width, 6);
  text(ctx, 'PESANAN', 66, 22, 17, GOLD);
  if (state.orders.length === 0) {
    text(ctx, 'Menunggu pelanggan…', 300, 70, 20, '#caa06a');
  }
  state.orders.forEach((order, i) => {
    const x = 14 + i * 252;
    const y = 34;
    ctx.fillStyle = PAPER;
    roundRect(ctx, x, y, 240, 86, 10);
    ctx.fill();
    const recipe = RECIPES[order.recipe];
    drawDish(ctx, order.recipe, x + 40, y + 40, 26);
    text(ctx, recipe.name, x + 74, y + 24, 17, INK, 'left');
    recipe.parts.forEach((part, j) => {
      const [ing, stage] = part.split(':');
      drawFood(ctx, ing, stage, x + 84 + j * 30, y + 52, 11);
    });
    text(ctx, `Rp ${order.price}`, x + 228, y + 24, 16, '#7a4a21', 'right');
    const frac = Math.max(0, order.patience / order.patienceMax);
    ctx.fillStyle = '#e3d5b8';
    roundRect(ctx, x + 74, y + 68, 154, 9, 4);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? GREEN : frac > 0.25 ? '#e8a33d' : RED;
    roundRect(ctx, x + 74, y + 68, Math.max(6, 154 * frac), 9, 4);
    ctx.fill();
  });

  // The day's clock and takings, right of the board.
  const hx = 1030;
  ctx.fillStyle = '#2d1a0c';
  roundRect(ctx, hx, 12, 236, 108, 12);
  ctx.fill();
  const left = Math.max(0, Math.ceil(state.dayLeft));
  const clock = `${String(Math.floor(left / 60)).padStart(2, '0')}:${String(left % 60).padStart(2, '0')}`;
  text(ctx, clock, hx + 62, 42, 34, state.dayLeft <= 15 ? '#ff8a70' : PAPER);
  text(ctx, 'SISA WAKTU', hx + 62, 74, 12, '#caa06a');
  text(ctx, `Rp ${state.score}`, hx + 168, 38, 24, GOLD);
  text(ctx, `Terjual ${state.served} · Batal ${state.missed}`, hx + 168, 66, 14, PAPER);
  let stars = '';
  for (let i = 0; i < 5; i += 1) stars += i < state.stars ? '★' : '☆';
  text(ctx, stars, hx + 168, 94, 18, GOLD);
}

function drawStationLabel(ctx, station, label) {
  const w = ctx.measureText(label).width;
  ctx.font = 'bold 13px system-ui, sans-serif';
  const tw = ctx.measureText(label).width + 16;
  ctx.fillStyle = 'rgba(45,26,12,0.85)';
  roundRect(ctx, station.x + station.w / 2 - tw / 2, station.y + station.h + 3, tw, 20, 9);
  ctx.fill();
  text(ctx, label, station.x + station.w / 2, station.y + station.h + 13, 13, PAPER);
  return w;
}

function drawProgressRing(ctx, x, y, r, frac, color) {
  ctx.strokeStyle = 'rgba(0,0,0,0.35)';
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color;
  ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, frac)); ctx.stroke();
}

function slotView(slot) {
  if (!slot) return null;
  const spec = INGREDIENTS[slot.ing];
  if (slot.t < spec.cook) return { phase: 'cooking', frac: slot.t / spec.cook };
  if (slot.t < spec.cook + spec.burn) return { phase: 'done', frac: 1 };
  return { phase: 'burnt', frac: 1 };
}

function drawCookerSlot(ctx, slot, x, y, r) {
  ctx.fillStyle = '#26221f';
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3d3833';
  ctx.beginPath(); ctx.arc(x, y, r * 0.78, 0, Math.PI * 2); ctx.fill();
  if (!slot) return;
  const view = slotView(slot);
  drawFood(ctx, slot.ing, view.phase === 'cooking' ? 'raw' : view.phase === 'done' ? 'cooked' : 'burnt', x, y, r * 0.52);
  if (view.phase === 'cooking') drawProgressRing(ctx, x, y, r + 4, view.frac, GOLD);
  else if (view.phase === 'done') drawProgressRing(ctx, x, y, r + 4, 1, '#7ee787');
  else drawProgressRing(ctx, x, y, r + 4, 1, RED);
}

function drawStations(ctx, state) {
  for (const station of STATIONS) {
    const { x, y, w, h } = station;
    const cx = x + w / 2;
    const cy = y + h / 2;
    if (station.type === 'crate') {
      ctx.fillStyle = '#a5712f';
      roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.fillStyle = '#8a5a2b';
      roundRect(ctx, x + 5, y + 5, w - 10, h - 10, 6); ctx.fill();
      drawFood(ctx, station.ingredient, 'raw', cx - 18, cy, 21);
      text(ctx, INGREDIENTS[station.ingredient].name, cx + 26, cy, 16, PAPER);
    } else if (station.type === 'board') {
      ctx.fillStyle = '#c99a5b';
      roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.fillStyle = '#e0b878';
      roundRect(ctx, x + 10, y + 10, w - 20, h - 20, 6); ctx.fill();
      ctx.strokeStyle = '#8a8f96'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(cx + 22, cy - 16); ctx.lineTo(cx + 44, cy + 12); ctx.stroke();
      ctx.strokeStyle = '#5d3a1c'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(cx + 44, cy + 12); ctx.lineTo(cx + 54, cy + 22); ctx.stroke();
      drawStationLabel(ctx, station, 'PAPAN CACAH');
    } else if (station.type === 'stove') {
      ctx.fillStyle = '#4c4a48';
      roundRect(ctx, x, y, w, h, 10); ctx.fill();
      drawCookerSlot(ctx, state.pans[0], cx, y + 48, 30);
      drawCookerSlot(ctx, state.pans[1], cx, y + 122, 30);
      drawStationLabel(ctx, station, 'KOMPOR');
    } else if (station.type === 'grill') {
      ctx.fillStyle = '#33302d';
      roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.strokeStyle = '#191715'; ctx.lineWidth = 4;
      for (let gx = x + 12; gx < x + w - 6; gx += 14) {
        ctx.beginPath(); ctx.moveTo(gx, y + 8); ctx.lineTo(gx, y + h - 8); ctx.stroke();
      }
      ctx.fillStyle = 'rgba(230,90,40,0.5)';
      ctx.fillRect(x + 8, y + h - 14, w - 16, 6);
      if (state.grill) {
        const view = slotView(state.grill);
        drawFood(ctx, 'chicken', view.phase === 'done' ? 'cooked' : view.phase, cx, cy - 4, 26);
        drawProgressRing(ctx, cx, cy - 4, 36, view.frac, view.phase === 'done' ? '#7ee787' : view.phase === 'burnt' ? RED : GOLD);
      }
      drawStationLabel(ctx, station, 'PANGGANG');
    } else if (station.type === 'pot') {
      ctx.fillStyle = '#5b6670';
      roundRect(ctx, x + 8, y + 12, w - 16, h - 16, 12); ctx.fill();
      ctx.fillStyle = '#78838c';
      ctx.beginPath(); ctx.ellipse(cx, y + 16, w / 2 - 10, 12, 0, 0, Math.PI * 2); ctx.fill();
      if (state.pot) {
        const view = slotView(state.pot);
        drawFood(ctx, 'meatball', view.phase === 'done' ? 'cooked' : view.phase, cx, cy + 8, 24);
        drawProgressRing(ctx, cx, cy + 8, 34, view.frac, view.phase === 'done' ? '#7ee787' : view.phase === 'burnt' ? RED : GOLD);
      }
      drawStationLabel(ctx, station, 'PANCI BAKSO');
    } else if (station.type === 'plating') {
      ctx.fillStyle = '#a06a35';
      roundRect(ctx, x, y, w, h, 10); ctx.fill();
      ctx.fillStyle = '#b57e42';
      roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 8); ctx.fill();
      for (let i = 0; i < 2; i += 1) {
        const px = x + 78 + i * 148;
        const py = cy + 4;
        if (state.plates[i]) {
          drawPlate(ctx, state.plates[i], px, py, 34);
          if (state.plates[i].dish) {
            const bob = Math.sin(performance.now() / 300 + i) * 3;
            text(ctx, '✓ SIAP', px, py - 52 + bob, 15, '#a5e07f');
          }
        } else {
          ctx.strokeStyle = 'rgba(255,247,224,0.5)';
          ctx.lineWidth = 2;
          ctx.beginPath(); ctx.ellipse(px, py, 42, 32, 0, 0, Math.PI * 2); ctx.stroke();
        }
      }
      drawStationLabel(ctx, station, 'MEJA PERACIKAN');
    } else if (station.type === 'serving') {
      ctx.fillStyle = '#7a4a21';
      roundRect(ctx, x, y, w, h, 10); ctx.fill();
      ctx.fillStyle = '#96622c';
      roundRect(ctx, x + 6, y + 6, w - 12, 16, 6); ctx.fill();
      ctx.fillStyle = GOLD;
      ctx.beginPath(); ctx.arc(x + 44, cy + 6, 13, Math.PI, 0); ctx.fill();
      ctx.fillRect(x + 42, cy + 4, 4, 8);
      text(ctx, 'SAJIKAN DI SINI →', cx + 22, cy + 6, 21, PAPER);
      drawStationLabel(ctx, station, 'MEJA SAJI');
    } else if (station.type === 'bin') {
      ctx.fillStyle = '#6b7076';
      roundRect(ctx, x, y, w, h, 8); ctx.fill();
      ctx.fillStyle = '#565b61';
      roundRect(ctx, x - 4, y - 6, w + 8, 14, 6); ctx.fill();
      drawStationLabel(ctx, station, 'SAMPAH');
    }
    if (state.near && state.near.id === station.id) {
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 3;
      roundRect(ctx, x - 4, y - 4, w + 8, h + 8, 10);
      ctx.stroke();
    }
  }
}

/** The hint over the cook's head for the station in reach. */
function stationHint(state) {
  const near = state.near;
  if (!near) return '';
  const carrying = state.player.carrying;
  if (near.type === 'crate') return carrying ? '' : `E — Ambil ${INGREDIENTS[near.ingredient].name}`;
  if (near.type === 'board') {
    return carrying && carrying.kind === 'item' && carrying.stage === 'raw' && INGREDIENTS[carrying.ing].chop
      ? 'Tahan E — Cacah' : 'Papan cacah: bawa ayam / cabai / sayur';
  }
  if (near.type === 'stove' || near.type === 'grill' || near.type === 'pot') return 'E — Masak / ambil';
  if (near.type === 'plating') return carrying ? 'E — Taruh / tambah' : 'E — Angkat piring';
  if (near.type === 'serving') return carrying && carrying.kind === 'plate' && carrying.dish ? 'E — Sajikan!' : 'Meja saji';
  if (near.type === 'bin') return carrying ? 'E — Buang' : 'Tempat sampah';
  return '';
}

function drawPlayer(ctx, state) {
  const player = state.player;
  const bob = Math.sin(player.walk) * 2.2;
  const x = player.x;
  const y = player.y + bob * 0.3;
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath(); ctx.ellipse(player.x, player.y + 24, 20, 7, 0, 0, Math.PI * 2); ctx.fill();
  // Body: shirt and apron.
  ctx.fillStyle = '#d64541';
  roundRect(ctx, x - 17, y - 8, 34, 32, 9); ctx.fill();
  ctx.fillStyle = '#fdfdf6';
  roundRect(ctx, x - 11, y - 2, 22, 26, 5); ctx.fill();
  // Head and chef's hat.
  ctx.fillStyle = '#f2c094';
  ctx.beginPath(); ctx.arc(x, y - 22, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fdfdf6';
  roundRect(ctx, x - 13, y - 40, 26, 12, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(x - 7, y - 40, 7, 0, Math.PI * 2); ctx.arc(x + 1, y - 43, 8, 0, Math.PI * 2); ctx.arc(x + 8, y - 40, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = INK;
  const lookX = player.faceX * 3;
  const lookY = player.faceY * 2;
  ctx.beginPath(); ctx.arc(x - 4.5 + lookX, y - 22 + lookY, 1.8, 0, Math.PI * 2); ctx.arc(x + 4.5 + lookX, y - 22 + lookY, 1.8, 0, Math.PI * 2); ctx.fill();
  // What the cook carries, held up front.
  if (player.carrying) {
    const cy = y + 16 + bob;
    if (player.carrying.kind === 'plate') drawPlate(ctx, player.carrying, x, cy, 20);
    else drawFood(ctx, player.carrying.ing, player.carrying.stage, x, cy, 15);
  }
  // Chopping progress rides over the head.
  if (player.chopT > 0) {
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    roundRect(ctx, x - 24, y - 62, 48, 8, 4); ctx.fill();
    ctx.fillStyle = GOLD;
    roundRect(ctx, x - 24, y - 62, 48 * Math.min(1, player.chopT / 0.7), 8, 4); ctx.fill();
  }
  const hint = stationHint(state);
  if (hint) {
    ctx.font = 'bold 15px system-ui, sans-serif';
    const tw = ctx.measureText(hint).width + 18;
    ctx.fillStyle = 'rgba(45,26,12,0.88)';
    roundRect(ctx, x - tw / 2, y - 92, tw, 24, 12); ctx.fill();
    text(ctx, hint, x, y - 79, 15, PAPER);
  }
}

function drawPopups(ctx, state) {
  for (const popup of state.popups) {
    const alpha = Math.max(0, 1 - popup.t / popup.life);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 19px system-ui, sans-serif';
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(45,26,12,0.7)';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const tw = ctx.measureText(popup.text).width;
    ctx.strokeText(popup.text, popup.x - tw / 2, popup.y);
    ctx.fillStyle = popup.color;
    ctx.fillText(popup.text, popup.x - tw / 2, popup.y);
    ctx.restore();
  }
}

function drawFloor(ctx) {
  ctx.fillStyle = '#3a2412';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  const tile = 64;
  for (let ty = 132; ty < VIEW.height; ty += tile) {
    for (let tx = 0; tx < VIEW.width; tx += tile) {
      ctx.fillStyle = ((tx + ty) / tile) % 2 === 0 ? '#e6bd83' : '#deb276';
      ctx.fillRect(tx, ty, tile, tile);
    }
  }
  ctx.fillStyle = '#c1443c';
  ctx.fillRect(360, 505, 560, 185);
  ctx.fillStyle = '#cf5049';
  ctx.fillRect(372, 517, 536, 161);
}

function panel(ctx, w, h) {
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2;
  ctx.fillStyle = 'rgba(24,12,4,0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  ctx.fillStyle = PAPER;
  roundRect(ctx, x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = '#a5712f'; ctx.lineWidth = 4; ctx.stroke();
  return { x, y, w, h };
}

function drawTitle(ctx, state) {
  drawFloor(ctx);
  drawStations(ctx, state);
  const { x, y, w } = panel(ctx, 640, 470);
  const cx = x + w / 2;
  text(ctx, 'DAPUR RUSH', cx, y + 58, 54, '#c1443c');
  text(ctx, 'Masak cepat, sajikan tepat — dapur kaki lima', cx, y + 100, 19, '#7a4a21');
  drawDish(ctx, 'nasiGoreng', cx - 120, y + 152, 34);
  drawDish(ctx, 'sateAyam', cx, y + 152, 34);
  drawDish(ctx, 'bakso', cx + 120, y + 152, 34);
  const lines = [
    'Ambil bahan di peti · cacah di papan · masak di kompor,',
    'panggang & panci. Racik piring sesuai pesanan, lalu sajikan',
    'sebelum sabar pelanggan habis. Makanan gosong = sampah!',
  ];
  lines.forEach((line, i) => text(ctx, line, cx, y + 214 + i * 26, 17, INK));
  text(ctx, 'WASD / panah: jalan · E: pakai stasiun · klik: jalan & pakai', cx, y + 312, 16, '#7a4a21');
  text(ctx, 'Satu hari = 120 detik. Pesanan telat mengurangi bintangmu.', cx, y + 340, 16, '#7a4a21');
  ctx.fillStyle = GREEN;
  roundRect(ctx, cx - 170, y + 372, 340, 56, 14); ctx.fill();
  text(ctx, 'MULAI MASAK', cx, y + 401, 24, '#ffffff');
  text(ctx, 'klik atau tekan SPACE', cx, y + 452, 14, '#a5712f');
}

function drawOver(ctx, state) {
  drawFloor(ctx);
  drawStations(ctx, state);
  drawOrderBoard(ctx, state);
  const { x, y, w } = panel(ctx, 560, 430);
  const cx = x + w / 2;
  text(ctx, state.ruined ? 'DAPUR BERANTAKAN!' : 'HARI SELESAI!', cx, y + 56, 40, state.ruined ? RED : '#c1443c');
  text(ctx, state.ruined ? 'Terlalu banyak pesanan batal — pelanggan pergi.' : 'Pelayanan hari ini tuntas. Kerja bagus, juru masak!', cx, y + 96, 16, '#7a4a21');
  const rows = [
    ['Koin terkumpul', `Rp ${state.score}`],
    ['Pesanan terjual', `${state.served}`],
    ['Pesanan batal', `${state.missed}`],
    ['Bintang dapur', `${'★'.repeat(Math.max(0, state.stars))}${'☆'.repeat(Math.max(0, 5 - state.stars))}`],
  ];
  rows.forEach(([label, value], i) => {
    const ry = y + 150 + i * 44;
    text(ctx, label, cx - 170, ry, 20, INK, 'left');
    text(ctx, value, cx + 170, ry, 22, '#7a4a21', 'right');
  });
  ctx.fillStyle = GREEN;
  roundRect(ctx, cx - 170, y + 340, 340, 56, 14); ctx.fill();
  text(ctx, 'MAIN LAGI', cx, y + 369, 24, '#ffffff');
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  let scale = 1;
  let offsetX = 0;
  let offsetY = 0;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    scale = Math.min(canvas.width / VIEW.width, canvas.height / VIEW.height);
    offsetX = (canvas.width - VIEW.width * scale) / 2;
    offsetY = (canvas.height - VIEW.height * scale) / 2;
  }
  window.addEventListener('resize', resize);
  resize();

  /** Convert a client (CSS pixel) point into world coordinates. */
  function toWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const px = (clientX - rect.left) * dpr;
    const py = (clientY - rect.top) * dpr;
    return { x: (px - offsetX) / scale, y: (py - offsetY) / scale };
  }

  function draw(state, screen) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#241407';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let shakeX = 0;
    let shakeY = 0;
    if (state.shake > 0) {
      const m = state.shake * 14;
      shakeX = (Math.random() - 0.5) * m;
      shakeY = (Math.random() - 0.5) * m;
    }
    ctx.setTransform(scale, 0, 0, scale, offsetX + shakeX * scale, offsetY + shakeY * scale);
    if (screen === SCREEN_TITLE) {
      drawTitle(ctx, state);
      return;
    }
    drawFloor(ctx);
    drawStations(ctx, state);
    drawPlayer(ctx, state);
    drawOrderBoard(ctx, state);
    drawPopups(ctx, state);
    if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = 'rgba(24,12,4,0.6)';
      ctx.fillRect(0, 0, VIEW.width, VIEW.height);
      text(ctx, 'ISTIRAHAT', VIEW.width / 2, VIEW.height / 2 - 10, 44, PAPER);
      text(ctx, 'Tekan P untuk lanjut', VIEW.width / 2, VIEW.height / 2 + 34, 18, GOLD);
    } else if (screen === SCREEN_OVER) {
      drawOver(ctx, state);
    }
  }

  return { draw, toWorld };
}
