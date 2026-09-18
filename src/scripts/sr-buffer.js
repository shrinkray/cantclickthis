/**
 * The screen reader buffer.
 *
 * Approximates what NVDA or VoiceOver would announce for whatever element
 * has focus, and prints it on screen. It is a teaching aid for the room —
 * not a screen reader, and not a conformance tool. Names are computed the
 * way the accname spec orders them, but simplified.
 *
 * The log itself is aria-hidden: anyone actually running a screen reader is
 * already hearing this, and a live mirror of it would double every word.
 */

const panel = document.querySelector('[data-buffer]');
const log = document.querySelector('[data-buffer-log]');
const toggle = document.querySelector('[data-buffer-toggle]');

const MAX_ENTRIES = 8;

/* ---- Role -------------------------------------------------------------- */

function roleOf(el) {
  const explicit = el.getAttribute('role');
  if (explicit) return explicit;

  const tag = el.tagName.toLowerCase();
  const type = (el.getAttribute('type') || 'text').toLowerCase();

  const map = {
    a: el.hasAttribute('href') ? 'link' : '',
    button: 'button',
    select: 'combo box',
    textarea: 'edit text',
    summary: 'disclosure triangle',
    output: 'output',
    nav: 'navigation',
    main: 'main',
    form: 'form',
    figure: 'figure',
    img: el.getAttribute('alt') === '' ? '' : 'graphic'
  };

  if (tag === 'input') {
    if (type === 'checkbox') return 'checkbox';
    if (type === 'radio') return 'radio button';
    if (type === 'submit' || type === 'button') return 'button';
    return 'edit text';
  }
  if (/^h[1-6]$/.test(tag)) return `heading level ${tag[1]}`;

  return map[tag] ?? '';
}

/* ---- Accessible name --------------------------------------------------- */

function textOf(el) {
  return (el.textContent || '').replace(/\s+/g, ' ').trim();
}

function nameOf(el) {
  const labelledby = el.getAttribute('aria-labelledby');
  if (labelledby) {
    const parts = labelledby
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map(textOf);
    if (parts.length) return parts.join(' ');
  }

  const ariaLabel = el.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();

  const tag = el.tagName.toLowerCase();

  if (tag === 'img') return el.getAttribute('alt') ?? '';

  if (tag === 'input' || tag === 'select' || tag === 'textarea') {
    if (el.id) {
      const bound = document.querySelector(`label[for="${CSS.escape(el.id)}"]`);
      if (bound) return textOf(bound);
    }
    const wrapping = el.closest('label');
    if (wrapping) return textOf(wrapping);
    return '';
  }

  const own = textOf(el);
  if (own) return own;

  return el.getAttribute('title') || '';
}

/* ---- States and warnings ----------------------------------------------- */

function statesOf(el) {
  const states = [];
  if (el.getAttribute('aria-checked') === 'true') states.push('on');
  if (el.getAttribute('aria-checked') === 'false') states.push('off');
  if (el.getAttribute('aria-pressed') === 'true') states.push('pressed');
  if (el.hasAttribute('required') || el.getAttribute('aria-required') === 'true') states.push('required');
  if (el.disabled) states.push('dimmed');
  if (el.getAttribute('aria-expanded') === 'true') states.push('expanded');
  if (el.getAttribute('aria-expanded') === 'false') states.push('collapsed');

  const describedby = el.getAttribute('aria-describedby');
  if (describedby) {
    const hint = describedby
      .split(/\s+/)
      .map((id) => document.getElementById(id))
      .filter(Boolean)
      .map(textOf)
      .join(' ');
    if (hint) states.push(hint);
  }
  return states;
}

const NATIVELY_INTERACTIVE = new Set(['a', 'button', 'input', 'select', 'textarea', 'summary']);

function warningsOf(el) {
  const warnings = [];
  const tag = el.tagName.toLowerCase();
  const interactive =
    NATIVELY_INTERACTIVE.has(tag) ||
    el.hasAttribute('tabindex') ||
    ['button', 'link', 'switch', 'checkbox'].includes(el.getAttribute('role') || '');

  if (el.matches('[data-action]') && !interactive) {
    warnings.push('Clickable, but not reachable by keyboard and announced with no role.');
  }
  if (tag === 'a' && !el.hasAttribute('href')) {
    warnings.push('Anchor with no href is not a link and not focusable.');
  }
  if ((tag === 'input' || tag === 'textarea') && !nameOf(el)) {
    warnings.push('No label. Placeholder text is not a label.');
  }
  if (tag === 'img' && el.getAttribute('alt') === null) {
    warnings.push('No alt attribute. Some screen readers will read the filename instead.');
  }
  if (el.classList.contains('lab-fakehead')) {
    warnings.push('Looks like a heading, announced as plain text. It will not appear in a headings list.');
  }
  if (/^h[1-6]$/.test(tag)) {
    const stage = el.closest('[data-stage]');
    if (stage) {
      const headings = [...stage.querySelectorAll('h1, h2, h3, h4, h5, h6')];
      const index = headings.indexOf(el);
      const current = Number(tag[1]);
      if (index === 0 && current > 2) {
        warnings.push(`First heading in this example is level ${current}. Start at 1 or 2, then go down one step at a time.`);
      } else if (index > 0) {
        const previous = Number(headings[index - 1].tagName[1]);
        if (current > previous + 1) {
          warnings.push(`Skipped heading level. Previous was ${previous}, this is ${current}.`);
        }
      }
    }
  }
  return warnings;
}

/* ---- Rendering --------------------------------------------------------- */

function describe(el) {
  const name = nameOf(el);
  const role = roleOf(el);
  const states = statesOf(el);

  const spoken = [name, role, ...states].filter(Boolean).join(', ');
  return {
    spoken: spoken || '(nothing announced)',
    silent: !spoken,
    warnings: warningsOf(el),
    tag: `<${el.tagName.toLowerCase()}>`
  };
}

function push(el, source) {
  if (!panel || panel.hidden || !log) return;

  const { spoken, silent, warnings, tag } = describe(el);

  const item = document.createElement('li');
  const line = document.createElement('span');
  line.textContent = silent ? '(silence)' : spoken;
  item.append(line);

  const meta = document.createElement('span');
  meta.className = 'muted';
  meta.textContent = `  ${tag} · ${source}`;
  item.append(meta);

  warnings.forEach((text) => {
    const warn = document.createElement('span');
    warn.className = 'buffer__warn';
    warn.textContent = `  ! ${text}`;
    item.append(document.createElement('br'), warn);
  });

  log.prepend(item);
  while (log.children.length > MAX_ENTRIES) log.lastElementChild.remove();
}

/* ---- Wiring ------------------------------------------------------------ */

document.addEventListener('focusin', (event) => {
  if (event.target === document.body) return;
  push(event.target, 'focused');
});

// Mouse users get a reading too, otherwise the broken div stays invisible
// to the demo exactly when we most need the room to see it.
document.addEventListener('pointerdown', (event) => {
  const target = event.target.closest('[data-stage] *');
  if (target) push(target, 'clicked');
});

toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') !== 'true';
  toggle.setAttribute('aria-expanded', String(open));
  panel.hidden = !open;
  toggle.querySelector('[data-buffer-label]').textContent =
    open ? 'Hide screen reader buffer' : 'Show screen reader buffer';
  if (open) push(document.activeElement, 'focused');
});
