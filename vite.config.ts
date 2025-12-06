import { fileURLToPath, URL } from 'node:url';

import { VitePWA } from 'vite-plugin-pwa';
import vue from '@vitejs/plugin-vue';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const basePath = env.VITE_APP_BASE_PATH || '/';
  const basePathWithLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;
  const normalizedBasePath = basePathWithLeadingSlash.endsWith('/')
    ? basePathWithLeadingSlash
    : `${basePathWithLeadingSlash}/`;

  return {
    base: normalizedBasePath,
    plugins: [
      vue(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg', 'robots.txt', 'pwa-icon.svg'],
        manifest: {
          name: 'Tonal Scale',
          short_name: 'Tonal',
          description: 'Tonal Scale progressive web app scaffold.',
          theme_color: '#1867c0',
          background_color: '#121212',
          display: 'standalone',
          start_url: normalizedBasePath,
          scope: normalizedBasePath,
          orientation: 'portrait',
          icons: [
            {
              src: 'pwa-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
            },
            {
              src: 'pwa-icon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          cleanupOutdatedCaches: true,
          runtimeCaching: [],
          maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        },
      }),
    ],
    css: {
      preprocessorOptions: {
        scss: {
          api: 'modern-compiler',
        },
        sass: {
          api: 'modern-compiler',
        },
      },
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      port: 5173,
    },
    test: {
      globals: true,
      environment: 'jsdom',
      css: true,
      setupFiles: 'src/tests/setup.ts',
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json-summary', 'html'],
        reportsDirectory: 'coverage/unit',
        exclude: [
          'temp/**',
          'src/js/**',
          'dist/**',
          'cypress/**',
          '**/*.d.ts',
          '**/*.config.{js,ts,cjs,mjs}',
          '**/.eslintrc.cjs',
          '**/.stylelintrc.cjs',
          'src/main.ts',
          'src/tests/**',
        ],
        thresholds: {
          global: {
            statements: 90,
            branches: 90,
            functions: 90,
            lines: 90,
          },
        },
      },
    },
  };
});
