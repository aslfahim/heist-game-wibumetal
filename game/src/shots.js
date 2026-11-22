// Arctic Vault: Frostbite Heist — staged screenshot scenes.
// One job: drive the real rules forward from a fresh world for a fixed
// number of steps, so each screenshot is a real render of the game's own
// code and the same scene always gives the same frame.
//
// Scenes (via ?scene=):
//   cover  — mid-heist in the freezer aisle: thief, guard cones, cameras,
//            loot and the alarm meter all in one frame (the cover).
//   storm  — a blizzard mid-sweep in the server hall, cones shrunk.
//   loot   — the thief cracking the cryo-safe while a guard closes in.
//   escape — the getaway: safe cracked, thief racing for the snowcat bay.
import { SCREEN_PLAY } from './world.js';

const STEP = 1 / 60;

// A scripted walk: list of [seconds, dx, dy] legs, applied as held keys.
function drive(world, stepFn, legs) {
  for (const [seconds, dx, dy] of legs) {
    const n = Math.round(seconds / STEP);
    for (let i = 0; i < n; i += 1) {
      stepFn({ up: dy < 0, down: dy > 0, left: dx < 0, right: dx > 0 });
    }
  }
}

// Teleport the thief somewhere safe for staging, then let the world run.
function place(world, x, y) {
  world.player.x = x;
  world.player.y = y;
  world.player.vx = 0;
  world.player.vy = 0;
}

export function stageShot(name, world, stepFn) {
  world.screen = SCREEN_PLAY;
  // Every scene warms the world up with the thief parked somewhere no
  // patrol or camera can reach, so guards and the storm clock settle into
  // deterministic spots without the thief getting spotted mid-staging.
  // The thief is only placed in the composed spot at the very end, and the
  // alarm/score are set after the last step, so the frame is exactly staged.
  if (name === 'storm') {
    // Run the clock into the first blizzard, thief parked in the snowcat bay.
    for (let i = 0; i < Math.round(26.5 / STEP); i += 1) stepFn({});
    place(world, 620, 315);
    world.alarm = 34;
    return;
  }
  if (name === 'loot') {
    // Thief at the cryo-safe mid-crack: step just long enough to show the
    // crack ring, then set the alarm — the guard is still a corridor away.
    place(world, 1120, 205);
    for (let i = 0; i < Math.round(1.4 / STEP); i += 1) stepFn({});
    world.alarm = 58;
    return;
  }
  if (name === 'escape') {
    // Safe cracked, loot bagged. Warm up FIRST (the thief parks on the exit
    // pad, so the safe must still be uncracked or the run would end here),
    // then set the getaway state and park the thief in the lower corridor,
    // clear of Pavel's patrol lane, heading for the snowcat bay.
    for (let i = 0; i < Math.round(4 / STEP); i += 1) stepFn({});
    world.loot.find((l) => l.id === 'safe').taken = true;
    world.loot.find((l) => l.id === 'core-a').taken = true;
    world.safeCracked = true;
    world.score = 1050;
    place(world, 1060, 620);
    world.alarm = 22;
    return;
  }
  // cover (default): warm the patrols up, then place the thief mid-crossing
  // of the freezer aisle — safe ahead, a guard cone sweeping across, cameras
  // live, alarm ticking. (1000, 300) sits below the rack rows, out of every
  // cone's centre line and beyond the freezer camera's range.
  for (let i = 0; i < Math.round(6 / STEP); i += 1) stepFn({});
  place(world, 1000, 315);
  world.alarm = 41;
  world.score = 250;
  world.loot.find((l) => l.id === 'core-a').taken = true;
}
