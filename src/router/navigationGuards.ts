import type { NavigationGuardNext, RouteLocationNormalized, Router } from 'vue-router';

const logNavigation = (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[router] navigation', { from: from.fullPath || '(start)' }, { to: to.fullPath });
  }
};

const registerRouterGuards = (router: Router) => {
  router.beforeEach(
    (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
      logNavigation(to, from);

      // TODO: inject auth or feature flag checks here when flows are defined
      next();
    },
  );

  router.afterEach(() => {
    // TODO: add analytics hooks or page-level loading states when ready
  });
};

export default registerRouterGuards;
