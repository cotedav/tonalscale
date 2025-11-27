import { createApp } from 'vue';
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import vuetify from './plugins/vuetify';
import i18n from './plugins/i18n';
import setupValidation from './plugins/validation';
import { registerPwa } from './plugins/pwa';
import './styles/main.scss';

const app = createApp(App);

setupValidation();
registerPwa();

app.use(pinia).use(router).use(i18n).use(vuetify).mount('#app');
