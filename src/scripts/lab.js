/**
 * Live markup editor for /lab/[id].
 *
 * The example is ordinary DOM — not contenteditable, not an iframe — so Tab
 * and a screen reader treat it like any other page. The textarea is only a
 * source: typing rewrites the example, it does not wrap it. Color lives in a
 * hidden backdrop behind that textbox.
 */

import { highlightCode } from '../lib/highlight.mjs';

const playground = document.querySelector('[data-playground]');
if (!playground) {
  // Not a lab page.
} else {
  const stage = playground.querySelector('[data-stage]');
  /** @type {HTMLTextAreaElement | null} */
  const editor = playground.querySelector('[data-editor]');
  const highlight = playground.querySelector('[data-highlight]');
  const highlightPane = highlight?.closest('pre');
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

  function syncScroll() {
    if (!highlightPane || !editor) return;
    highlightPane.scrollTop = editor.scrollTop;
    highlightPane.scrollLeft = editor.scrollLeft;
  }

  function paintEditor() {
    if (!highlight || !editor) return;
    highlight.innerHTML = highlightCode(editor.value);
    syncScroll();
  }

  function render(html) {
    if (!stage) return;
    stage.innerHTML = html;
  }

  function jumpToTop() {
    window.scrollTo(0, 0);
    playground.focus({ preventScroll: true });
  }

  if (stage && editor && source) {
    editor.addEventListener('input', () => {
      render(editor.value);
      paintEditor();
    });
    editor.addEventListener('scroll', syncScroll);

    reset?.addEventListener('click', () => {
      editor.value = source.fail;
      render(source.fail);
      paintEditor();
      editor.focus();
      announce('Example reset to the starting markup.');
    });

    loadFix?.addEventListener('click', () => {
      editor.value = source.fix;
      render(source.fix);
      paintEditor();
      jumpToTop();
      announce('Example loaded with one possible fix.');
    });
  }
}
