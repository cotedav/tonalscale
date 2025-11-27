export default {
  home: {
    hero: {
      title: 'Squelette Tonal Scale',
      description: 'Démarrage Vue 3 + TypeScript + Vuetify prêt pour la PWA.',
    },
    toolkit: {
      title: 'Boîte à outils',
      description:
        'Vue 3 • TypeScript • Vite • Vuetify • Pinia • Vue Router • Vee-Validate • Vue I18n • VueUse • Lodash • Luxon',
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
      description: 'Formulaire réutilisable Vee-Validate + Yup avec champs Vuetify.',
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
        'Les erreurs alimentent les tableaux "error-messages" de Vuetify pour un rendu cohérent.',
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
};
