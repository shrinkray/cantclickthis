#!/usr/bin/env node
/**
 * Regenerates public/lyrics/cantclickthis.vtt from cantclickthis.json.
 *
 * The JSON drives the on-screen karaoke animation; the VTT drives the real
 * <track> captions. One source of truth so they can never drift apart.
 *
 *   pnpm run lyrics
 */

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const jsonPath = resolve(here, '../public/lyrics/cantclickthis.json');
const vttPath = resolve(here, '../public/lyrics/cantclickthis.vtt');

const stamp = (seconds) => {
  const total = Math.max(0, Number(seconds));
  const hh = String(Math.floor(total / 3600)).padStart(2, '0');
  const mm = String(Math.floor((total % 3600) / 60)).padStart(2, '0');
  const ss = String(Math.floor(total % 60)).padStart(2, '0');
  const ms = String(Math.round((total % 1) * 1000)).padStart(3, '0');
  return `${hh}:${mm}:${ss}.${ms}`;
};

const { meta, lines } = JSON.parse(await readFile(jsonPath, 'utf8'));

const cues = lines.map((line, index) => {
  // Non-speech audio gets square brackets — that is the caption convention,
  // and it is the difference between "silence" and "something happened".
  const text = line.kind === 'sound' && !line.text.startsWith('[')
    ? `[${line.text}]`
    : line.text;

  return `${index + 1}\n${stamp(line.start)} --> ${stamp(line.end)}\n${text}\n`;
});

const vtt = [
  'WEBVTT',
  `NOTE ${meta.title} — ${meta.artist}`,
  meta.timingsVerified ? 'NOTE Timings verified against audio.' : 'NOTE Timings are estimates. Run /lyric-timer to correct them.',
  '',
  ...cues
].join('\n');

await writeFile(vttPath, vtt, 'utf8');
console.log(`Wrote ${lines.length} cues to public/lyrics/cantclickthis.vtt`);
