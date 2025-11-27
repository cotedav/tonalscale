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
      stack_label: 'Stack details',
      stack_items: [
        'Vue 3',
        'TypeScript',
        'Vite',
        'Tailwind CSS',
        'Headless UI',
        'Pinia',
        'Vue Router',
        'Vee-Validate',
        'Vue I18n',
        'VueUse',
        'Lodash',
        'Luxon',
      ],
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
  tonal_builder: {
    meta: {
      title: 'Tonal Builder | Tailwind + Headless UI',
      description:
        'Responsive tonal palette workspace with room for pickers, blend controls, scale previews, and accessibility helpers.',
    },
    hero: {
      kicker: 'Color automation shell',
      title: 'Tonal builder workspace',
      description:
        'Layout scaffolding for base + blend pickers, controls, overlays, and accessibility rails without clipping future popovers.',
      actions_label: 'Builder actions',
      import_export: 'Import/Export modal',
      copy_svg: 'Copy SVG',
      view_demo: 'View scaffolding demo',
    },
    regions: {
      pickers_label: 'Color pickers and control rail',
      accessibility_label: 'Accessibility helpers and overlays',
    },
    pickers: {
      base: {
        title: 'Base color picker',
        description: 'Primary hue selector with synchronized text inputs.',
        badge: 'Base',
        placeholder: 'Slot for the base color picker and linked input field.',
      },
      blend: {
        title: 'Blend color picker',
        description: 'Secondary hue selector for blending and hover previews.',
        badge: 'Blend',
        placeholder: 'Slot for the blend color picker and chip previews.',
      },
    },
    controls: {
      title: 'Blend + saturation controls',
      description: 'Blend mode select, strength sliders, peaks, spread, and saturation hooks.',
      blend_mode: 'Blend mode select + labels',
      sliders: 'Strength, peak, and spread sliders',
      saturation: 'Saturation tuning controls',
    },
    scales: {
      title: 'Scale previews',
      description: 'Full, extended, and key strips with safe spacing for hover zoom.',
      badge: 'Always-on',
      full: 'Full scale strip',
      extended: 'Extended key strip',
      key: 'Key strip',
    },
    overlays: {
      title: 'Interactive overlays',
      description: 'Space for hover zoom, popovers, context menus, and blend previews.',
      badge: 'No overflow clipping',
      hover: 'Hover zoom + preview popovers',
      menus: 'Context menu and quick actions',
    },
    accessibility: {
      title: 'Accessibility helpers',
      description: 'Contrast, WCAG, and card previews anchored in the right rail.',
      contrast_cards: 'Contrast preview cards',
      preview_links: 'Linked previews and badge metadata',
    },
    modals: {
      title: 'Modal + snackbar staging',
      description: 'Reserved stacking context for dialogs, clipboard helpers, and toasts.',
      badge: 'Stacked',
      dialogs: 'Dialog surface placeholder',
      clipboard: 'Clipboard and share affordances',
      toast_area: 'Toast and alert lane',
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
