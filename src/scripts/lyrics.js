/**
 * Beat-synced lyric display.
 *
 * The JSON carries line-level cues. Word timings inside a line are
 * interpolated by word length, which tracks a rapped line closely enough
 * at this size and means the timing file stays small enough to hand-tune.
 *
 * Accessibility note: the animated box is aria-hidden. The <audio> element
 * ships a real WebVTT caption track, and that is what assistive tech and
 * the browser's own caption UI use. Two synchronised sources of the same
 * words would just talk over each other.
 */

const audio = document.querySelector('[data-track]');
const display = document.getElementById('lyric-box');
const lineOut = document.querySelector('[data-lyric-line]');

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

let cues = [];
let frame = null;
let lastWord = null;

const IDLE = 'Press play';

function setIdle() {
  if (!display) return;
  display.dataset.idle = 'true';
  display.textContent = IDLE;
  if (lineOut) lineOut.textContent = '';
  lastWord = null;
}

/** Split a line into words, each given a slice of the line proportional to its length. */
function toWords(line) {
  const tokens = line.text.split(/\s+/).filter(Boolean);
  const span = Math.max(0.001, line.end - line.start);
  const weight = tokens.reduce((total, word) => total + word.length + 1, 0);

  let cursor = line.start;
  return tokens.map((word) => {
    const duration = ((word.length + 1) / weight) * span;
    const entry = { text: word, start: cursor, end: cursor + duration };
    cursor += duration;
    return entry;
  });
}

async function load() {
  if (!audio || !display) return;
  try {
    const response = await fetch('/lyrics/cantclickthis.json');
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    cues = data.lines.map((line) => ({ ...line, words: toWords(line) }));
    setIdle();
  } catch {
    // No timing file is not a reason to break the hero.
    setIdle();
  }
}

function paint() {
  const now = audio.currentTime;
  const line = cues.find((cue) => now >= cue.start && now <= cue.end);
  const word = line?.words.find((entry) => now >= entry.start && now <= entry.end);

  if (lineOut) lineOut.textContent = line ? line.text : '';

  if (word && word.text !== lastWord) {
    lastWord = word.text;
    delete display.dataset.idle;
    display.textContent = word.text;

    if (!reduceMotion.matches) {
      display.classList.remove('bounce');
      void display.offsetWidth; // force reflow so the animation restarts
      display.classList.add('bounce');
    }
  }

  if (!line && display.dataset.idle !== 'true' && !audio.paused) {
    display.textContent = '\u2022\u2022\u2022';
    lastWord = null;
  }

  if (!audio.paused && !audio.ended) frame = requestAnimationFrame(paint);
}

audio?.addEventListener('play', () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(paint);
});

audio?.addEventListener('pause', () => cancelAnimationFrame(frame));
audio?.addEventListener('ended', () => { cancelAnimationFrame(frame); setIdle(); });
audio?.addEventListener('seeking', () => { lastWord = null; });

load();
