import { useDark, useToggle } from '@vueuse/core';

const canPersistTheme =
  typeof window !== 'undefined' && typeof window.localStorage?.getItem === 'function';

export const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark',
  valueLight: '',
  storageKey: canPersistTheme ? 'vueuse-color-scheme' : null,
});

export const toggleTheme = useToggle(isDark);
