<script setup lang="ts">
import { computed } from 'vue';

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

// Bar width as percentage (1x = 0%, 10x+ = 100%)
function barWidth(factor: number): number {
  return Math.min(colorIntensity(factor) * 100, 100);
}
</script>

<template lang="hsml">
div(
  v-if="factor"
  class="flex items-center gap-1.5 cursor-help"
  :title="sentiment === 'positive' ? `HSML is ${factor.toFixed(1)}x more compact than HTML (${sourceLength} vs ${targetLength} chars)` : `HTML is ${factor.toFixed(1)}x more verbose than HSML (${sourceLength} vs ${targetLength} chars)`"
)
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
