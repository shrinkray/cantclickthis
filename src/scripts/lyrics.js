/**
 * Beat-synced lyric display.
 *
 * Consecutive lines that share a `part` (Intro, Chorus, Verse, Outro) are
 * one stanza. The stage shows the whole stanza and marks the line that
 * matches the playhead — no word-level interpolation.
 *
 * Accessibility note: the animated box is aria-hidden. The <audio> element
 * ships a real WebVTT caption track, and that is what assistive tech and
 * the browser's own caption UI use. Two synchronised sources of the same
 * words would just talk over each other.
 */

const audio = document.querySelector('[data-track]');
const display = document.getElementById('lyric-box');

let stanzas = [];
let frame = null;
let lastStanzaStart = null;
let lastLineIndex = null;

const IDLE = 'Press play';

function setIdle() {
  if (!display) return;
  display.dataset.idle = 'true';
  display.textContent = IDLE;
  lastStanzaStart = null;
  lastLineIndex = null;
}

/** Group consecutive lines with the same `part` so two Choruses stay separate. */
function toStanzas(lines) {
  const groups = [];
  for (const line of lines) {
    const current = groups[groups.length - 1];
    if (current && current.part === line.part) {
      current.lines.push(line);
      current.end = line.end;
    } else {
      groups.push({
        part: line.part,
        start: line.start,
        end: line.end,
        lines: [line]
      });
    }
  }
  return groups;
}

function renderStanza(stanza, currentIndex) {
  delete display.dataset.idle;

  const part = document.createElement('span');
  part.className = 'lyric-part';
  part.textContent = stanza.part;

  const rows = stanza.lines.map((line, index) => {
    const row = document.createElement('span');
    row.className = 'lyric-line';
    if (index === currentIndex) row.dataset.current = 'true';
    row.textContent = line.text;
    return row;
  });

  display.replaceChildren(part, ...rows);
}

function markCurrent(currentIndex) {
  display.querySelectorAll('.lyric-line').forEach((row, index) => {
    if (index === currentIndex) row.dataset.current = 'true';
    else delete row.dataset.current;
  });
}

async function load() {
  if (!audio || !display) return;
  try {
    const response = await fetch('/lyrics/cantclickthis.json');
    if (!response.ok) throw new Error(String(response.status));
    const data = await response.json();
    stanzas = toStanzas(data.lines);
    setIdle();
  } catch {
    // No timing file is not a reason to break the hero.
    setIdle();
  }
}

function paint() {
  const now = audio.currentTime;
  const stanza = stanzas.find((group) => now >= group.start && now <= group.end);

  if (stanza) {
    const lineIndex = stanza.lines.findIndex((line) => now >= line.start && now <= line.end);
    if (stanza.start !== lastStanzaStart) {
      lastStanzaStart = stanza.start;
      lastLineIndex = lineIndex;
      renderStanza(stanza, lineIndex);
    } else if (lineIndex !== lastLineIndex) {
      lastLineIndex = lineIndex;
      markCurrent(lineIndex);
    }
  } else if (display.dataset.idle !== 'true' && !audio.paused) {
    display.textContent = '\u2022\u2022\u2022';
    lastStanzaStart = null;
    lastLineIndex = null;
  }

  if (!audio.paused && !audio.ended) frame = requestAnimationFrame(paint);
}

audio?.addEventListener('play', () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(paint);
});

audio?.addEventListener('pause', () => cancelAnimationFrame(frame));
audio?.addEventListener('ended', () => { cancelAnimationFrame(frame); setIdle(); });
audio?.addEventListener('seeking', () => {
  lastStanzaStart = null;
  lastLineIndex = null;
});

load();
