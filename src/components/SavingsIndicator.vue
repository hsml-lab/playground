<script setup lang="ts">
import { computed } from 'vue';
import Tooltip from './Tooltip.vue';

const props = defineProps<{
  sourceLength: number;
  targetLength: number;
  sentiment: 'positive' | 'negative';
}>();

const factor = computed(() => {
  if (props.sourceLength === 0 || props.targetLength === 0) return null;
  const ratio = props.targetLength / props.sourceLength;
  if (ratio <= 1) return null;
  return ratio;
});

const tooltipText = computed(() => {
  if (!factor.value) return '';
  const f = factor.value.toFixed(1);
  return props.sentiment === 'positive'
    ? `HSML is ${f}x more compact than HTML (${props.sourceLength} vs ${props.targetLength} chars)`
    : `HTML is ${f}x more verbose than HSML (${props.sourceLength} vs ${props.targetLength} chars)`;
});

// Map factor to a 0-1 scale for color intensity (1x-3.5x range)
function colorIntensity(factor: number): number {
  return Math.min((factor - 1) / 2.5, 1);
}

function color(factor: number): string {
  const intensity = colorIntensity(factor);
  if (props.sentiment === 'positive') {
    const g = Math.round(120 + intensity * 135);
    return `rgb(34, ${g}, 94)`;
  }
  const r = Math.round(120 + intensity * 135);
  return `rgb(${r}, 50, 50)`;
}

function barWidth(factor: number): number {
  return Math.min(colorIntensity(factor) * 100, 100);
}
</script>

<template lang="hsml">
Tooltip(v-if="factor" :content="tooltipText")
  div(class="flex items-center gap-1.5 cursor-help")
    div(class="w-16 h-1.5 rounded-full bg-muted overflow-hidden")
      div(
        class="h-full rounded-full transition-all"
        :style="{ width: barWidth(factor) + '%', backgroundColor: color(factor) }"
      )
    span(
      class="text-xs font-medium tabular-nums"
      :style="{ color: color(factor) }"
    ) {{ factor.toFixed(1) }}x
</template>
