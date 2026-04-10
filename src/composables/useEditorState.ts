import { reactive, ref, watch } from 'vue';
import { compile, format, htmlToHsml } from './useHsml';
import type { HsmlDiagnostic } from './useHsml';

export type ConversionMode = 'compile' | 'convert';

const DEFAULT_HSML_SOURCE = `doctype html
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

const DEFAULT_HTML_INPUT = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>HSML Playground</title>
  </head>
  <body>
    <h1 id="greeting" class="text-lg">Hello, HSML!</h1>
    <div class="card">
      <p class="card__body">Convert me to HSML!</p>
      <button type="button">Click me</button>
    </div>
  </body>
</html>
`;

function readFromHash(): { mode: ConversionMode; source: string } | undefined {
  const hash = window.location.hash.slice(1);
  if (!hash) return undefined;
  try {
    if (hash.startsWith('h:')) {
      return { mode: 'convert', source: decodeURIComponent(atob(hash.slice(2))) };
    }
    if (hash.startsWith('c:')) {
      return { mode: 'compile', source: decodeURIComponent(atob(hash.slice(2))) };
    }
    // Backward compat: no prefix = compile mode
    return { mode: 'compile', source: decodeURIComponent(atob(hash)) };
  } catch {
    return undefined;
  }
}

function writeToHash(mode: ConversionMode, source: string): void {
  const prefix = mode === 'convert' ? 'h:' : 'c:';
  const encoded = prefix + btoa(encodeURIComponent(source));
  history.replaceState(null, '', `#${encoded}`);
}

const hashState = readFromHash();

const conversionMode = ref<ConversionMode>(hashState?.mode ?? 'compile');
const hsmlSource = ref(
  hashState?.mode === 'compile' ? (hashState?.source ?? DEFAULT_HSML_SOURCE) : DEFAULT_HSML_SOURCE,
);
const htmlOutput = ref('');
const diagnostics = ref<HsmlDiagnostic[]>([]);
const showDiagnostics = ref(true);
const prettyPrint = ref(true);

const htmlInput = ref(
  hashState?.mode === 'convert' ? (hashState?.source ?? DEFAULT_HTML_INPUT) : DEFAULT_HTML_INPUT,
);
const hsmlOutput = ref('');
const convertError = ref('');

const formatterOptions = reactive({
  indentSize: 2,
  printWidth: 80,
});

let compileTimer: ReturnType<typeof setTimeout> | undefined;
let convertTimer: ReturnType<typeof setTimeout> | undefined;

function compileSource() {
  const result = compile(hsmlSource.value, {
    pretty: prettyPrint.value,
    indentSize: formatterOptions.indentSize,
  });
  htmlOutput.value = result.html ?? '';
  diagnostics.value = result.diagnostics;
}

function convertSource() {
  try {
    hsmlOutput.value = htmlToHsml(htmlInput.value);
    convertError.value = '';
  } catch (e) {
    hsmlOutput.value = '';
    convertError.value = e instanceof Error ? e.message : String(e);
  }
}

// HSML → HTML compilation
watch(
  [hsmlSource, prettyPrint],
  () => {
    if (conversionMode.value !== 'compile') return;
    clearTimeout(compileTimer);
    compileTimer = setTimeout(() => {
      if (conversionMode.value !== 'compile') return;
      compileSource();
      writeToHash('compile', hsmlSource.value);
    }, 150);
  },
  { immediate: true },
);

// HTML → HSML conversion
watch(
  [htmlInput],
  () => {
    if (conversionMode.value !== 'convert') return;
    clearTimeout(convertTimer);
    convertTimer = setTimeout(() => {
      if (conversionMode.value !== 'convert') return;
      convertSource();
      writeToHash('convert', htmlInput.value);
    }, 150);
  },
  { immediate: true },
);

// Trigger on mode switch — carry over the output as the new input
watch(conversionMode, (mode) => {
  if (mode === 'compile') {
    if (hsmlOutput.value) {
      hsmlSource.value = hsmlOutput.value;
    }
    compileSource();
    writeToHash('compile', hsmlSource.value);
  } else {
    if (htmlOutput.value) {
      htmlInput.value = htmlOutput.value;
    }
    convertSource();
    writeToHash('convert', htmlInput.value);
  }
});

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
    conversionMode,
    hsmlSource,
    htmlOutput,
    diagnostics,
    showDiagnostics,
    prettyPrint,
    htmlInput,
    hsmlOutput,
    convertError,
    formatterOptions,
    formatSource,
  };
}
