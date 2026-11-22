// Arctic Vault: Frostbite Heist — bootstrap and game loop.
// One job: wire the canvas, the input and the world together, run the fixed
// step loop, and stage a screenshot scene when ?scene= is given.
import { VIEW } from './config.js';
import { bindInput, createInput } from './input.js';
import { render } from './render.js';
import { stageShot } from './shots.js';
import { SCREEN_CAUGHT, SCREEN_ESCAPED, SCREEN_PLAY, SCREEN_TITLE, createWorld, resetWorld, stepWorld, throwSnowball, useCloak, useEmp } from './world.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
canvas.width = VIEW.width;
canvas.height = VIEW.height;

const world = createWorld();
const input = createInput();
let snowballArmed = false;

function announce() {
  const taken = world.loot.filter((l) => l.taken).length;
  statusEl.textContent = `Arctic Vault. Score ${world.score}. Alarm ${Math.round(world.alarm)} percent. `
    + `Loot ${taken} of ${world.loot.length}. ${world.safeCracked ? 'Safe cracked. Reach the snowcat bay.' : 'Crack the cryo-safe, then escape.'}`;
}

const hooks = {
  onEmp: () => { useEmp(world); },
  onCloak: () => { useCloak(world); },
  onSnowballArm: () => {
    snowballArmed = true;
    world.message = 'Snowball ready — click where it should land';
    world.messageTimer = 2.0;
  },
  onClick: (x, y) => {
    if (snowballArmed && world.screen === SCREEN_PLAY) {
      throwSnowball(world, x, y);
      snowballArmed = false;
    }
  },
  onEnter: () => {
    if (world.screen === SCREEN_TITLE || world.screen === SCREEN_CAUGHT || world.screen === SCREEN_ESCAPED) {
      resetWorld(world);
    }
  },
};
bindInput(input, canvas, hooks);

const STEP = 1 / 60;
let acc = 0;
let last = performance.now();

function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000);
  last = now;
  acc += dt;
  let guard = 0;
  while (acc >= STEP && guard < 5 && !frozen) {
    stepWorld(world, input, STEP);
    acc -= STEP;
    guard += 1;
  }
  render(canvas.getContext('2d'), world);
  announce();
  requestAnimationFrame(frame);
}

// Screenshot staging: ?scene=cover|storm|loot|escape renders a composed
// mid-heist frame of the real game, then the loop keeps it alive — but the
// world stops stepping, so the staged moment cannot play itself into a
// caught screen while the screenshot is taken.
const scene = new URLSearchParams(window.location.search).get('scene');
const frozen = scene !== null;
if (scene) {
  stageShot(scene, world, (held) => stepWorld(world, held, STEP));
  render(canvas.getContext('2d'), world);
}
requestAnimationFrame(frame);
