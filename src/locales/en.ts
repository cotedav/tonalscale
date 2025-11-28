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
    actions: {
      toolbar_label: 'Builder toolbar',
      actions_label: 'Builder actions',
      import_export: 'Import/Export',
      copy_svg: 'Copy SVG',
      theme_toggle: 'Toggle theme',
      copied_message: 'Copied to clipboard',
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
        input_helper: 'Hex input paired with the base picker.',
        badge: 'Base',
        placeholder: 'Slot for the base color picker and linked input field.',
      },
      blend: {
        title: 'Blend color picker',
        description: 'Secondary hue selector for blending and hover previews.',
        badge: 'Blend',
        placeholder: 'Slot for the blend color picker and chip previews.',
      },
      slider_modes: 'Slider modes',
      invalid_hex: 'Enter a valid 6-digit hex value',
    },
    controls: {
      title: 'Blend + saturation controls',
      description: 'Blend mode select, strength sliders, peaks, spread, and saturation hooks.',
      labels: {
        blend_mode: 'Blend mode',
        blend_color: 'Blend Color',
      },
      fields: {
        strength: 'Blend Strength',
        middle: 'Blend Peak',
        spread: 'Blend Spread',
        sat_darker: 'Saturation Darker',
        sat_lighter: 'Saturation Lighter',
      },
      blend_modes: {
        darken: 'Darken',
        multiply: 'Multiply',
        color_burn: 'Color Burn',
        lighten: 'Lighten',
        screen: 'Screen',
        color_dodge: 'Color Dodge',
        overlay: 'Overlay',
        soft_light: 'Soft Light',
        hard_light: 'Hard Light',
        vivid_light: 'Vivid Light',
        hue: 'Hue',
      },
      blend_mode: 'Blend mode select + labels',
      sliders: 'Strength, peak, and spread sliders',
      saturation: 'Saturation tuning controls',
    },
    scales: {
      title: 'Scale previews',
      description: 'Full, extended, and key strips with safe spacing for hover zoom.',
      badge: 'Always-on',
      full: 'Full scale strip',
      full_helper: '101-step tonal ramp',
      extended: 'Extended key strip',
      extended_helper: 'Key luminance + supporting stops',
      key: 'Key strip',
      key_helper: 'Key luminance and nearest neighbors',
    },
    overlays: {
      title: 'Interactive overlays',
      description: 'Space for hover zoom, popovers, context menus, and blend previews.',
      badge: 'No overflow clipping',
      hover: 'Hover zoom + preview popovers',
      hover_helper: 'Room for hover dots, zoom, and tooltips.',
      menus: 'Context menu and quick actions',
      menus_helper: 'Contextual actions and shortcuts.',
    },
    accessibility: {
      title: 'Accessibility helpers',
      description: 'Contrast, WCAG, and card previews anchored in the right rail.',
      cards: {
        darker_45: 'AA/AAA at 4.5:1 - darker base',
        darker_3: 'AA at 3:1 - darker base',
        lighter_3: 'AA at 3:1 - lighter base',
        lighter_45: 'AA/AAA at 4.5:1 - lighter base',
      },
      contrast_cards: 'Contrast preview cards',
      preview_links: 'Linked previews and badge metadata',
    },
    modals: {
      title: 'Modal + snackbar staging',
      description: 'Reserved stacking context for dialogs, clipboard helpers, and toasts.',
      badge: 'Stacked',
      dialogs: 'Dialog surface placeholder',
      dialogs_helper: 'Reserved modal shell for import/export.',
      clipboard: 'Clipboard and share affordances',
      clipboard_helper: 'Copy SVG, JSON, and quick actions.',
      toast_area: 'Toast and alert lane',
      toast_helper: 'Clipboard + sharing status lane.',
      dialog_title: 'Builder dialog',
      dialog_body: 'Dialog body placeholder',
      close_label: 'Close dialog',
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
