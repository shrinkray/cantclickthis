/**
 * Live markup editor for /lab/[id].
 *
 * The example is ordinary DOM — not contenteditable, not an iframe — so Tab
 * and a screen reader treat it like any other page. The textarea is only a
 * source: typing rewrites the example, it does not wrap it.
 */

const playground = document.querySelector('[data-playground]');
if (!playground) {
  // Not a lab page.
} else {
  const stage = playground.querySelector('[data-stage]');
  const editor = playground.querySelector('[data-editor]');
  const reset = playground.querySelector('[data-reset]');
  const loadFix = playground.querySelector('[data-load-fix]');
  const sourceNode = playground.querySelector('[data-lab-source]');
  const announcer = document.querySelector('[data-announce]');

  /** @type {{ fail: string, fix: string } | null} */
  let source = null;
  try {
    source = JSON.parse(sourceNode?.textContent ?? '');
  } catch {
    source = null;
  }

  function announce(message) {
    if (!announcer) return;
    announcer.textContent = '';
    requestAnimationFrame(() => {
      announcer.textContent = message;
    });
  }

  function render(html) {
    if (!stage) return;
    stage.innerHTML = html;
  }

  if (stage && editor && source) {
    editor.addEventListener('input', () => {
      render(editor.value);
    });

    reset?.addEventListener('click', () => {
      editor.value = source.fail;
      render(source.fail);
      editor.focus();
      announce('Example reset to the starting markup.');
    });

    loadFix?.addEventListener('click', () => {
      editor.value = source.fix;
      render(source.fix);
      editor.focus();
      announce('Example loaded with one possible fix.');
    });
  }
}
