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
    title="Click to switch mode"
    @click="toggleMode"
  )
    span(v-if="panel === 'input'") {{ conversionMode === 'compile' ? 'HSML' : 'HTML' }}
    span(v-else) {{ conversionMode === 'compile' ? 'HTML' : 'HSML' }}
    span(class="icon-[lucide--arrow-left-right] text-xs")
</template>
