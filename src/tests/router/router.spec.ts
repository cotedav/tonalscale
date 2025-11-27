import { createMemoryHistory } from 'vue-router';
import { describe, expect, it } from 'vitest';
import { createAppRouter, routes } from '@/router';

describe('router', () => {
  it('uses lazy-loaded components for route entries', () => {
    const shellRoute = routes.find((route) => route.path === '/');
    const homeRoute = shellRoute?.children?.find((childRoute) => childRoute.name === 'home');
    const demoRoute = shellRoute?.children?.find(
      (childRoute) => childRoute.name === 'scaffolding-demo',
    );

    expect(typeof homeRoute?.component).toBe('function');
    expect(typeof demoRoute?.component).toBe('function');
  });

  it('resolves the tonal builder home route', async () => {
    const router = createAppRouter(createMemoryHistory());

    await router.push('/');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('resolves the scaffolding demo route', async () => {
    const router = createAppRouter(createMemoryHistory());

    await router.push('/scaffolding-demo');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('scaffolding-demo');
  });

  it('falls back to the not-found route for unknown paths', async () => {
    const router = createAppRouter(createMemoryHistory());

    await router.push('/does-not-exist');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('not-found');
  });
});
