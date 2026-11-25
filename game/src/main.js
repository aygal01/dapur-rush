// Dapur Rush — boot and the one loop. The world advances in fixed 1/60 s
// steps; the renderer paints what is there; events from the world become
// sounds. Screens: title, play, paused, day over.
//
// ?seed=N fixes the day's order pattern. ?shot=start|play|end (with
// &seed=N) stages that scene instead of running the loop, paints it twice
// and sets window.__shotReady for a screenshot.
import { STATIONS } from './config.js';
import { createRandom } from './random.js';
import { createAudio } from './audio.js';
import {
  EVENT_BURN, EVENT_CHOP, EVENT_CHOP_DONE, EVENT_DONE, EVENT_ERROR, EVENT_EXPIRE,
  EVENT_OVER, EVENT_PICKUP, EVENT_PLACE, EVENT_SERVE, createWorld,
} from './world.js';
import { ACTION_CONFIRM, ACTION_PAUSE, createInput } from './input.js';
import { SCREEN_OVER, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_TITLE, createRenderer } from './render.js';
import { stageShot } from './shots.js';

const STEP = 1 / 60;
const MAX_FRAME = 0.25;

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);
const audio = createAudio();

function runShot(name) {
  const screen = stageShot(name, world);
  let painted = 0;
  function paint() {
    renderer.draw(world.state, screen);
    painted += 1;
    if (painted < 2) requestAnimationFrame(paint);
    else window.__shotReady = true;
  }
  requestAnimationFrame(paint);
}

function runGame() {
  const input = createInput(canvas);
  let screen = SCREEN_TITLE;
  let accumulator = 0;
  let last = performance.now();
  let moveTarget = null;
  let pendingStation = null;

  function announce(message) {
    status.textContent = message;
  }

  function startDay() {
    world.reset();
    moveTarget = null;
    pendingStation = null;
    accumulator = 0;
    screen = SCREEN_PLAY;
    announce('Hari dimulai. Pesanan masuk!');
  }

  function playEvents(events) {
    if (events & EVENT_PICKUP) audio.pickup();
    if (events & EVENT_PLACE) audio.place();
    if (events & EVENT_CHOP) audio.chop();
    if (events & EVENT_CHOP_DONE) audio.done();
    if (events & EVENT_DONE) audio.done();
    if (events & EVENT_SERVE) audio.serve();
    if (events & EVENT_ERROR) audio.error();
    if (events & EVENT_BURN) audio.burn();
    if (events & EVENT_EXPIRE) audio.expire();
  }

  /** Read a click: on menu screens it confirms; in play it sets a walk target. */
  function handleClick() {
    const click = input.takeClick();
    if (!click) return;
    audio.unlock();
    if (screen !== SCREEN_PLAY) return;
    const point = renderer.toWorld(click.clientX, click.clientY);
    const station = STATIONS.find(
      (s) => point.x >= s.x - 6 && point.x <= s.x + s.w + 6 && point.y >= s.y - 6 && point.y <= s.y + s.h + 6,
    );
    pendingStation = station ?? null;
    moveTarget = station ? { x: station.x + station.w / 2, y: station.y + station.h / 2 } : point;
  }

  function stepOnce() {
    let mx = 0;
    let my = 0;
    const keys = input.direction();
    let interactPressed = input.takeInteractPressed();
    let interactHeld = input.interactHeld;
    if (keys.x !== 0 || keys.y !== 0) {
      mx = keys.x;
      my = keys.y;
      moveTarget = null;
      pendingStation = null;
    } else if (moveTarget) {
      const player = world.state.player;
      const dx = moveTarget.x - player.x;
      const dy = moveTarget.y - player.y;
      const dist = Math.hypot(dx, dy);
      if (pendingStation && world.state.near && world.state.near.id === pendingStation.id) {
        // Arrived: use the station, and keep holding if it is the board.
        interactPressed = true;
        if (pendingStation.type === 'board') interactHeld = true;
        else {
          pendingStation = null;
          moveTarget = null;
        }
      } else if (dist < 8) {
        moveTarget = null;
        pendingStation = null;
      } else {
        mx = dx / dist;
        my = dy / dist;
      }
    }
    const events = world.step(STEP, { mx, my, interactHeld, interactPressed });
    playEvents(events);
    if (events & EVENT_OVER) {
      screen = SCREEN_OVER;
      announce(`Hari selesai. Koin Rp ${world.state.score}. Terjual ${world.state.served}, batal ${world.state.missed}.`);
    }
  }

  function frame(now) {
    requestAnimationFrame(frame);
    accumulator += Math.min((now - last) / 1000, MAX_FRAME);
    last = now;
    const actions = input.takeActions();
    handleClick();
    if (actions & ACTION_CONFIRM && (screen === SCREEN_TITLE || screen === SCREEN_OVER)) {
      audio.unlock();
      startDay();
    } else if (actions & ACTION_PAUSE && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Istirahat.');
    } else if (actions & (ACTION_PAUSE | ACTION_CONFIRM) && screen === SCREEN_PAUSED) {
      screen = SCREEN_PLAY;
      announce('Lanjut masak.');
    }
    if (screen === SCREEN_PLAY) {
      while (accumulator >= STEP && screen === SCREEN_PLAY) {
        stepOnce();
        accumulator -= STEP;
      }
    } else {
      accumulator = 0;
    }
    renderer.draw(world.state, screen);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && screen === SCREEN_PLAY) {
      screen = SCREEN_PAUSED;
      announce('Istirahat.');
    }
  });

  announce('Dapur Rush. Klik atau tekan Space untuk mulai.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
