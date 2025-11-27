/* eslint-disable no-console */
// eslint-disable-next-line import/no-unresolved
import { registerSW } from 'virtual:pwa-register';

const logPrefix = '[PWA]';

export const registerPwa = () => {
  const updateServiceWorker = registerSW({
    immediate: true,
    onRegisteredSW(serviceWorkerUrl) {
      console.info(`${logPrefix} Service worker registered at ${serviceWorkerUrl}`);
    },
    onNeedRefresh() {
      console.info(
        `${logPrefix} New content available; TODO: surface a refresh prompt in the UI when ready.`,
      );
    },
    onOfflineReady() {
      console.info(`${logPrefix} App ready for offline use.`);
    },
    onRegisterError(error) {
      console.error(`${logPrefix} Service worker registration failed:`, error);
    },
  });

  return updateServiceWorker;
};

export default registerPwa;
