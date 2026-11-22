// Arctic Vault: Frostbite Heist — shared tuning numbers and palette.
// One job: every magic number the rest of the game reads lives here, so a
// balance tweak never means hunting through the update or render code.
export const VIEW = { width: 1280, height: 800 };
export const HUD_HEIGHT = 64;

// Player movement: brisk on the ice, but never so fast a cone cannot be read.
export const PLAYER = {
  radius: 13,
  speed: 205,
  cloakSpeed: 165,
  accel: 1400,
};

// How far a guard or camera sees, and how wide its cone opens.
export const VISION = {
  guardRange: 185,
  guardHalfAngle: 0.56, // ~32 degrees each side
  cameraRange: 210,
  cameraHalfAngle: 0.48,
  stormRangeScale: 0.55, // blizzards shrink every cone
  spotPerSecond: 42, // alarm gained while inside a guard cone
  cameraPerSecond: 30, // alarm gained while inside a camera cone
  decayPerSecond: 6, // alarm slowly falls back when unseen
  caughtAt: 100,
  warnAt: 60,
};

// The fair caught moment: the first spot each chase gives a grace window
// before the alarm can climb, so a single frame of exposure never ends a run.
export const GRACE = { seconds: 1.0, spike: 18 };

// Thermal vision: the thief's heat footprints, and the storm that hides them.
export const HEAT = {
  dropEvery: 0.12, // seconds between footprints while moving
  life: 6, // seconds until a footprint fades
  stormLife: 3, // footprints fade twice as fast in a blizzard
  guardNoticeRadius: 80, // a guard this close to a fresh print investigates
  freshFor: 2.5, // prints younger than this pull a guard in
  heaterRadius: 62,
  heaterClearSeconds: 3, // standing in heat leaves no trail for this long
};

// Blizzards roll in on a fixed clock so a run can be planned around them.
export const STORM = { every: 26, lasts: 6 };

// Tools cost charges, never health: spend them badly and the vault wins.
export const TOOLS = {
  emp: { charges: 2, cameraOffSeconds: 6, label: 'EMP burst' },
  snowball: { charges: 3, lureRadius: 210, label: 'Snowball decoy' },
  cloak: { charges: 1, seconds: 4, label: 'Thermal cloak' },
};

// Loot values. The cryo-safe is the job: crack it, then reach the snowcat bay.
export const LOOT = {
  diamond: 500,
  core: 250,
  safe: 800,
  safeCrackSeconds: 2.0,
  timeBonusPerSecond: 4,
};

// Frost palette: ice blue corridors, warm amber loot, red danger.
export const COLORS = {
  floor: '#0d1b2e',
  floorAlt: '#10233c',
  wall: '#5d7ea6',
  wallEdge: '#8fb4d9',
  ice: '#bfe6ff',
  snow: '#eaf6ff',
  thief: '#ffd166',
  thiefRing: '#fff3c4',
  guard: '#ff5d5d',
  guardCone: 'rgba(255, 93, 93, 0.20)',
  camera: '#ff9f1c',
  cameraCone: 'rgba(255, 159, 28, 0.18)',
  loot: '#ffd166',
  diamond: '#7df9ff',
  core: '#9dff6e',
  safe: '#ffb703',
  heater: '#ff7b00',
  exit: '#2ec4b6',
  alarmLow: '#2ec4b6',
  alarmMid: '#ffb703',
  alarmHigh: '#ff5d5d',
  heat: 'rgba(255, 122, 26, 0.55)',
  text: '#eaf6ff',
  dim: '#9db8d2',
};
