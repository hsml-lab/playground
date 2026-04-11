<script setup lang="ts">
import { computed } from 'vue';
import { useEditorState } from '../composables/useEditorState';
import SavingsIndicator from './SavingsIndicator.vue';
import Tooltip from './Tooltip.vue';

const { conversionMode, hsmlSource, htmlOutput, htmlInput, hsmlOutput } = useEditorState();

const props = defineProps<{
  panel: 'input' | 'output';
}>();

function toggleMode() {
  conversionMode.value = conversionMode.value === 'compile' ? 'convert' : 'compile';
}

const hsmlLen = computed(() =>
  conversionMode.value === 'compile'
    ? hsmlSource.value.trim().length
    : hsmlOutput.value.trim().length,
);

const htmlLen = computed(() =>
  conversionMode.value === 'compile'
    ? htmlOutput.value.trim().length
    : htmlInput.value.trim().length,
);

const sentiment = computed(() => (conversionMode.value === 'compile' ? 'positive' : 'negative'));
</script>

<template lang="hsml">
div(class="flex items-center justify-between h-8 shrink-0 px-3 border-b border-border bg-background")
  Tooltip(content="Click to switch mode")
    button(
      class="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
      @click="toggleMode"
    )
      span(v-if="panel === 'input'") {{ conversionMode === 'compile' ? 'HSML' : 'HTML' }}
      span(v-else) {{ conversionMode === 'compile' ? 'HTML' : 'HSML' }}
      span(class="block icon-[lucide--arrow-left-right] text-xs")
  SavingsIndicator(
    v-if="panel === 'input'"
    :source-length="hsmlLen"
    :target-length="htmlLen"
    :sentiment="sentiment"
  )
</template>
