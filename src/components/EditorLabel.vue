<script setup lang="ts">
import { useEditorState } from '../composables/useEditorState';

const { conversionMode } = useEditorState();

defineProps<{
  panel: 'input' | 'output';
}>();

function toggleMode() {
  conversionMode.value = conversionMode.value === 'compile' ? 'convert' : 'compile';
}
</script>

<template lang="hsml">
div(class="flex items-center h-8 shrink-0 px-3 border-b border-border bg-background")
  button(
    class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
    :title="panel === 'input' ? 'Click to switch mode' : 'Click to switch mode'"
    @click="toggleMode"
  )
    span(v-if="panel === 'input'") {{ conversionMode === 'compile' ? 'HSML' : 'HTML' }}
    span(v-else) {{ conversionMode === 'compile' ? 'HTML' : 'HSML' }}
    svg(
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke-width="1.5"
      stroke="currentColor"
      width="12"
      height="12"
    )
      path(
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5"
      )
</template>
