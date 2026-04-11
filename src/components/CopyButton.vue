<script setup lang="ts">
import { useClipboard, useTimeoutFn } from '@vueuse/core';
import { ref } from 'vue';
import Tooltip from './Tooltip.vue';

const props = defineProps<{
  text: string;
}>();

const { copy } = useClipboard();
const copied = ref(false);
const { start } = useTimeoutFn(
  () => {
    copied.value = false;
  },
  2000,
  { immediate: false },
);

function copyText() {
  copy(props.text);
  copied.value = true;
  start();
}
</script>

<template lang="hsml">
Tooltip(:content="copied ? 'Copied!' : 'Copy to clipboard'")
  button(
    class="absolute top-2 right-2 z-10 p-1.5 rounded bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-background transition-all"
    aria-label="Copy to clipboard"
    @click="copyText"
  )
    span(v-if="copied" class="block icon-[lucide--check] text-base text-green-500")
    span(v-else class="block icon-[lucide--clipboard-copy] text-base")
</template>
