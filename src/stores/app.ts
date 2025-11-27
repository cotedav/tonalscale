import { acceptHMRUpdate, defineStore } from 'pinia';

export type AppTheme = 'light' | 'dark';

export interface AppPreferences {
  locale: string;
  theme: AppTheme;
}

export interface AppState {
  appName: string;
  ready: boolean;
  preferences: AppPreferences;
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    appName: 'Tonal Scale',
    ready: false,
    preferences: {
      locale: 'en',
      theme: 'light',
    },
  }),
  getters: {
    isReady: (state) => state.ready,
    preferredLocale: (state) => state.preferences.locale,
  },
  actions: {
    setReady(flag: boolean) {
      this.ready = flag;
    },
    updatePreferences(preferences: Partial<AppPreferences>) {
      this.preferences = { ...this.preferences, ...preferences };
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useAppStore, import.meta.hot));
}
