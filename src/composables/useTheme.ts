import { useDark, useToggle } from '@vueuse/core';

const isDark = useDark({
  storageKey: 'hsml-playground-theme',
  initialValue: 'dark',
});
const toggleDark = useToggle(isDark);

export function useTheme() {
  return { isDark, toggleDark };
}
