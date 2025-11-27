import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import i18n from './plugins/i18n';
import setupValidation from './plugins/validation';
import { registerPwa } from './plugins/pwa';
import './styles/main.css';

const app = createApp(App);

setupValidation();
registerPwa();

app.use(pinia).use(router).use(i18n).mount('#app');
