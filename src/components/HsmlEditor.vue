<script setup lang="ts">
import { linter } from '@codemirror/lint';
import type { Diagnostic as CmDiagnostic } from '@codemirror/lint';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { hsmlLanguage } from '../codemirror/hsml-language';
import { useEditorState } from '../composables/useEditorState';
import type { HsmlDiagnostic } from '../composables/useHsml';
import { useTheme } from '../composables/useTheme';

const { hsmlSource, diagnostics, showDiagnostics } = useEditorState();
const { isDark } = useTheme();

const editorRef = ref<HTMLDivElement>();
let view: EditorView | undefined;
const themeCompartment = new Compartment();
const linterCompartment = new Compartment();

function mapDiagnostics(doc: EditorState['doc'], hsmlDiags: HsmlDiagnostic[]): CmDiagnostic[] {
  const result: CmDiagnostic[] = [];
  for (const d of hsmlDiags) {
    if (!d.location) continue;
    const startLine = Math.min(d.location.start.line, doc.lines);
    const endLine = Math.min(d.location.end.line, doc.lines);
    const line = doc.line(startLine);
    const endLineObj = doc.line(endLine);
    const from = Math.min(line.from + d.location.start.column - 1, line.to);
    const to = Math.min(endLineObj.from + d.location.end.column - 1, endLineObj.to);
    result.push({
      from,
      to: Math.max(to, from),
      severity: d.severity === 'error' ? 'error' : 'warning',
      message: d.message,
    });
  }
  return result;
}

function createLintSource() {
  return linter((view) => {
    if (!showDiagnostics.value) return [];
    return mapDiagnostics(view.state.doc, diagnostics.value);
  });
}

onMounted(() => {
  if (!editorRef.value) return;

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      hsmlSource.value = update.state.doc.toString();
    }
  });

  const indentKeymap = keymap.of([
    {
      key: 'Tab',
      run: (view) => {
        view.dispatch(view.state.replaceSelection('  '));
        return true;
      },
    },
    {
      key: 'Shift-Tab',
      run: (view) => {
        const { state } = view;
        const line = state.doc.lineAt(state.selection.main.head);
        if (line.text.startsWith('  ')) {
          view.dispatch({ changes: { from: line.from, to: line.from + 2 } });
          return true;
        }
        return false;
      },
    },
  ]);

  view = new EditorView({
    state: EditorState.create({
      doc: hsmlSource.value,
      extensions: [
        basicSetup,
        indentKeymap,
        updateListener,
        hsmlLanguage(),
        themeCompartment.of(isDark.value ? oneDark : []),
        linterCompartment.of(createLintSource()),
      ],
    }),
    parent: editorRef.value,
  });
});

onBeforeUnmount(() => {
  view?.destroy();
});

watch(isDark, (dark) => {
  if (!view) return;
  view.dispatch({
    effects: themeCompartment.reconfigure(dark ? oneDark : []),
  });
});

watch([diagnostics, showDiagnostics], () => {
  if (!view) return;
  view.dispatch({
    effects: linterCompartment.reconfigure(createLintSource()),
  });
});

watch(hsmlSource, (newSource) => {
  if (!view) return;
  const currentDoc = view.state.doc.toString();
  if (currentDoc !== newSource) {
    view.dispatch({
      changes: { from: 0, to: currentDoc.length, insert: newSource },
    });
  }
});
</script>

<template lang="hsml">
div(ref="editorRef" class="h-full overflow-auto")
</template>
