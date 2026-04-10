<script setup lang="ts">
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { hsmlLanguage } from '../codemirror/hsml-language';
import { useEditorState } from '../composables/useEditorState';
import { useTheme } from '../composables/useTheme';

const { hsmlOutput } = useEditorState();
const { theme } = useTheme();

const editorRef = ref<HTMLDivElement>();
let view: EditorView | undefined;
const themeCompartment = new Compartment();

onMounted(() => {
  if (!editorRef.value) return;

  view = new EditorView({
    state: EditorState.create({
      doc: hsmlOutput.value,
      extensions: [
        basicSetup,
        hsmlLanguage(),
        EditorState.readOnly.of(true),
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

watch(hsmlOutput, (newOutput) => {
  if (!view) return;
  const currentDoc = view.state.doc.toString();
  if (currentDoc !== newOutput) {
    view.dispatch({
      changes: { from: 0, to: currentDoc.length, insert: newOutput },
    });
  }
});
</script>

<template lang="hsml">
div(ref="editorRef" class="editor-readonly h-full overflow-auto")
</template>
