import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

const config: Config = {
  content: ['./index.html', './src/**/*.{vue,ts,tsx,js,jsx}'],
  theme: {
    extend: {
      colors: {
        surface: '#0c1224',
        'surface-strong': '#0f172a',
        'surface-soft': '#111a2f',
        accent: '#a855f7',
        'accent-strong': '#7c3aed',
        'accent-soft': '#c4b5fd',
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
