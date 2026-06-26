// Données d'amorçage (bootstrap) reprises du front au 10/06/2026.
// Après le premier seed, la base PostgreSQL devient la source de vérité ;
// ce fichier n'est utilisé que pour initialiser une base vide.

export type Block = { type: 'p' | 'h2' | 'quote' | 'list'; text?: string; items?: string[] };

export const NEWS = [
  {
    category: 'Événements',
    tags: ['Assemblée générale', 'Gouvernance', '2025'],
    date: '12 mars 2025',
    title: 'Assemblée Générale Ordinaire 2025',
    excerpt: "La MA2E convie tous ses adhérents à l'AG annuelle pour présenter les résultats et perspectives.",
    author: 'Direction de la Communication',
    readTime: '4 min',
    content: [
      { type: 'p', text: "La Mutuelle des Agents de l'Eau et de l'Électricité (MA2E) a le plaisir de convier l'ensemble de ses 7 335 adhérents à l'Assemblée Générale Ordinaire 2025, qui se tiendra le samedi 12 avril 2025 à 9h00 à l'Hôtel Pullman d'Abidjan-Plateau." },
      { type: 'h2', text: 'Ordre du jour' },
      { type: 'list', items: ['Présentation du rapport moral du Conseil d\'Administration', 'Lecture du rapport financier de l\'exercice 2024', 'Approbation des comptes annuels et affectation du résultat', 'Renouvellement partiel du Conseil d\'Administration', 'Perspectives stratégiques 2025-2027', 'Questions diverses'] },
      { type: 'h2', text: 'Un exercice 2024 marqué par la croissance' },
      { type: 'p', text: "L'année 2024 a été particulièrement dynamique pour notre mutuelle avec une augmentation de 12% du volume d'épargne collectée et plus de 2,4 milliards de FCFA de crédits accordés à nos adhérents. Le programme immobilier a également franchi un cap symbolique avec la livraison de la deuxième tranche de logements." },
      { type: 'quote', text: 'Cette assemblée est un moment fort de notre vie démocratique. Chaque adhérent est invité à contribuer activement aux décisions qui façonnent l\'avenir de notre mutuelle.' },
      { type: 'p', text: 'Les documents préparatoires (rapport moral, états financiers, projet de résolutions) sont disponibles sur la plateforme E-MA2E à compter du 25 mars 2025. Votre participation est essentielle.' },
    ] as Block[],
  },
  {
    category: 'Communiqués',
    tags: ['Agence', 'Yamoussoukro', 'Réseau'],
    date: '01 février 2025',
    title: 'Nouvelle agence à Yamoussoukro',
    excerpt: 'Ouverture officielle de notre 3ème agence pour mieux servir nos adhérents de l\'intérieur.',
    author: 'Direction des Opérations',
    readTime: '3 min',
    content: [
      { type: 'p', text: "C'est avec une grande fierté que la MA2E annonce l'ouverture officielle de sa troisième agence, située à Yamoussoukro, capitale politique de la Côte d'Ivoire. Cette nouvelle implantation marque une étape majeure dans notre stratégie de proximité." },
      { type: 'h2', text: 'Une réponse aux attentes des adhérents' },
      { type: 'p', text: "Avec plus de 1 200 adhérents recensés dans la région du Bélier, l'ouverture de cette agence répond à un besoin exprimé de longue date. Les adhérents pourront désormais effectuer toutes leurs opérations courantes sans avoir à se déplacer à Abidjan." },
      { type: 'list', items: ['Ouverture et gestion de comptes d\'épargne', 'Demandes et décaissements de crédits', 'Conseil patrimonial personnalisé', 'Accompagnement aux projets immobiliers'] },
      { type: 'h2', text: 'Adresse et horaires' },
      { type: 'p', text: "L'agence est située Avenue Houphouët-Boigny, immeuble Le Belier, 2ème étage. Elle est ouverte du lundi au vendredi de 8h à 17h et le samedi matin de 9h à 12h." },
    ] as Block[],
  },
  {
    category: 'Offres',
    tags: ['Crédit immobilier', 'Promotion', 'Taux'],
    date: '15 janvier 2025',
    title: 'Promotion crédit immobilier 2025',
    excerpt: "Bénéficiez d'un taux préférentiel de 6,2% sur tous les crédits immobiliers signés avant juin.",
    author: 'Service Crédit',
    readTime: '5 min',
    content: [
      { type: 'p', text: 'Pour célébrer le succès de notre programme immobilier et accompagner toujours plus d\'adhérents vers la propriété, la MA2E lance une offre exceptionnelle sur les crédits immobiliers signés entre le 15 janvier et le 30 juin 2025.' },
      { type: 'h2', text: 'Les conditions de l\'offre' },
      { type: 'list', items: ['Taux préférentiel de 6,2% (au lieu de 6,5%)', 'Durée jusqu\'à 15 ans (20 ans avec différé)', 'Montant maximal : 50 millions FCFA', 'Apport personnel réduit à 8% (au lieu de 10%)', 'Frais de dossier offerts pour les épargnants logement'] },
      { type: 'quote', text: 'Notre objectif est clair : permettre à 100 nouvelles familles d\'accéder à la propriété en 2025.' },
      { type: 'h2', text: 'Comment en bénéficier ?' },
      { type: 'p', text: 'Rendez-vous dans l\'une de nos agences ou prenez rendez-vous via la plateforme E-MA2E. Un conseiller dédié étudiera votre dossier sous 7 jours ouvrés.' },
    ] as Block[],
  },
  {
    category: 'Événements',
    tags: ['Immobilier', 'Logement', 'Cérémonie'],
    date: '05 décembre 2024',
    title: 'Cérémonie de remise des clés — 2ème tranche',
    excerpt: '12 nouvelles familles deviennent propriétaires grâce au programme immobilier MA2E.',
    author: 'Direction Générale',
    readTime: '4 min',
    content: [
      { type: 'p', text: 'Une atmosphère chaleureuse et émouvante a régné lors de la cérémonie de remise des clés de la deuxième tranche du programme immobilier MA2E, organisée le 5 décembre 2024 à la cité résidentielle de Songon.' },
      { type: 'h2', text: '12 familles récompensées' },
      { type: 'p', text: 'Douze adhérents ont reçu officiellement les clés de leur nouveau logement, fruit de plusieurs années d\'épargne et d\'un accompagnement personnalisé par les équipes de la mutuelle.' },
      { type: 'quote', text: 'Voir le sourire de ces familles, c\'est la plus belle récompense pour toutes nos équipes. C\'est aussi la preuve que notre modèle mutualiste fonctionne.' },
      { type: 'h2', text: 'Vers une troisième tranche en 2026' },
      { type: 'p', text: 'Forte de ce succès, la MA2E annonce le lancement officiel de la troisième tranche pour 2026, avec un objectif ambitieux : 30 nouveaux logements répartis entre duplex et villas familiales.' },
    ] as Block[],
  },
  {
    category: 'Communiqués',
    tags: ['E-MA2E', 'Digital', 'Plateforme'],
    date: '20 novembre 2024',
    title: 'Mise à jour de la plateforme E-MA2E',
    excerpt: 'Nouvelle interface, espace adhérent enrichi et notifications en temps réel.',
    author: 'Direction Digitale',
    readTime: '3 min',
    content: [
      { type: 'p', text: 'Deux ans après son lancement, la plateforme E-MA2E s\'offre une refonte complète pour offrir une expérience encore plus fluide et moderne à ses utilisateurs.' },
      { type: 'h2', text: 'Les nouveautés' },
      { type: 'list', items: ['Nouvelle interface plus claire et accessible', 'Tableau de bord personnalisé par profil d\'adhérent', 'Notifications en temps réel (SMS et push)', 'Téléchargement instantané des relevés et attestations', 'Simulateur de crédit et d\'épargne intégré'] },
      { type: 'p', text: 'L\'application mobile sera également mise à jour automatiquement dans les jours à venir. Aucune action n\'est requise de votre part.' },
    ] as Block[],
  },
  {
    category: 'Offres',
    tags: ['Épargne logement', 'Bonification', 'Offre'],
    date: '10 octobre 2024',
    title: 'Épargne Logement bonifiée',
    excerpt: "Profitez d'une bonification exceptionnelle sur l'épargne logement jusqu'au 31 décembre.",
    author: 'Service Épargne',
    readTime: '3 min',
    content: [
      { type: 'p', text: 'La MA2E accorde une bonification exceptionnelle de 1,5 point sur les versements effectués sur les comptes d\'épargne logement entre le 10 octobre et le 31 décembre 2024.' },
      { type: 'h2', text: 'Pourquoi ouvrir une épargne logement ?' },
      { type: 'list', items: ['Constituer l\'apport personnel pour un futur achat', 'Bénéficier d\'un taux d\'intérêt bonifié', 'Accéder en priorité au programme immobilier MA2E', 'Préparer sereinement votre projet de vie'] },
      { type: 'p', text: 'L\'ouverture d\'un compte épargne logement est gratuite et peut se faire en moins de 15 minutes, en agence ou directement depuis votre espace E-MA2E.' },
    ] as Block[],
  },
];

export const SAVINGS = [
  { id: 'expresse', name: 'Épargne Expresse', desc: 'Épargne souple et disponible à tout moment pour répondre à vos besoins quotidiens.', features: ['Versements libres', 'Disponibilité immédiate', 'Sans frais d\'ouverture', 'Taux de rendement attractif'], image: '/images/products/Fiche_Produit_EPARGNE EXPRESSE.jpg', form: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { id: 'ordinaire', name: 'Épargne Ordinaire', desc: 'Une formule classique pour épargner régulièrement et constituer votre capital.', features: ['Taux de 3,5% l\'an', 'Versements programmés ou ponctuels', 'Capital sécurisé', 'Retraits encadrés'], image: '/images/products/Fiche_Produit_EPARGNE ORDINAIRE.jpg', form: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { id: 'logement', name: 'Épargne Logement', desc: 'Préparez l\'acquisition de votre futur logement avec une épargne dédiée.', features: ['Versements mensuels ou ponctuels', 'Aucun frais de gestion', 'Dédié à l\'acquisition d\'un logement', 'Accès au crédit immobilier'], image: '/images/products/Fiche_Produit_EPARGNE LOGEMENT.jpg', form: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { id: 'dat', name: 'Dépôt à terme simple', desc: 'Bloquez votre capital sur une durée définie pour un rendement optimisé.', features: ['Taux de 3,5% à 4% l\'an (barème)', 'Durée à partir de 6 mois', 'Dépôt minimum 100 000 F', 'Capital protégé'], image: '/images/products/Fiche_Produit_DAT SIMPLE.jpg', form: '/documents/formulaires/Formulaire_DEMANDE DE SOUSCRIPTION DATS.docx' },
  { id: 'datv', name: 'DAT à versements progressifs', desc: 'Combinez sécurité et flexibilité avec des versements échelonnés.', features: ['Taux de 3,5% à 4% l\'an', 'Durée 2 à 5 ans', 'Versements à partir de 5 000 F', 'Rendement croissant'], image: '/images/products/Fiche_Produit_DAT à VERSEMENT PROGRESSIF.jpg', form: '/documents/formulaires/Formulaire_DEMANDE DE SOUSCRIPTION DATAVP.docx' },
];

export const CREDITS = [
  { id: 'ordinaire', name: 'Crédit Ordinaire', duree: 'Jusqu\'à 60 mois', taux: '8% / an', montant: 'Jusqu\'à 30 M FCFA', conditions: 'Adhérent depuis 6 mois', image: '/images/products/Fiche_Produit_CREDIT ORDINAIRE.jpg', form: '/documents/formulaires/Formulaire_DEMANDE DE CREDIT ORDINAIRE 2026.docx' },
  { id: 'expresse', name: 'Crédit Expresse', duree: 'Jusqu\'à 24 mois', taux: '9% / an', montant: 'Jusqu\'à 5 M FCFA', conditions: 'Décaissement sous 48h', image: '/images/products/Fiche_Produit_CREDIT EXPRESS.jpg', form: '/documents/formulaires/Formulaire_DEMANDE DE CREDIT EXPRESS NOUVEAU.docx' },
  { id: 'scolaire', name: 'Crédit Scolaire', duree: '12 mois', taux: '6% / an', montant: 'Jusqu\'à 3 M FCFA', conditions: 'Spécial Rentrée', image: '/images/products/Fiche_Produit_CREDIT SCOLAIRE copie.jpg', form: '/documents/formulaires/Formulaire_DEMANDE DE CREDIT SCOLAIRE.docx' },
  { id: 'immobilier', name: 'Crédit Immobilier', duree: 'Jusqu\'à 15 ans', taux: '6,5% / an', montant: 'Jusqu\'à 50 M FCFA', conditions: 'Apport personnel 10%', image: '/images/products/Fiche_Produit_CREDIT IMMOBILIER copie.jpg', form: '/documents/formulaires/Formulaire_DEMANDE DE CREDIT ORDINAIRE 2026.docx' },
];

export const MEDIA = [
  { category: 'Formulaires', title: 'Formulaire d\'adhésion MA2E', desc: 'Demande d\'adhésion à la mutuelle.', size: '191 Ko', year: '2025', href: "/documents/formulaires/Formulaire_FICHE D'ADHESION E-MA2E.pdf" },
  { category: 'Formulaires', title: 'Demande d\'épargne', desc: 'Formulaire d\'ouverture d\'un compte épargne.', size: '60 Ko', year: '2025', href: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { category: 'Formulaires', title: 'Demande de crédit ordinaire', desc: 'Dossier de demande pour un crédit ordinaire.', size: '190 Ko', year: '2026', href: '/documents/formulaires/Formulaire_DEMANDE DE CREDIT ORDINAIRE 2026.docx' },
  { category: 'Formulaires', title: 'Demande de crédit express', desc: 'Dossier de demande pour un crédit express.', size: '140 Ko', year: '2025', href: '/documents/formulaires/Formulaire_DEMANDE DE CREDIT EXPRESS NOUVEAU.docx' },
  { category: 'Formulaires', title: 'Demande de souscription DAT', desc: 'Dossier de demande pour un Dépôt à Terme.', size: '84 Ko', year: '2025', href: '/documents/formulaires/Formulaire_DEMANDE DE SOUSCRIPTION DATS.docx' },
  { category: 'Rapports annuels', title: 'Rapport annuel 2024', desc: 'Bilan d\'activité, états financiers et perspectives.', size: '6,4 Mo', year: '2024', href: '/documents/institutionnel/MA2E_Rapport_2024_22 Sept 2025.pdf' },
  { category: 'Rapports annuels', title: 'Rapport annuel 2023', desc: 'Bilan d\'activité de l\'exercice 2023.', size: '3,8 Mo', year: '2023', href: '' },
  { category: 'Statuts & règlements', title: 'Statuts de la MA2E', desc: 'Texte fondateur de la mutuelle, version consolidée.', size: '5,8 Mo', year: '2025', href: '/documents/institutionnel/STATUTS MODIFIE LE 26 JUIN 2025 ENREGISTRE.pdf' },
  { category: 'Statuts & règlements', title: 'Organigramme de la MA2E', desc: 'Structure organisationnelle mise à jour.', size: '109 Ko', year: '2026', href: '/documents/institutionnel/Organigramme de la MA2E - MISE A JOUR LE 22-05-2026.pdf' },
  { category: 'Brochures', title: 'Brochure produits 2025', desc: 'Présentation complète de l\'offre MA2E.', size: '2,1 Mo', year: '2025', href: '' },
];

export const FAQS = [
  { category: 'Adhésion', question: 'Qui peut devenir adhérent de la MA2E ?', answer: "Tout agent en activité des sociétés du secteur de l'eau et de l'électricité (CIE, SODECI, et structures affiliées) peut devenir adhérent." },
  { category: 'Adhésion', question: "Quels sont les frais d'adhésion ?", answer: "L'adhésion comprend un droit unique de 6 000 FCFA et la souscription à la part sociale. Les détails sont disponibles en agence." },
  { category: 'Adhésion', question: 'Comment soumettre ma demande d\'adhésion ?', answer: 'Téléchargez le formulaire dans la médiathèque, complétez-le et déposez-le en agence avec les pièces justificatives demandées.' },
  { category: 'Épargne', question: 'Quels sont les types d\'épargne proposés ?', answer: 'La MA2E propose 5 formules : Épargne Expresse, Ordinaire, Logement, Dépôt à terme simple et DAT à versements progressifs.' },
  { category: 'Épargne', question: 'Mon épargne est-elle disponible à tout moment ?', answer: "Cela dépend de la formule choisie. L'Épargne Expresse est disponible à tout moment, alors que les DAT sont bloqués sur la durée contractuelle." },
  { category: 'Crédit', question: 'Quelles sont les conditions pour obtenir un crédit ?', answer: 'Être adhérent depuis au moins 6 mois, être à jour de ses cotisations et présenter un dossier complet (justificatifs de revenus, projet, garanties).' },
  { category: 'Crédit', question: 'Quel est le délai de traitement d\'un dossier ?', answer: 'Crédit Expresse : 48h. Crédit Ordinaire : 7 jours ouvrés. Crédit Immobilier : 15 à 30 jours selon complexité du dossier.' },
  { category: 'Crédit', question: 'Puis-je rembourser par anticipation ?', answer: 'Oui, le remboursement anticipé est possible sans pénalité sur la plupart de nos formules.' },
  { category: 'E-MA2E', question: 'Qu\'est-ce que la plateforme E-MA2E ?', answer: 'E-MA2E est l\'espace digital permettant aux adhérents de consulter leur compte, télécharger leurs relevés et effectuer des opérations en ligne.' },
  { category: 'E-MA2E', question: 'Combien coûte l\'accès à E-MA2E ?', answer: 'L\'abonnement est de 500 FCFA par mois, prélevé directement sur votre compte.' },
  { category: 'E-MA2E', question: 'J\'ai oublié mon mot de passe, que faire ?', answer: 'Cliquez sur « Mot de passe oublié » sur la page de connexion, ou contactez le support à info@ma2e.ci.' },
];

export const SETTINGS_DEFAULTS: Record<string, unknown> = {
  flashBanner: {
    enabled: true,
    text: 'Assemblée Générale Ordinaire 2025 — Inscriptions ouvertes',
    link: '/actualites/assemblee-generale-ordinaire-2025',
  },
  contact: {
    address: 'Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, Abidjan',
    phone: '(+225) 27 21 23 64 87',
    email: 'info@ma2e.ci',
    hours: 'Lun – Ven : 8h00 — 17h00',
    dcpEmail: 'privacyMA2E@ma2e.ci',
  },
  social: {
    facebook: '',
    linkedin: '',
    twitter: '',
  },
  stats: [
    { value: 8430, label: 'Adhérents', suffix: '' },
    { value: 9, label: 'Produits', suffix: '' },
    { value: 20, label: "Années d'activités", suffix: '' },
    { value: 6.3, label: 'Mds FCFA de crédits', suffix: '' },
  ],
  smtp: {
    enabled: false,
    host: '',
    port: 587,
    user: '',
    pass: '',
    secure: false,
    from: 'MA2E <no-reply@ma2e.ci>',
    to: 'contact@ma2e.ci',
  },
  // Organigramme éditable (section « Organisation » de la page À propos).
  // Arbre récursif (encadrement), d'après l'organigramme officiel MA2E (MAJ 22/05/2026).
  orgTree: {
    name: 'Assemblée Générale',
    children: [
      { name: "Comité d'Éthique et de Déontologie" },
      {
        name: "Conseil d'Administration",
        children: [
          {
            name: 'Directeur Général',
            role: 'GOUEDAN Franck Olivier',
            children: [
              { name: 'Responsable Audit Interne et QSE', role: 'KOISSI Aya Philomène' },
              { name: "Responsable des Systèmes d'Information", role: 'TOURE Adama' },
              { name: 'Contrôleur Interne', role: 'DJEDJERO Natacha' },
              {
                name: 'Directeur Administration Gestion Finance',
                role: 'KONE Madoussou Yari épse Sombo',
                children: [
                  { name: 'Responsable Exploitation', role: 'AKPOUE Affouet Rosabelle' },
                  { name: 'Responsable Financier', role: 'TRAORE Ismaël' },
                  { name: 'Responsable Administratif', role: "N'ZI Obodji Micheline" },
                ],
              },
            ],
          },
        ],
      },
      { name: 'Comité de Crédit' },
      { name: 'Conseil de Surveillance' },
    ],
  },
};

export const PARTNERS = [
  { name: 'BCEAO', type: 'Tutelle', desc: "Banque Centrale des États de l'Afrique de l'Ouest — autorité monétaire régionale." },
  { name: 'Ministère des Finances', type: 'Tutelle', desc: 'Tutelle administrative et financière des institutions de microfinance.' },
  { name: 'APSFD-CI', type: 'Association professionnelle', desc: 'Association Professionnelle des Systèmes Financiers Décentralisés de Côte d\'Ivoire.' },
  { name: 'CNPS', type: 'Partenaire', desc: 'Caisse Nationale de Prévoyance Sociale — partenaire pour les retraites complémentaires.' },
];

export const TEAM = [
  { name: 'Assemblée Générale', role: "Organe souverain réunissant l'ensemble des sociétaires", initials: 'AG', category: 'Gouvernance' },
  { name: "Conseil d'Administration", role: 'Définit la stratégie et oriente la gestion de la mutuelle', initials: 'CA', category: 'Gouvernance' },
  { name: 'Conseil de Surveillance', role: 'Contrôle la régularité et la conformité de la gestion', initials: 'CS', category: 'Gouvernance' },
  { name: 'Comité de Crédit', role: "Étudie les dossiers et décide de l'octroi des crédits", initials: 'CC', category: 'Gouvernance' },
  { name: "Comité d'Éthique et de Déontologie", role: 'Veille au respect des valeurs et règles mutualistes', initials: 'CE', category: 'Gouvernance' },
  { name: 'Direction Générale', role: "Pilote l'exploitation, les finances et l'administration", initials: 'DG', category: 'Direction' },
];

