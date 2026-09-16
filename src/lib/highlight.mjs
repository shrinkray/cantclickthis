// @ts-check
/**
 * Tiny build-time syntax highlighter.
 *
 * Runs in Astro's frontmatter, so the browser receives plain static HTML —
 * no highlighter bundle, no runtime cost, no dependency to audit.
 * Handles the only two languages this site ships: HTML and CSS.
 *
 * @typedef {object} SnippetNote
 * @property {number} line 1-based line number to flag in the gutter.
 * @property {string} text Why this line matters.
 *
 * @typedef {object} Snippet
 * @property {string} code Source text.
 * @property {'html' | 'css'} [lang]
 * @property {SnippetNote[]} notes
 */

/** @type {Record<string, string>} */
const ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/** @param {string} s */
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ESCAPES[c]);

/**
 * @param {string} cls
 * @param {string} text
 */
const wrap = (cls, text) => `<span class="tok tok--${cls}">${esc(text)}</span>`;

/**
 * Highlight one line of HTML.
 * @param {string} line
 */
function html(line) {
  let out = '';
  let i = 0;

  while (i < line.length) {
    // Comment
    if (line.startsWith('<!--', i)) {
      const end = line.indexOf('-->', i);
      const stop = end === -1 ? line.length : end + 3;
      out += wrap('comment', line.slice(i, stop));
      i = stop;
      continue;
    }

    // Tag
    if (line[i] === '<') {
      const end = line.indexOf('>', i);
      const stop = end === -1 ? line.length : end + 1;
      out += tag(line.slice(i, stop));
      i = stop;
      continue;
    }

    // Text node
    const next = line.indexOf('<', i);
    const stop = next === -1 ? line.length : next;
    out += esc(line.slice(i, stop));
    i = stop;
  }

  return out;
}

/**
 * Highlight the inside of a single `<...>` tag.
 * @param {string} src
 */
function tag(src) {
  const parts = src.match(/^(<\/?)([a-zA-Z][\w:-]*)?([\s\S]*?)(\/?>)?$/);
  if (!parts) return esc(src);

  const [, open, name = '', attrs = '', close = ''] = parts;
  let out = wrap('punct', open) + (name ? wrap('tag', name) : '');

  let rest = attrs;
  const attrRe = /([\s]+)([a-zA-Z_:@#][\w:.@-]*)(\s*=\s*)?("[^"]*"|'[^']*')?/g;
  let m;
  let cursor = 0;

  while ((m = attrRe.exec(rest)) !== null) {
    out += esc(rest.slice(cursor, m.index));
    out += esc(m[1]);
    out += wrap('attr', m[2]);
    if (m[3]) out += wrap('punct', m[3]);
    if (m[4]) out += wrap('string', m[4]);
    cursor = m.index + m[0].length;
  }
  out += esc(rest.slice(cursor));

  return out + (close ? wrap('punct', close) : '');
}

/**
 * Highlight one line of CSS.
 * @param {string} line
 */
function css(line) {
  if (/^\s*\/\*/.test(line) || /\*\/\s*$/.test(line)) return wrap('comment', line);

  const decl = line.match(/^(\s*)([-a-zA-Z]+)(\s*:\s*)(.*?)(;?)(\s*)$/);
  if (decl) {
    const [, lead, prop, colon, value, semi, trail] = decl;
    return (
      esc(lead) +
      wrap('attr', prop) +
      wrap('punct', colon) +
      wrap('string', value) +
      wrap('punct', semi) +
      esc(trail)
    );
  }

  const selector = line.match(/^(.*?)(\s*[{}]\s*)$/);
  if (selector) return wrap('tag', selector[1]) + wrap('punct', selector[2]);

  return esc(line);
}

/** @type {{ html: (line: string) => string, css: (line: string) => string }} */
const LANGS = { html, css };

/**
 * Render a snippet as static, line-numbered, annotated HTML.
 *
 * @param {Snippet} snippet
 * @returns {string} HTML for the inside of a <code> element.
 */
export function renderSnippet({ code, lang = 'html', notes = [] }) {
  const highlighter = lang === 'css' ? LANGS.css : LANGS.html;
  const flagged = new Map(notes.map((n, index) => [n.line, index + 1]));

  return code
    .replace(/\s+$/, '')
    .split('\n')
    .map((line, index) => {
      const number = index + 1;
      const noteIndex = flagged.get(number);
      const classes = noteIndex ? 'cline cline--flagged' : 'cline';
      // The visually hidden marker keeps the flag in the accessibility tree:
      // a sighted user sees the gutter mark, a screen reader user hears it.
      const marker = noteIndex
        ? `<span class="vh"> (flagged, see note ${noteIndex}) </span>`
        : '';
      return `<span class="${classes}">${marker}${highlighter(line) || '&nbsp;'}</span>`;
    })
    .join('\n');
}
