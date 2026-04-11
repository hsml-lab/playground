<script setup lang="ts">
import { useClipboard } from '@vueuse/core';
import { ToastDescription, ToastProvider, ToastRoot, ToastViewport } from 'reka-ui';
import { ref } from 'vue';
import { useSidebar } from '../composables/useSidebar';
import { useTheme } from '../composables/useTheme';

const { isDark, toggleDark } = useTheme();
const { sidebarOpen, toggleSidebar } = useSidebar();
const { copy } = useClipboard();

const hsmlVersion = __HSML_VERSION__;
const showToast = ref(false);

function share() {
  copy(window.location.href);
  showToast.value = true;
}
</script>

<template lang="hsml">
header(class="h-12 flex items-center justify-between shrink-0 px-4 border-b border-border bg-background")
  div(class="flex items-center gap-2")
    button(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      :title="sidebarOpen ? 'Hide sidebar' : 'Show sidebar'"
      @click="toggleSidebar"
    )
      span(class="block icon-[lucide--menu] text-xl")
    span(class="text-lg font-bold text-foreground") HSML
    span(class="text-xs text-muted-foreground") {{ hsmlVersion }}
  div(class="flex items-center gap-1")
    button(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      title="Share URL"
      @click="share"
    )
      span(class="block icon-[lucide--share-2] text-xl")
    button(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      @click="toggleDark()"
      :title="isDark ? 'Switch to light mode' : 'Switch to dark mode'"
    )
      span(v-if="isDark" class="block icon-[lucide--sun] text-xl")
      span(v-else class="block icon-[lucide--moon] text-xl")
    a(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      href="https://github.com/hsml-lab/hsml"
      target="_blank"
      rel="noopener noreferrer"
      title="GitHub"
    )
      span(class="block icon-[lucide--github] text-xl")

ToastProvider
  ToastRoot(
    v-model:open="showToast"
    :duration="2000"
    class="fixed bottom-4 right-4 z-50 rounded-lg border border-border bg-background px-4 py-3 shadow-lg"
  )
    ToastDescription(class="text-sm text-foreground") URL copied to clipboard
  ToastViewport
</template>
