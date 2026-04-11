<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { ref } from 'vue';

const props = defineProps<{
  text: string;
}>();

const { copy } = useClipboard();
const copied = ref(false);

function copyText() {
  copy(props.text);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template lang="hsml">
button(
  class="absolute top-2 right-2 z-10 p-1.5 rounded bg-background/80 text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-foreground hover:bg-background transition-all"
  title="Copy to clipboard"
  @click="copyText"
)
  span(v-if="copied" class="block icon-[lucide--check] text-base text-green-500")
  span(v-else class="block icon-[lucide--clipboard-copy] text-base")
</template>
