import { createMemoryHistory } from 'vue-router';
import { describe, expect, it } from 'vitest';
import { createAppRouter, routes } from '@/router';

describe('router', () => {
  it('uses lazy-loaded components for route entries', () => {
    const shellRoute = routes.find((route) => route.path === '/');
    const homeRoute = shellRoute?.children?.find((childRoute) => childRoute.name === 'home');

    expect(typeof homeRoute?.component).toBe('function');
  });

  it('resolves the home route', async () => {
    const router = createAppRouter(createMemoryHistory());

    await router.push('/');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('home');
  });

  it('falls back to the not-found route for unknown paths', async () => {
    const router = createAppRouter(createMemoryHistory());

    await router.push('/does-not-exist');
    await router.isReady();

    expect(router.currentRoute.value.name).toBe('not-found');
  });
});
