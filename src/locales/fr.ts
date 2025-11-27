export default {
  home: {
    hero: {
      title: 'Squelette Tonal Scale',
      description:
        'Démarrage Vue 3 + TypeScript avec Tailwind CSS, Headless UI et préparation PWA.',
    },
    toolkit: {
      title: 'Boîte à outils',
      description:
        'Vue 3 • TypeScript • Vite • Tailwind CSS • Headless UI • Pinia • Vue Router • Vee-Validate • Vue I18n • VueUse • Lodash • Luxon',
      stack_label: 'Détails de la pile',
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
      title: 'Horodatage en direct',
    },
    localization: {
      heading: 'Aperçu de la localisation',
      description: 'Changez de langue pour voir le contenu traduit.',
    },
    validation: {
      heading: 'Démo de validation basée sur un schéma',
      description: 'Formulaire réutilisable Vee-Validate + Yup avec champs Tailwind.',
    },
    utilities: {
      heading: 'Démos des bibliothèques utilitaires',
      description: 'Aperçus en direct des helpers VueUse, Lodash et Luxon dans la coquille.',
      clock: {
        title: 'Horloge en direct avec VueUse + Luxon',
        description:
          'Les mises à jour respectent la langue du navigateur et peuvent être mises en pause ou reprises.',
        pause: "Mettre l'horloge en pause",
        resume: "Relancer l'horloge",
      },
      collections: {
        title: 'Helpers de collection (Lodash)',
        description:
          "Découpez les données pour des grilles et nettoyez les doublons tout en préservant l'ordre.",
        chunkedLabel: 'Rangées découpées (taille 3)',
        uniqueLabel: 'Noms dédupliqués et vérifiés',
      },
      dates: {
        title: 'Helpers de dates (Luxon)',
        description:
          'Formatez des libellés localisés et générez des horodatages ISO en UTC en toute sécurité.',
        formattedLabel: 'Libellé localisé',
        utcLabel: 'Horodatage ISO UTC',
      },
      dialog: {
        title: 'Boîte de dialogue Headless UI',
        description:
          'Exemple de superposition prouvant que Headless UI est prête pour les flux du constructeur tonal.',
        open: 'Ouvrir la boîte de dialogue',
        body: 'Les dialogues utilisent des transitions Tailwind et conservent une gestion du focus complète.',
        close: 'Fermer',
        helper: "Utilisez Échap ou cliquez à l'arrière-plan pour fermer la fenêtre.",
      },
    },
  },
  tonal_builder: {
    meta: {
      title: 'Constructeur tonal | Tailwind + Headless UI',
      description:
        'Espace de travail réactif pour palettes tonales avec place pour les sélecteurs, les contrôles de mélange, les aperçus et les aides accessibilité.',
    },
    actions: {
      toolbar_label: 'Barre d’outils du générateur',
      actions_label: 'Actions du générateur',
      import_export: 'Importer/Exporter',
      copy_svg: 'Copier le SVG',
      theme_toggle: 'Basculer le thème',
      copied_message: 'Copié dans le presse-papiers',
    },
    hero: {
      kicker: "Coquille d'automatisation des couleurs",
      title: 'Espace de travail du constructeur tonal',
      description:
        'Squelette de mise en page pour les sélecteurs de base et de mélange, les contrôles, les superpositions et les rails accessibilité sans couper les popovers.',
      actions_label: 'Actions du constructeur',
      import_export: 'Modal Import/Export',
      copy_svg: 'Copier le SVG',
      view_demo: 'Voir la démo de structure',
    },
    regions: {
      pickers_label: 'Sélecteurs de couleur et rail de contrôle',
      accessibility_label: 'Aides accessibilité et superpositions',
    },
    pickers: {
      base: {
        title: 'Sélecteur de couleur de base',
        description: 'Sélection de teinte principale avec champs texte synchronisés.',
        input_helper: 'Entrée hexadécimale associée au sélecteur de base.',
        badge: 'Base',
        placeholder: 'Emplacement pour le sélecteur de base et son champ lié.',
      },
      blend: {
        title: 'Sélecteur de couleur de mélange',
        description: 'Sélecteur secondaire pour le mélange et les aperçus au survol.',
        badge: 'Mélange',
        placeholder: 'Emplacement pour le sélecteur de mélange et les pastilles.',
      },
    },
    controls: {
      title: 'Contrôles de mélange et saturation',
      description: 'Sélecteur de mode, curseurs de force, pics, étendue et réglages de saturation.',
      labels: {
        blend_mode: 'Mode de fusion',
        blend_color: 'Couleur de fusion',
      },
      fields: {
        strength: 'Force du mélange',
        middle: 'Pic du mélange',
        spread: 'Étalement du mélange',
        sat_darker: 'Saturation foncée',
        sat_lighter: 'Saturation claire',
      },
      blend_modes: {
        darken: 'Assombrir',
        multiply: 'Produit',
        color_burn: 'Densité de couleur',
        lighten: 'Éclaircir',
        screen: 'Superposition',
        color_dodge: 'Densité couleur –',
        overlay: 'Incrustation',
        soft_light: 'Lumière tamisée',
        hard_light: 'Lumière crue',
        vivid_light: 'Lumière vive',
        hue: 'Teinte',
      },
      blend_mode: 'Sélecteur de mode de mélange + libellés',
      sliders: 'Curseurs de force, pic et étendue',
      saturation: 'Réglages de saturation',
    },
    scales: {
      title: 'Aperçus des gammes',
      description: 'Gamme complète, étendue et clé avec marge pour le zoom au survol.',
      badge: 'Toujours visible',
      full: 'Bande de gamme complète',
      full_helper: 'Rampe tonale de 101 étapes',
      extended: 'Bande clé étendue',
      extended_helper: 'Luminance clé et points de support',
      key: 'Bande clé',
      key_helper: 'Luminance clé et voisins proches',
    },
    overlays: {
      title: 'Superpositions interactives',
      description: 'Espace pour zoom au survol, popovers, menus contextuels et aperçus de mélange.',
      badge: 'Sans découpe de dépassement',
      hover: 'Zoom au survol + popovers',
      hover_helper: 'Espace pour points, zoom et info-bulles au survol.',
      menus: 'Menu contextuel et actions rapides',
      menus_helper: 'Actions contextuelles et raccourcis.',
    },
    accessibility: {
      title: 'Aides accessibilité',
      description: 'Cartes de contraste, WCAG et aperçus arrimés au rail droit.',
      cards: {
        darker_45: 'AA/AAA à 4,5:1 - base foncée',
        darker_3: 'AA à 3:1 - base foncée',
        lighter_3: 'AA à 3:1 - base claire',
        lighter_45: 'AA/AAA à 4,5:1 - base claire',
      },
      contrast_cards: 'Cartes d’aperçu de contraste',
      preview_links: 'Aperçus liés et métadonnées',
    },
    modals: {
      title: 'Zone modale et notifications',
      description: 'Contexte réservé pour les boîtes de dialogue, le presse-papiers et les toasts.',
      badge: 'Empilé',
      dialogs: 'Emplacement pour la boîte de dialogue',
      dialogs_helper: 'Structure de modale pour import/export.',
      clipboard: 'Commandes de presse-papiers et partage',
      clipboard_helper: 'Copier le SVG, le JSON et actions rapides.',
      toast_area: 'Couloir toast/alerte',
      toast_helper: 'Couloir pour états de copie et partage.',
      dialog_title: 'Modale du générateur',
      dialog_body: 'Zone de corps de modale',
      close_label: 'Fermer la modale',
    },
  },
  validation: {
    sample: {
      title: 'Formulaire de validation réutilisable',
      description:
        'Cet exemple utilise un assistant de schéma partagé pour valider les entrées et afficher des messages neutres. Ajoutez des champs ou des règles selon vos besoins.',
      fields: {
        full_name: {
          label: 'Nom complet',
        },
        email: {
          label: 'Adresse courriel',
        },
      },
      actions: {
        submit: 'Valider et soumettre',
        reset: 'Réinitialiser le formulaire',
      },
      success: 'Validation réussie pour {name} ({email}).',
      helper_copy:
        'Les erreurs alimentent des tableaux réactifs pour un rendu cohérent sans dépendance aux composants.',
    },
    rules: {
      required: 'Ce champ est obligatoire.',
      email: 'Entrez une adresse courriel valide.',
    },
  },
  i18n: {
    switcher: {
      label: 'Langue',
      helper: 'Votre choix est conservé pour vos prochaines visites.',
    },
    locales: {
      en: 'Anglais',
      fr: 'Français',
    },
  },
  system: {
    not_found: {
      title: 'Page introuvable',
      message:
        "La page que vous recherchez n'existe pas encore. Utilisez la navigation pour continuer à explorer.",
      home: 'Retour à la page principale',
    },
  },
};
