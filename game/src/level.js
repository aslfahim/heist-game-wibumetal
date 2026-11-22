// Arctic Vault: Frostbite Heist — the station floor plan.
// One job: the walls, rooms, loot, patrols, cameras, heaters and the exit,
// as plain data, so the world and the renderer never argue about the map.
//
// Layout (1280x800, HUD occupies the top 64 px):
//   Lab wing (top-left, frozen diamond) | Server hall (top-centre, data cores)
//   Freezer aisle (top-right, cryo-safe) | Lower corridor + snowcat bay (exit)
import { HUD_HEIGHT } from './config.js';

const T = 16; // outer wall thickness
const W = 1280;
const H = 800;

// Walls are solid rectangles. Door gaps are simply missing segments.
export const WALLS = [
  // Outer shell.
  { x: 0, y: HUD_HEIGHT, w: W, h: T },
  { x: 0, y: H - T, w: W, h: T },
  { x: 0, y: HUD_HEIGHT, w: T, h: H - HUD_HEIGHT },
  { x: W - T, y: HUD_HEIGHT, w: T, h: H - HUD_HEIGHT },
  // Lab wing (left) vs server hall: vertical divider with two door gaps.
  { x: 420, y: HUD_HEIGHT + T, w: T, h: 120 },
  { x: 420, y: 300, w: T, h: 110 },
  // Server hall vs freezer aisle: vertical divider with two door gaps.
  { x: 844, y: HUD_HEIGHT + T, w: T, h: 120 },
  { x: 844, y: 300, w: T, h: 110 },
  // Floor between the upper wings and the lower corridor, with three doors.
  { x: T, y: 410, w: 150, h: T },
  { x: 246, y: 410, w: 174, h: T },
  { x: 496, y: 410, w: 150, h: T },
  { x: 722, y: 410, w: 122, h: T },
  { x: 920, y: 410, w: 150, h: T },
  { x: 1146, y: 410, w: 118, h: T },
  // Freezer aisle rack rows (cover, not full walls — gaps at both ends).
  { x: 920, y: 150, w: 180, h: 18 },
  { x: 920, y: 260, w: 180, h: 18 },
  { x: 1080, y: 150, w: 130, h: 18 },
  // Server rack rows in the hall.
  { x: 500, y: 150, w: 200, h: 18 },
  { x: 500, y: 260, w: 200, h: 18 },
  // Lab benches.
  { x: 60, y: 150, w: 190, h: 18 },
  { x: 60, y: 280, w: 190, h: 18 },
  // Lower-corridor pillars for cover while crossing to the bay.
  { x: 420, y: 560, w: 26, h: 90 },
  { x: 700, y: 560, w: 26, h: 90 },
  { x: 980, y: 560, w: 26, h: 90 },
];

// Named rooms, drawn as floor tints and labels on the map.
export const ROOMS = [
  { name: 'LAB WING', x: 16, y: 80, w: 404, h: 330, tint: '#122a4a' },
  { name: 'SERVER HALL', x: 436, y: 80, w: 408, h: 330, tint: '#0f2c33' },
  { name: 'FREEZER AISLE', x: 860, y: 80, w: 404, h: 330, tint: '#1a2f4d' },
  { name: 'SNOWCAT BAY', x: 16, y: 426, w: 300, h: 358, tint: '#123038' },
  { name: 'LOWER CORRIDOR', x: 316, y: 426, w: 948, h: 358, tint: '#0d1b2e' },
];

// Loot targets. kind: 'diamond' | 'core' | 'safe'. The safe needs a crack time.
export const LOOT_SPOTS = [
  { id: 'diamond', kind: 'diamond', name: 'Frozen Diamond', x: 210, y: 215, value: 500 },
  { id: 'core-a', kind: 'core', name: 'Research Data Core', x: 600, y: 205, value: 250 },
  { id: 'core-b', kind: 'core', name: 'Research Data Core', x: 760, y: 330, value: 250 },
  { id: 'safe', kind: 'safe', name: 'Cryo-Safe', x: 1150, y: 205, value: 800 },
];

// Guards patrol waypoint loops. speed is px/s; pause is the dwell at each point.
export const GUARDS = [
  {
    id: 'g-lab', name: 'Guard Mara', color: '#ff5d5d',
    waypoints: [{ x: 90, y: 350 }, { x: 350, y: 350 }, { x: 350, y: 110 }, { x: 90, y: 110 }],
    speed: 78, pause: 0.7,
  },
  {
    id: 'g-server', name: 'Guard Ilya', color: '#ff8a5d',
    waypoints: [{ x: 470, y: 100 }, { x: 810, y: 100 }, { x: 810, y: 380 }, { x: 470, y: 380 }],
    speed: 88, pause: 0.5,
  },
  {
    id: 'g-freezer', name: 'Guard Sanna', color: '#ff5d8f',
    waypoints: [{ x: 900, y: 360 }, { x: 1220, y: 360 }, { x: 1220, y: 110 }, { x: 900, y: 110 }],
    speed: 82, pause: 0.6,
  },
  {
    id: 'g-corridor', name: 'Guard Pavel', color: '#e05dff',
    waypoints: [{ x: 360, y: 700 }, { x: 1220, y: 700 }, { x: 1220, y: 480 }, { x: 360, y: 480 }],
    speed: 95, pause: 0.4,
  },
];

// Thermal cameras sweep a fixed arc from a wall mount.
export const CAMERAS = [
  { id: 'c-lab', x: 428, y: 90, baseAngle: 0.6, sweep: 0.9, period: 5.0, phase: 0 },
  { id: 'c-server', x: 640, y: 88, baseAngle: 1.57, sweep: 1.1, period: 6.0, phase: 1.7 },
  { id: 'c-freezer', x: 1248, y: 90, baseAngle: 2.4, sweep: 0.9, period: 5.4, phase: 3.1 },
];

// Heaters are safe spots: standing in one erases the heat trail.
export const HEATERS = [
  { x: 520, y: 700, r: 62 },
  { x: 950, y: 700, r: 62 },
  { x: 640, y: 470, r: 54 },
];

// The getaway: reach the snowcat bay after cracking the cryo-safe.
export const EXIT = { x: 16, y: 426, w: 300, h: 358, pad: { x: 150, y: 660, r: 70 } };
export const PLAYER_START = { x: 150, y: 700 };

// Circle-vs-wall test shared by movement, sight and the autopilot.
export function circleHitsWall(x, y, r) {
  for (const w of WALLS) {
    const cx = Math.max(w.x, Math.min(x, w.x + w.w));
    const cy = Math.max(w.y, Math.min(y, w.y + w.h));
    const dx = x - cx;
    const dy = y - cy;
    if (dx * dx + dy * dy < r * r) return true;
  }
  return false;
}

// True when the segment from (ax,ay) to (bx,by) crosses no wall: line of sight.
export function hasLineOfSight(ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const dist = Math.hypot(dx, dy);
  const steps = Math.max(1, Math.ceil(dist / 8));
  for (let i = 1; i < steps; i += 1) {
    const t = i / steps;
    const x = ax + dx * t;
    const y = ay + dy * t;
    for (const w of WALLS) {
      if (x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h) return false;
    }
  }
  return true;
}
