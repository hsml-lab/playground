<script setup lang="ts">
import { useSidebar } from '../composables/useSidebar';
import { useTheme } from '../composables/useTheme';

const { theme, toggleTheme } = useTheme();
const { sidebarOpen, toggleSidebar } = useSidebar();

const hsmlVersion = __HSML_VERSION__;
</script>

<template lang="hsml">
header(class="h-12 flex items-center justify-between shrink-0 px-4 border-b border-border bg-background")
  div(class="flex items-center gap-2")
    button(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      :title="sidebarOpen ? 'Hide sidebar' : 'Show sidebar'"
      @click="toggleSidebar"
    )
      svg(
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="20"
        height="20"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
        )
    span(class="text-lg font-bold text-foreground") HSML
    span(class="text-xs text-muted-foreground") {{ hsmlVersion }}
  div(class="flex items-center gap-3")
    button(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      @click="toggleTheme"
      :title="theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
    )
      svg(
        v-if="theme === 'dark'"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="20"
        height="20"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
        )
      svg(
        v-else
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        width="20"
        height="20"
      )
        path(
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
        )
    a(
      class="p-2 rounded text-muted-foreground hover:bg-muted"
      href="https://github.com/hsml-lab/hsml"
      target="_blank"
      rel="noopener noreferrer"
      title="GitHub"
    )
      svg(
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        width="20"
        height="20"
      )
        path(
          d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0 1 12 6.836a9.59 9.59 0 0 1 2.504.337c1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10Z"
        )
</template>
