import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-strong': 'rgb(var(--color-surface-strong) / <alpha-value>)',
        'surface-soft': 'rgb(var(--color-surface-soft) / <alpha-value>)',
        accent: 'rgb(var(--color-accent) / <alpha-value>)',
        'accent-strong': 'rgb(var(--color-accent-strong) / <alpha-value>)',
        'accent-soft': 'rgb(var(--color-accent-soft) / <alpha-value>)',
      },
      textColor: {
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-text-tertiary) / <alpha-value>)',
      },
      borderColor: {
        dim: 'rgb(var(--color-border-dim) / <alpha-value>)',
        highlight: 'rgb(var(--color-border-highlight) / <alpha-value>)',
        glass: 'rgb(var(--color-border-glass) / <alpha-value>)',
      },
      fontFamily: {
        sans: ['"Inter Variable"', ...defaultTheme.fontFamily.sans],
        mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
      },
      boxShadow: {
        card: '0 30px 80px rgba(0, 0, 0, 0.35)',
        glow: '0 0 0 1px rgba(124, 58, 237, 0.3), 0 20px 50px rgba(124, 58, 237, 0.15)',
      },
    },
  },
  plugins: [forms],
};

export default config;
