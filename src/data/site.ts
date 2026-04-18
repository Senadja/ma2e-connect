export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  {
    label: "À propos",
    href: "/a-propos",
    children: [
      { label: "Notre histoire", href: "/a-propos#histoire", desc: "14 ans au service des agents" },
      { label: "Notre mission", href: "/a-propos#mission", desc: "Nos engagements" },
      { label: "Organisation", href: "/a-propos#organisation", desc: "Gouvernance & équipe" },
    ],
  },
  {
    label: "Produits",
    href: "/produits",
    children: [
      { label: "Épargne rémunérée", href: "/produits/epargne", desc: "5 formules d'épargne" },
      { label: "Formules de crédit", href: "/produits/credits", desc: "Financez vos projets" },
      { label: "Projet immobilier", href: "/produits/immobilier", desc: "Accédez à la propriété" },
    ],
  },
  { label: "Actualités", href: "/actualites" },
  { label: "Contact", href: "/contact" },
] as const;

export const STATS = [
  { value: 7335, label: "Adhérents", suffix: "" },
  { value: 9, label: "Produits", suffix: "" },
  { value: 14, label: "Années d'activités", suffix: "" },
  { value: 2.4, label: "Mds FCFA de crédits", suffix: "" },
];

export const MILESTONES = [
  { year: "2006", title: "Création", desc: "Naissance de la MA2E à l'initiative des agents." },
  { year: "2009", title: "Agrément officiel", desc: "Reconnaissance comme institution de microfinance." },
  { year: "2010", title: "Démarrage des activités", desc: "Premiers produits d'épargne et de crédit." },
  { year: "2022", title: "Lancement E-MA2E", desc: "Plateforme digitale pour les adhérents." },
];

export const SAVINGS = [
  { id: "expresse", name: "Épargne Expresse", desc: "Épargne souple et disponible à tout moment pour répondre à vos besoins quotidiens.", features: ["Versements libres", "Disponibilité immédiate", "Sans frais d'ouverture", "Suivi en ligne"] },
  { id: "ordinaire", name: "Épargne Ordinaire", desc: "Une formule classique pour épargner régulièrement et constituer votre capital.", features: ["Taux d'intérêt avantageux", "Versements programmés", "Capital sécurisé", "Retraits encadrés"] },
  { id: "logement", name: "Épargne Logement", desc: "Préparez l'acquisition de votre futur logement avec une épargne dédiée.", features: ["Bonification logement", "Accès au crédit immobilier", "Durée 3 à 10 ans", "Plafond élevé"] },
  { id: "dat", name: "Dépôt à terme simple", desc: "Bloquez votre capital sur une durée définie pour un rendement optimisé.", features: ["Taux fixe garanti", "Durée 6 à 60 mois", "Capital protégé", "Intérêts capitalisés"] },
  { id: "datv", name: "DAT à versements progressifs", desc: "Combinez sécurité et flexibilité avec des versements échelonnés.", features: ["Versements progressifs", "Rendement croissant", "Engagement modéré", "Souplesse contractuelle"] },
];

export const CREDITS = [
  { id: "ordinaire", name: "Crédit Ordinaire", duree: "Jusqu'à 60 mois", taux: "8% / an", montant: "5 M FCFA", conditions: "Adhérent depuis 6 mois" },
  { id: "expresse", name: "Crédit Expresse", duree: "Jusqu'à 24 mois", taux: "9% / an", montant: "1,5 M FCFA", conditions: "Décaissement sous 48h" },
  { id: "immobilier", name: "Crédit Immobilier", duree: "Jusqu'à 15 ans", taux: "6,5% / an", montant: "50 M FCFA", conditions: "Apport personnel 10%" },
  { id: "immobilier-differe", name: "Crédit Immobilier Différé", duree: "Jusqu'à 20 ans", taux: "6,5% / an", montant: "50 M FCFA", conditions: "Différé 12 mois max" },
];

export const REAL_ESTATE_TYPES = [
  { name: "Duplex 4 pièces", icon: "Home" },
  { name: "Duplex 5 pièces", icon: "Building2" },
  { name: "Villa 3 pièces", icon: "House" },
  { name: "Villa 4 pièces", icon: "Castle" },
  { name: "Villa 5 pièces", icon: "Hotel" },
];

export const NEWS = [
  { id: 1, category: "Événements", date: "12 mars 2025", title: "Assemblée Générale Ordinaire 2025", excerpt: "La MA2E convie tous ses adhérents à l'AG annuelle pour présenter les résultats et perspectives." },
  { id: 2, category: "Communiqués", date: "01 février 2025", title: "Nouvelle agence à Yamoussoukro", excerpt: "Ouverture officielle de notre 3ème agence pour mieux servir nos adhérents de l'intérieur." },
  { id: 3, category: "Offres", date: "15 janvier 2025", title: "Promotion crédit immobilier 2025", excerpt: "Bénéficiez d'un taux préférentiel de 6,2% sur tous les crédits immobiliers signés avant juin." },
  { id: 4, category: "Événements", date: "05 décembre 2024", title: "Cérémonie de remise des clés — 2ème tranche", excerpt: "12 nouvelles familles deviennent propriétaires grâce au programme immobilier MA2E." },
  { id: 5, category: "Communiqués", date: "20 novembre 2024", title: "Mise à jour de la plateforme E-MA2E", excerpt: "Nouvelle interface, espace adhérent enrichi et notifications en temps réel." },
  { id: 6, category: "Offres", date: "10 octobre 2024", title: "Épargne Logement bonifiée", excerpt: "Profitez d'une bonification exceptionnelle sur l'épargne logement jusqu'au 31 décembre." },
];

export const FAQ_IMMO = [
  { q: "Qui peut bénéficier du programme immobilier ?", a: "Tout adhérent MA2E à jour de ses cotisations et justifiant d'une ancienneté minimale de 24 mois." },
  { q: "Quel est l'apport personnel requis ?", a: "Un apport minimum de 10% du coût total du logement est demandé. Une épargne logement préalable peut couvrir cet apport." },
  { q: "Quelle est la durée du remboursement ?", a: "La durée maximale est de 15 ans, ou 20 ans avec différé pour le crédit immobilier différé." },
  { q: "Les logements sont-ils livrés clés en main ?", a: "Oui, tous les logements sont livrés finis, raccordés aux réseaux et prêts à habiter." },
  { q: "Comment se passe la sélection des bénéficiaires ?", a: "Une commission interne examine les dossiers selon des critères transparents : ancienneté, capacité de remboursement, projet familial." },
];

export const TEAM = [
  { name: "Ahmadou BAKAYOKO", role: "Président du Conseil d'Administration", initials: "AB" },
  { name: "Marcel ZADI KESSY", role: "Fondateur, Président d'Honneur", initials: "MZ" },
  { name: "Konan KOUASSI", role: "Directeur Général", initials: "KK" },
  { name: "Aminata DIALLO", role: "Directrice des Opérations", initials: "AD" },
  { name: "Yao BROU", role: "Directeur Financier", initials: "YB" },
  { name: "Fatou TOURÉ", role: "Responsable Crédit", initials: "FT" },
];
