// Arctic Vault: Frostbite Heist — game state and rules.
// One job: everything that changes while playing — the thief, the guards'
// patrols and chases, the sweeping cameras, the alarm meter, the loot,
// the tools, the storm, and the win/lose conditions.
import { COLORS, GRACE, HEAT, LOOT, PLAYER, STORM, TOOLS, VISION } from './config.js';
import { CAMERAS, EXIT, GUARDS, HEATERS, LOOT_SPOTS, PLAYER_START, circleHitsWall, hasLineOfSight } from './level.js';
import { applyHeater, createHeatTrail, createStormClock, freshPrintNear, updateHeatTrail, updateStormClock } from './heat.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_CAUGHT = 'caught';
export const SCREEN_ESCAPED = 'escaped';

export const EVENT_NONE = 0;
export const EVENT_CAUGHT = 1;
export const EVENT_ESCAPED = 2;

// A deterministic shuffle-free seed, so staged scenes always look the same.
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createWorld(seed = 20261122) {
  const rng = mulberry32(seed);
  return {
    rng,
    screen: SCREEN_TITLE,
    time: 0,
    score: 0,
    alarm: 0,
    spotted: false,
    graceTimer: 0,
    warnShown: false,
    message: '',
    messageTimer: 0,
    storm: createStormClock(),
    stormActive: false,
    heat: createHeatTrail(),
    inHeater: false,
    player: {
      x: PLAYER_START.x, y: PLAYER_START.y, vx: 0, vy: 0,
      facing: -Math.PI / 2, moving: false, cloakTimer: 0,
    },
    guards: GUARDS.map((g) => ({
      def: g, x: g.waypoints[0].x, y: g.waypoints[0].y,
      wp: 1, pauseTimer: 0, angle: 0, state: 'patrol',
      investigate: null, chaseTimer: 0, seenTimer: 0,
    })),
    cameras: CAMERAS.map((c) => ({ def: c, angle: c.baseAngle, offTimer: 0 })),
    loot: LOOT_SPOTS.map((l) => ({ ...l, taken: false, crack: 0 })),
    safeCracked: false,
    tools: {
      emp: TOOLS.emp.charges,
      snowball: TOOLS.snowball.charges,
      cloak: TOOLS.cloak.charges,
    },
    empFlash: 0,
    snowballs: [],
    best: 0,
  };
}

export function resetWorld(world) {
  const fresh = createWorld();
  fresh.best = world.best;
  Object.keys(fresh).forEach((k) => { world[k] = fresh[k]; });
  world.screen = SCREEN_PLAY;
}

function angleTo(ax, ay, bx, by) {
  return Math.atan2(by - ay, bx - ax);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// True when the thief stands inside a cone of `range` and `halfAngle`.
function inCone(ox, oy, angle, range, halfAngle, px, py) {
  const dx = px - ox;
  const dy = py - oy;
  const d = Math.hypot(dx, dy);
  if (d > range || d < 1) return d < 1;
  return Math.abs(angleDiff(angleTo(ox, oy, px, py), angle)) <= halfAngle;
}

// Move a circle against the walls, sliding along them instead of sticking.
export function moveWithWalls(x, y, dx, dy, r) {
  let nx = x + dx;
  if (!circleHitsWall(nx, y, r)) x = nx;
  let ny = y + dy;
  if (!circleHitsWall(x, ny, r)) y = ny;
  return { x, y };
}

function nearestGuardInvestigate(world, px, py) {
  for (const g of world.guards) {
    const dx = g.x - px;
    const dy = g.y - py;
    if (dx * dx + dy * dy < 260 * 260) {
      g.state = 'investigate';
      g.investigate = { x: px, y: py };
    }
  }
}

function setMessage(world, text, seconds = 2.5) {
  world.message = text;
  world.messageTimer = seconds;
}

// --- tools ---------------------------------------------------------------

export function useEmp(world) {
  if (world.tools.emp <= 0 || world.screen !== SCREEN_PLAY) return false;
  world.tools.emp -= 1;
  for (const c of world.cameras) c.offTimer = TOOLS.emp.cameraOffSeconds;
  world.empFlash = 0.5;
  setMessage(world, 'EMP burst — cameras dark for 6s');
  return true;
}

export function useCloak(world) {
  if (world.tools.cloak <= 0 || world.screen !== SCREEN_PLAY) return false;
  world.tools.cloak -= 1;
  world.player.cloakTimer = TOOLS.cloak.seconds;
  setMessage(world, 'Thermal cloak on — invisible to cones for 4s');
  return true;
}

export function throwSnowball(world, tx, ty) {
  if (world.tools.snowball <= 0 || world.screen !== SCREEN_PLAY) return false;
  world.tools.snowball -= 1;
  world.snowballs.push({ x: tx, y: ty, age: 0, life: 1.2 });
  nearestGuardInvestigate(world, tx, ty);
  setMessage(world, 'Snowball clatters — guards go to look');
  return true;
}

// --- the step ------------------------------------------------------------

export function stepWorld(world, input, dt) {
  if (world.screen !== SCREEN_PLAY) return EVENT_NONE;
  world.time += dt;
  if (world.messageTimer > 0) world.messageTimer -= dt;
  if (world.empFlash > 0) world.empFlash -= dt;
  world.stormActive = updateStormClock(world.storm, dt);

  const p = world.player;
  const cloaked = p.cloakTimer > 0;
  if (p.cloakTimer > 0) p.cloakTimer -= dt;

  // Movement: WASD / arrows, with a mouse click throwing a snowball.
  let mx = (input.right ? 1 : 0) - (input.left ? 1 : 0);
  let my = (input.down ? 1 : 0) - (input.up ? 1 : 0);
  const mag = Math.hypot(mx, my);
  if (mag > 0) { mx /= mag; my /= mag; }
  const speed = cloaked ? PLAYER.cloakSpeed : PLAYER.speed;
  p.vx += mx * PLAYER.accel * dt;
  p.vy += my * PLAYER.accel * dt;
  p.vx *= Math.pow(0.0001, dt);
  p.vy *= Math.pow(0.0001, dt);
  const sp = Math.hypot(p.vx, p.vy);
  if (sp > speed) { p.vx = (p.vx / sp) * speed; p.vy = (p.vy / sp) * speed; }
  const moved = moveWithWalls(p.x, p.y, p.vx * dt, p.vy * dt, PLAYER.radius);
  p.moving = Math.hypot(moved.x - p.x, moved.y - p.y) > 0.5;
  p.x = moved.x;
  p.y = moved.y;
  if (p.moving) p.facing = Math.atan2(p.vy, p.vx);

  // Heat trail + heaters.
  world.inHeater = applyHeater(world.heat, p.x, p.y, HEATERS);
  updateHeatTrail(world.heat, p.x, p.y, p.moving, dt, world.stormActive);

  // Snowball impacts fade.
  for (let i = world.snowballs.length - 1; i >= 0; i -= 1) {
    world.snowballs[i].age += dt;
    if (world.snowballs[i].age >= world.snowballs[i].life) world.snowballs.splice(i, 1);
  }

  // --- guards ------------------------------------------------------------
  const coneScale = world.stormActive ? VISION.stormRangeScale : 1;
  let anySpot = false;
  for (const g of world.guards) {
    // Patrol: walk the waypoint loop, pausing at each point.
    if (g.state === 'patrol') {
      const target = g.def.waypoints[g.wp];
      if (g.pauseTimer > 0) {
        g.pauseTimer -= dt;
      } else {
        const dx = target.x - g.x;
        const dy = target.y - g.y;
        const d = Math.hypot(dx, dy);
        if (d < 4) {
          g.wp = (g.wp + 1) % g.def.waypoints.length;
          g.pauseTimer = g.def.pause;
        } else {
          const step = Math.min(d, g.def.speed * dt);
          g.x += (dx / d) * step;
          g.y += (dy / d) * step;
          g.angle = Math.atan2(dy, dx);
        }
      }
      // A fresh heat print nearby pulls the guard off patrol to investigate.
      const print = freshPrintNear(world.heat, g.x, g.y);
      if (print && !cloaked) {
        g.state = 'investigate';
        g.investigate = { x: print.x, y: print.y };
      }
    } else if (g.state === 'investigate') {
      const t = g.investigate;
      const dx = t.x - g.x;
      const dy = t.y - g.y;
      const d = Math.hypot(dx, dy);
      if (d < 10) {
        g.state = 'patrol';
        g.investigate = null;
      } else {
        const step = Math.min(d, g.def.speed * 1.25 * dt);
        g.x += (dx / d) * step;
        g.y += (dy / d) * step;
        g.angle = Math.atan2(dy, dx);
      }
    }

    // Vision: a cone the thief must read before moving.
    const sees = !cloaked
      && inCone(g.x, g.y, g.angle, VISION.guardRange * coneScale, VISION.guardHalfAngle, p.x, p.y)
      && hasLineOfSight(g.x, g.y, p.x, p.y);
    if (sees) {
      anySpot = true;
      g.seenTimer += dt;
      g.state = 'chase';
      g.chaseTimer = 1.5;
    } else if (g.state === 'chase') {
      g.chaseTimer -= dt;
      if (g.chaseTimer <= 0) { g.state = 'patrol'; g.seenTimer = 0; }
    }
  }

  // --- cameras -----------------------------------------------------------
  for (const c of world.cameras) {
    if (c.offTimer > 0) { c.offTimer -= dt; continue; }
    const sweepSpeed = world.stormActive ? 0.6 : 1;
    c.angle = c.def.baseAngle
      + Math.sin((world.time + c.def.phase) * (Math.PI * 2 / c.def.period) * sweepSpeed) * c.def.sweep;
    const sees = !cloaked
      && inCone(c.def.x, c.def.y, c.angle, VISION.cameraRange * coneScale, VISION.cameraHalfAngle, p.x, p.y)
      && hasLineOfSight(c.def.x, c.def.y, p.x, p.y);
    if (sees) anySpot = true;
  }

  // --- alarm -------------------------------------------------------------
  if (anySpot) {
    if (!world.spotted) {
      // Fair caught moment: a grace second and one alarm spike, not an
      // instant loss, so the player can break line of sight and recover.
      world.spotted = true;
      world.graceTimer = GRACE.seconds;
      world.alarm = Math.min(VISION.caughtAt, world.alarm + GRACE.spike);
      if (!world.warnShown) {
        setMessage(world, 'SPOTTED! Break line of sight!', 2.0);
        world.warnShown = true;
      }
    }
    if (world.graceTimer > 0) {
      world.graceTimer -= dt;
    } else {
      world.alarm += VISION.spotPerSecond * dt;
    }
  } else {
    world.spotted = false;
    world.warnShown = false;
    world.alarm = Math.max(0, world.alarm - VISION.decayPerSecond * dt);
  }
  if (world.alarm >= VISION.caughtAt) {
    world.screen = SCREEN_CAUGHT;
    world.best = Math.max(world.best, world.score);
    return EVENT_CAUGHT;
  }

  // --- loot --------------------------------------------------------------
  for (const item of world.loot) {
    if (item.taken) continue;
    const dx = p.x - item.x;
    const dy = p.y - item.y;
    const near = Math.hypot(dx, dy) < 34;
    if (item.kind === 'safe') {
      if (near) {
        item.crack += dt;
        if (item.crack >= LOOT.safeCrackSeconds) {
          item.taken = true;
          world.safeCracked = true;
          world.score += item.value;
          setMessage(world, 'Cryo-safe cracked! +800 — get to the snowcat bay!', 3.5);
        }
      } else {
        item.crack = Math.max(0, item.crack - dt * 2);
      }
    } else if (near) {
      item.taken = true;
      world.score += item.value;
      setMessage(world, `${item.name} secured! +${item.value}`, 2.0);
    }
  }

  // --- getaway -----------------------------------------------------------
  if (world.safeCracked) {
    const e = EXIT.pad;
    const dx = p.x - e.x;
    const dy = p.y - e.y;
    if (dx * dx + dy * dy <= e.r * e.r) {
      const timeBonus = Math.max(0, Math.round((420 - world.time) * LOOT.timeBonusPerSecond));
      world.score += timeBonus;
      world.screen = SCREEN_ESCAPED;
      world.best = Math.max(world.best, world.score);
      return EVENT_ESCAPED;
    }
  }
  return EVENT_NONE;
}

// HUD-ready snapshot: what the renderer and the title screen need.
export function hudState(world) {
  const taken = world.loot.filter((l) => l.taken).length;
  return {
    score: world.score,
    alarm: Math.round(world.alarm),
    time: world.time,
    lootTaken: taken,
    lootTotal: world.loot.length,
    safeCracked: world.safeCracked,
    stormActive: world.stormActive,
    tools: { ...world.tools },
  };
}
