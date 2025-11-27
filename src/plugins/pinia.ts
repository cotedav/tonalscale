import type { App } from 'vue';
import { createPinia } from 'pinia';

const pinia = createPinia();

export const installPinia = (app: App) => {
  app.use(pinia);
};

export default pinia;
