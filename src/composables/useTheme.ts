import { ref, watchEffect } from 'vue';

export type Theme = 'dark' | 'light';

const theme = ref<Theme>((localStorage.getItem('hsml-playground-theme') as Theme) ?? 'dark');

watchEffect(() => {
  localStorage.setItem('hsml-playground-theme', theme.value);
  document.documentElement.classList.toggle('dark', theme.value === 'dark');
});

export function useTheme() {
  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark';
  }

  return { theme, toggleTheme };
}
