// Arctic Vault: Frostbite Heist — the hand-in program (Node 22, stdlib only).
//
// What it does: it takes this repository's playable game (game/) and its
// screenshots (screenshots/), copies both into the grader's output folder,
// and writes the dossier.json the judge reads, using make.fun's own vendored
// library. Nothing here is fetched, generated or guessed: the same input
// files always produce the same output bytes, so the grader's two runs agree.
//
// Run it outside the grader with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// The repository root is the folder this file lives in.
const repoRoot = fileURLToPath(new URL('.', import.meta.url));
// Inside the grader this is /output; locally MAKEFUN_OUTPUT_DIR overrides it.
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The caps the bounty's gate applies to a handed-in entry. They are passed
// through so this program refuses exactly where the scorer would refuse:
// at most 4 screenshots of 256 KiB, at most 993 game entries totalling
// 48 MiB, and no game path over 1000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function handIn() {
  mkdirSync(outputDir, { recursive: true });

  // The game itself, plain static files, copied whole.
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });

  // The screenshots, when the repository holds any.
  const shotsDir = join(repoRoot, 'screenshots');
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(shotsDir)) {
    cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
  }

  // The dossier is derived from exactly what was just copied, so it can
  // never describe files the entry does not hold.
  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

handIn();
