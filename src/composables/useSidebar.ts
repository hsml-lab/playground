import { useMediaQuery } from '@vueuse/core';
import { ref, watch } from 'vue';

const isWide = useMediaQuery('(min-width: 1024px)');
const sidebarOpen = ref(isWide.value);

// Auto-toggle when crossing the breakpoint
watch(isWide, (wide) => {
  sidebarOpen.value = wide;
});

export function useSidebar() {
  function toggleSidebar() {
    sidebarOpen.value = !sidebarOpen.value;
  }

  return { sidebarOpen, toggleSidebar };
}
