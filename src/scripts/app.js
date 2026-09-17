/**
 * cantclickthis.dev — page behaviour.
 *
 * Deliberately dependency-free and readable: attendees are going to open
 * devtools and read this during the talk.
 */

const announcer = document.querySelector('[data-announce]');

/** Speak something to assistive tech without moving focus or changing layout. */
function announce(message) {
  if (!announcer) return;
  announcer.textContent = '';
  // A frame's gap guarantees the live region fires even for repeat messages.
  requestAnimationFrame(() => { announcer.textContent = message; });
}

/* ------------------------------------------------------------------ *
 * 1. Fail / fix switches
 *
 * Each swap clones a <template> into the live DOM rather than toggling
 * `hidden` on two copies. That matters: the broken and fixed markup are
 * never both present, so the accessibility tree a screen reader walks is
 * genuinely the one on screen.
 * ------------------------------------------------------------------ */

function setupUnit(unit) {
  const control = unit.querySelector('[data-switch]');
  const stage = unit.querySelector('[data-stage]');
  const lab = unit.querySelector('[data-lab]');
  const pill = unit.querySelector('[data-statepill]');
  const templates = {
    fail: unit.querySelector('template[data-state="fail"]'),
    fix: unit.querySelector('template[data-state="fix"]')
  };
  if (!control || !stage || !templates.fail || !templates.fix) return;

  const title = unit.querySelector('[data-unit-title]')?.textContent?.trim() ?? 'demo';

  function render(state, { userInitiated = false } = {}) {
    // If focus is inside the node we are about to destroy, catch it on the
    // switch instead of letting it fall to <body> — WCAG 3.2.2 On Input.
    const focusWasInside = stage.contains(document.activeElement);

    stage.replaceChildren(templates[state].content.cloneNode(true));

    control.setAttribute('aria-checked', String(state === 'fix'));
    lab.dataset.state = state;
    pill.dataset.state = state;
    pill.textContent = state === 'fix' ? 'Fixed markup' : 'Broken markup';

    unit.querySelectorAll('[data-kind]').forEach((pane) => {
      pane.dataset.active = String(pane.dataset.kind === state);
    });

    if (focusWasInside) control.focus();
    if (userInitiated) {
      announce(`${title}: ${state === 'fix' ? 'fixed' : 'broken'} version loaded.`);
    }
  }

  control.addEventListener('click', () => {
    const next = control.getAttribute('aria-checked') === 'true' ? 'fail' : 'fix';
    render(next, { userInitiated: true });
  });

  render('fail');
}

document.querySelectorAll('[data-unit]').forEach(setupUnit);

/* ------------------------------------------------------------------ *
 * 2. Demo component behaviour (event delegation)
 *
 * One click listener serves both states. The broken div gets its click
 * handled exactly like the real button — which is the whole trap: with a
 * mouse the two are indistinguishable.
 * ------------------------------------------------------------------ */

document.addEventListener('click', (event) => {
  const trigger = event.target.closest('[data-action]');
  if (!trigger) return;

  if (trigger.dataset.action === 'cart') {
    const output = trigger.closest('[data-stage]')?.querySelector('[data-cart]');
    if (output) output.textContent = String(Number(output.textContent || 0) + 1);
  }

  if (trigger.dataset.action === 'noop') event.preventDefault();

  if (trigger.dataset.action === 'linklist') {
    const unit = trigger.closest('[data-unit]');
    const panel = unit?.querySelector('[data-linklist-out]');
    if (!unit || !panel) return;
    const links = [...unit.querySelectorAll('[data-linksource] a')];
    const items = links
      .map((link) => `<li>${link.textContent.trim()}</li>`)
      .join('');
    panel.innerHTML = `<p>Links on this page (${links.length})</p><ol>${items}</ol>`;
    announce(`Links list generated. ${links.length} links.`);
  }
});

document.addEventListener('submit', (event) => {
  const form = event.target.closest('[data-demo-form]');
  if (!form) return;
  event.preventDefault();

  const status = form.querySelector('[data-form-status]');
  const labelled = form.querySelector('label[for]') !== null;
  if (!status) return;

  status.textContent = labelled
    ? 'Signed up. This message is announced, because it lives in a status region.'
    : 'Signed up. (Nothing announced this — the message is plain text.)';
});

/* ------------------------------------------------------------------ *
 * 3. Jump navigation — mark the section currently on screen
 * ------------------------------------------------------------------ */

const jumpLinks = new Map(
  [...document.querySelectorAll('[data-jump] a')].map((link) => [
    link.getAttribute('href').slice(1),
    link
  ])
);

if (jumpLinks.size > 0 && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const link = jumpLinks.get(entry.target.id);
        if (!link) return;
        if (entry.isIntersecting) {
          jumpLinks.forEach((other) => other.removeAttribute('aria-current'));
          link.setAttribute('aria-current', 'true');
        }
      });
    },
    { threshold: 0.55 }
  );

  jumpLinks.forEach((_, id) => {
    const target = document.getElementById(id);
    if (target) observer.observe(target);
  });
}

/* ------------------------------------------------------------------ *
 * 4. Capture mode — scroll snapping for clean 1080p section grabs
 *
 * On by default on a large screen, off everywhere else, and always
 * overridable. Mandatory snapping is great for recording and hostile on a
 * short window, so it stays a choice rather than a rule.
 * ------------------------------------------------------------------ */

const snapToggle = document.querySelector('[data-snap-toggle]');
const SNAP_KEY = 'cct:snap';

function setSnap(on) {
  document.documentElement.classList.toggle('snap', on);
  if (snapToggle) {
    snapToggle.setAttribute('aria-pressed', String(on));
    snapToggle.querySelector('[data-snap-label]').textContent =
      on ? 'Capture mode: on' : 'Capture mode: off';
  }
  try { localStorage.setItem(SNAP_KEY, on ? '1' : '0'); } catch { /* private mode */ }
}

if (snapToggle) {
  let snapStart = true;
  try {
    const stored = localStorage.getItem(SNAP_KEY);
    if (stored !== null) snapStart = stored === '1';
  } catch { /* private mode */ }

  setSnap(snapStart);
  snapToggle.addEventListener('click', () => {
    setSnap(snapToggle.getAttribute('aria-pressed') !== 'true');
  });
}
