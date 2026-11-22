# Arctic Vault: Frostbite Heist

[![make.fun bounty](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/aslfahim/heist-game-wibumetal/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/aslfahim/heist-game-wibumetal/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559)

A top-down stealth heist game set in a frozen research station, built for make.fun's **"Make the best heist game"** bounty.

You are the thief crossing the Arctic Vault: sneak past patrolling guards and sweeping thermal cameras, crack the Cryo-Safe, grab the frozen diamond and the research data cores, then escape by snowcat into the blizzard.

## The twist: thermal vision

- **Heat footprints** — every step leaves a fading heat trail. Guards who spot a fresh print come to investigate it.
- **Blizzards** — every 26 seconds a storm rolls in for 6 seconds, shrinking every vision cone. Use the storm to move.
- **Heaters** — standing in a heater's glow erases your whole heat trail.

## Tools (each costs charges)

- **1 — EMP burst**: cameras dark for 6 seconds (2 charges).
- **2 + click — Snowball decoy**: lures nearby guards to the impact point (3 charges).
- **3 — Thermal cloak**: invisible to cones for 4 seconds (1 charge).

## The fair caught moment

Getting spotted spikes the alarm and starts a 1-second grace window — break line of sight and the alarm falls back. Only at 100% are you caught.

## Play

Serve `game/` with any static server and open `game/index.html` in desktop Chrome — no network requests, no build step.

- **WASD / arrows** — move
- **1 / 2 / 3** — tools (click to throw the snowball)
- **Enter** — start / restart

Win by cracking the Cryo-Safe and reaching the snowcat bay. The getaway pays a time bonus.

## Layout

- `main.ts` — the hand-in program: copies `game/` + `screenshots/` to the output dir and writes `dossier.json`.
- `game/index.html` — the page; `game/src/` holds the game split by job: `config.js` (tuning), `level.js` (floor plan), `heat.js` (thermal trail + storms), `world.js` (rules), `render.js` (drawing + HUD), `input.js` (keys/mouse), `shots.js` (screenshot scenes), `main.js` (loop).
- `screenshots/` — real renders of the game's own code (`?scene=cover|storm|loot|escape`).
- `vendor/makefun-game.ts` — make.fun's dossier library, unchanged from the kit.
- `LICENSE` — MIT.

## Build

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```
