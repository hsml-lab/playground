<script setup lang="ts">
import { TooltipArrow, TooltipContent, TooltipPortal, TooltipRoot, TooltipTrigger } from 'reka-ui';

defineProps<{
  content: string;
}>();
</script>

<template lang="hsml">
TooltipRoot
  TooltipTrigger(as-child)
    slot
  TooltipPortal
    TooltipContent(
      class="z-50 rounded px-2 py-1 text-xs bg-foreground text-background shadow-md animate-in fade-in-0 zoom-in-95"
      :side-offset="5"
    )
      slot(name="content") {{ content }}
      TooltipArrow(class="fill-foreground")
</template>
