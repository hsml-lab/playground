<script setup lang="ts">
import { html } from '@codemirror/lang-html';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useEditorState } from '../composables/useEditorState';
import { useTheme } from '../composables/useTheme';

const { htmlInput } = useEditorState();
const { theme } = useTheme();

const editorRef = ref<HTMLDivElement>();
let view: EditorView | undefined;
const themeCompartment = new Compartment();

onMounted(() => {
  if (!editorRef.value) return;

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      htmlInput.value = update.state.doc.toString();
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
      doc: htmlInput.value,
      extensions: [
        basicSetup,
        indentKeymap,
        updateListener,
        html(),
        themeCompartment.of(theme.value === 'dark' ? oneDark : []),
      ],
    }),
    parent: editorRef.value,
  });
});

onBeforeUnmount(() => {
  view?.destroy();
});

watch(theme, (newTheme) => {
  if (!view) return;
  view.dispatch({
    effects: themeCompartment.reconfigure(newTheme === 'dark' ? oneDark : []),
  });
});

watch(htmlInput, (newSource) => {
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
