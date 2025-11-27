import type { RouterHistory, RouteRecordRaw } from 'vue-router';
import { createRouter, createWebHistory } from 'vue-router';
import registerRouterGuards from './navigationGuards';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/views/app-shell/AppShellView.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/views/HomeView.vue'),
        meta: {
          layout: 'app-shell',
        },
      },
    ],
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/views/system/NotFoundView.vue'),
    meta: {
      isFallback: true,
    },
  },
];

export const createAppRouter = (
  history: RouterHistory = createWebHistory(import.meta.env.BASE_URL),
) => {
  const router = createRouter({
    history,
    routes,
  });

  registerRouterGuards(router);

  return router;
};

const router = createAppRouter();

export default router;
