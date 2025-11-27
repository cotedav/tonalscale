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
