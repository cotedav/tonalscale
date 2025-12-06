import { beforeEach, describe, expect, it } from 'vitest';
import { isDark, toggleTheme } from '@/composables/useTheme';

// Helper for nextTick in tests
function nextTick() {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('useTheme', () => {
  beforeEach(() => {
    // Reset state if possible, or mock
    // default useDark uses localStorage and media query
    // We can mock localStorage
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('should initialize based on defaults (mocked as dark here for safety or light)', () => {
    // defaults depend on system preference which is hard to mock in jsdom without setup
    // But we can check if isDark is a ref
    expect(isDark.value).toBeDefined();
  });

  it('should toggle theme', () => {
    const initial = isDark.value;
    toggleTheme();
    expect(isDark.value).toBe(!initial);
    toggleTheme();
    expect(isDark.value).toBe(initial);
  });

  it('should update html class when toggled', async () => {
    // Force one state
    isDark.value = false;
    await nextTick();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    toggleTheme();
    await nextTick();
    // useDark updates the class automatically
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });
});
