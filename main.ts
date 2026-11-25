// Dapur Rush — hand-in program (Node 22+, standard library only).
//
// The game itself is the static site in game/ (open game/index.html in a
// browser, no build step, no network). This program delivers it: it copies
// game/ and screenshots/ into the output directory and writes dossier.json
// there with the vendored make.fun library, exactly the summary the judge
// reads. In the grader the output directory is /output; anywhere else the
// MAKEFUN_OUTPUT_DIR environment variable names it.
//
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outputDir, 'game'), { recursive: true });

const shotsDir = join(repoDir, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// The caps below are the scorer's own limits, passed to the library so the
// dossier it writes is the one the gate rebuilds and compares byte for byte.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
