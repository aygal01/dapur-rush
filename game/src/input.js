// Keyboard and mouse for the cook: WASD / arrows walk, E or Space uses a
// station, P pauses, and a mouse click means "walk there" — or, when it
// lands on a station, "walk to that station and use it".

export const ACTION_CONFIRM = 1;
export const ACTION_PAUSE = 2;

const WALK_KEYS = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
};
const INTERACT_KEYS = new Set(['KeyE', 'Space']);

export function createInput(canvas) {
  const held = new Set();
  let actions = 0;
  let interactHeld = false;
  let interactPressed = false;
  let click = null;

  window.addEventListener('keydown', (event) => {
    if (WALK_KEYS[event.code] || INTERACT_KEYS.has(event.code)) event.preventDefault();
    if (event.repeat) return;
    held.add(event.code);
    if (INTERACT_KEYS.has(event.code)) {
      interactHeld = true;
      interactPressed = true;
      actions |= ACTION_CONFIRM;
    }
    if (event.code === 'KeyP' || event.code === 'Escape') actions |= ACTION_PAUSE;
    if (event.code === 'Enter') actions |= ACTION_CONFIRM;
  });
  window.addEventListener('keyup', (event) => {
    held.delete(event.code);
    if (INTERACT_KEYS.has(event.code)) interactHeld = false;
  });
  window.addEventListener('blur', () => {
    held.clear();
    interactHeld = false;
  });
  canvas.addEventListener('pointerdown', (event) => {
    click = { clientX: event.clientX, clientY: event.clientY };
    actions |= ACTION_CONFIRM;
  });

  return {
    /** The walk direction as a unit-ish vector {x, y} from held keys. */
    direction() {
      let x = 0;
      let y = 0;
      for (const code of held) {
        const dir = WALK_KEYS[code];
        if (dir === 'up') y -= 1;
        else if (dir === 'down') y += 1;
        else if (dir === 'left') x -= 1;
        else if (dir === 'right') x += 1;
      }
      return { x, y };
    },
    get interactHeld() {
      return interactHeld;
    },
    /** True once per press; reading it consumes it. */
    takeInteractPressed() {
      const was = interactPressed;
      interactPressed = false;
      return was;
    },
    /** Clicks as client coordinates; reading consumes. */
    takeClick() {
      const was = click;
      click = null;
      return was;
    },
    /** ACTION_* bits since the last read; reading consumes. */
    takeActions() {
      const was = actions;
      actions = 0;
      return was;
    },
  };
}
