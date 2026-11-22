// Arctic Vault: Frostbite Heist — thermal vision and blizzards.
// One job: the thief's heat footprints, the storm clock, and the heater
// safe spots. Guards read this, the world updates it, the renderer draws it.
import { HEAT, STORM } from './config.js';

// A footprint is a fading point of heat on the floor.
export function createHeatTrail() {
  return { prints: [], dropTimer: 0, heaterGrace: 0 };
}

// Drop a print while the thief moves, unless a heater just cleared the trail.
export function updateHeatTrail(trail, x, y, moving, dt, stormActive) {
  if (trail.heaterGrace > 0) trail.heaterGrace -= dt;
  trail.dropTimer -= dt;
  if (moving && trail.heaterGrace <= 0 && trail.dropTimer <= 0) {
    trail.prints.push({ x, y, age: 0 });
    trail.dropTimer = HEAT.dropEvery;
  }
  const life = stormActive ? HEAT.stormLife : HEAT.life;
  for (let i = trail.prints.length - 1; i >= 0; i -= 1) {
    trail.prints[i].age += dt;
    if (trail.prints[i].age >= life) trail.prints.splice(i, 1);
  }
  if (trail.prints.length > 240) trail.prints.splice(0, trail.prints.length - 240);
}

// Standing inside a heater erases every print and pauses new ones.
export function applyHeater(trail, x, y, heaters) {
  for (const h of heaters) {
    const dx = x - h.x;
    const dy = y - h.y;
    if (dx * dx + dy * dy <= h.r * h.r) {
      trail.prints.length = 0;
      trail.heaterGrace = HEAT.heaterClearSeconds;
      return true;
    }
  }
  return false;
}

// The freshest print near a point, or null: what a guard sniffs for.
export function freshPrintNear(trail, x, y) {
  let best = null;
  for (const p of trail.prints) {
    if (p.age > HEAT.freshFor) continue;
    const dx = p.x - x;
    const dy = p.y - y;
    const d2 = dx * dx + dy * dy;
    if (d2 <= HEAT.guardNoticeRadius * HEAT.guardNoticeRadius) {
      if (best === null || p.age < best.age) best = p;
    }
  }
  return best;
}

// Blizzard clock: a storm every STORM.every seconds, lasting STORM.lasts.
export function createStormClock() {
  return { time: 0, active: false, untilNext: STORM.every };
}

export function updateStormClock(clock, dt) {
  clock.time += dt;
  if (clock.active) {
    if (clock.time >= STORM.lasts) {
      clock.active = false;
      clock.time = 0;
      clock.untilNext = STORM.every;
    }
  } else if (clock.time >= clock.untilNext) {
    clock.active = true;
    clock.time = 0;
  }
  return clock.active;
}

// Seconds until the next storm starts (or until this one ends, when active).
export function stormCountdown(clock) {
  if (clock.active) return Math.max(0, STORM.lasts - clock.time);
  return Math.max(0, clock.untilNext - clock.time);
}
