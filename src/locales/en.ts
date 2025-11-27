export default {
  home: {
    hero: {
      title: 'Tonal Scale Scaffold',
      description: 'Vue 3 + TypeScript starter with Tailwind CSS, Headless UI, and PWA readiness.',
    },
    toolkit: {
      title: 'Toolkit',
      description:
        'Vue 3 • TypeScript • Vite • Tailwind CSS • Headless UI • Pinia • Vue Router • Vee-Validate • Vue I18n • VueUse • Lodash • Luxon',
    },
    timestamp: {
      title: 'Live timestamp',
    },
    localization: {
      heading: 'Localization preview',
      description: 'Switch languages to see translated shell content.',
    },
    validation: {
      heading: 'Schema-based validation demo',
      description: 'Reusable Vee-Validate + Yup form with Tailwind inputs.',
    },
    utilities: {
      heading: 'Utility library demos',
      description: 'See VueUse, Lodash, and Luxon helpers rendered live inside the shell.',
      clock: {
        title: 'Live clock with VueUse + Luxon',
        description:
          'Interval-based updates respect the browser language and can be paused or resumed.',
        pause: 'Pause clock',
        resume: 'Resume clock',
      },
      collections: {
        title: 'Collection helpers (Lodash)',
        description: 'Chunk data for grid layouts and sanitize duplicates while preserving order.',
        chunkedLabel: 'Chunked rows (size 3)',
        uniqueLabel: 'De-duplicated, truthy names',
      },
      dates: {
        title: 'Date helpers (Luxon)',
        description: 'Format localized labels and generate UTC ISO timestamps safely.',
        formattedLabel: 'Localized label',
        utcLabel: 'UTC ISO timestamp',
      },
      dialog: {
        title: 'Headless UI dialog wiring',
        description: 'Overlay sample proving Headless UI is ready for tonal builder workflows.',
        open: 'Open sample dialog',
        body: 'Dialogs use Tailwind-powered transitions and keep focus management intact.',
        close: 'Close',
        helper: 'Use the escape key or background click to dismiss the overlay.',
      },
    },
  },
  validation: {
    sample: {
      title: 'Reusable validation form',
      description:
        'This sample uses a shared schema helper to validate inputs and surface neutral messages. Extend it with additional fields or rules as needed.',
      fields: {
        full_name: {
          label: 'Full name',
        },
        email: {
          label: 'Email address',
        },
      },
      actions: {
        submit: 'Validate and submit',
        reset: 'Reset form',
      },
      success: 'Validation succeeded for {name} ({email}).',
      helper_copy:
        'Errors hydrate reactive arrays for consistent layout without component lock-in.',
    },
    rules: {
      required: 'This field is required.',
      email: 'Enter a valid email address.',
    },
  },
  i18n: {
    switcher: {
      label: 'Language',
      helper: 'Your choice is remembered for future visits.',
    },
    locales: {
      en: 'English',
      fr: 'Français',
    },
  },
  system: {
    not_found: {
      title: 'Page not found',
      message:
        'The page you are looking for does not exist yet. Use the navigation to keep exploring.',
      home: 'Return home',
    },
  },
};
