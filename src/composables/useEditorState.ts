import { reactive, ref, watch } from 'vue';
import { compile, format } from './useHsml';
import type { HsmlDiagnostic } from './useHsml';

const DEFAULT_SOURCE = `doctype html
html(lang="en")
  head
    meta(charset="UTF-8")
    title HSML Playground
  body
    h1#greeting.text-lg Hello, HSML!
    .card
      p.card__body.
        HSML is a pug-inspired HTML preprocessor
        that compiles to clean HTML.
      button(type="button") Click me
`;

function readSourceFromHash(): string | undefined {
  const hash = window.location.hash.slice(1);
  if (!hash) return undefined;
  try {
    return decodeURIComponent(atob(hash));
  } catch {
    return undefined;
  }
}

function writeSourceToHash(source: string): void {
  const encoded = btoa(encodeURIComponent(source));
  history.replaceState(null, '', `#${encoded}`);
}

const hsmlSource = ref(readSourceFromHash() ?? DEFAULT_SOURCE);
const htmlOutput = ref('');
const diagnostics = ref<HsmlDiagnostic[]>([]);
const showDiagnostics = ref(true);

const formatterOptions = reactive({
  indentSize: 2,
  printWidth: 80,
});

let debounceTimer: ReturnType<typeof setTimeout> | undefined;

function compileSource() {
  const result = compile(hsmlSource.value);
  htmlOutput.value = result.html ?? '';
  diagnostics.value = result.diagnostics;
}

watch(
  hsmlSource,
  () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      compileSource();
      writeSourceToHash(hsmlSource.value);
    }, 150);
  },
  { immediate: true },
);

export function useEditorState() {
  function formatSource() {
    try {
      hsmlSource.value = format(hsmlSource.value, {
        indentSize: formatterOptions.indentSize,
        printWidth: formatterOptions.printWidth,
      });
    } catch {
      // formatting fails on invalid source — silently ignore
    }
  }

  return {
    hsmlSource,
    htmlOutput,
    diagnostics,
    showDiagnostics,
    formatterOptions,
    formatSource,
  };
}
