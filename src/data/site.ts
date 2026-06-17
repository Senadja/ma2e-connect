export const NAV_LINKS = [
  { label: "Accueil", href: "/" },
  { label: "Adhésion", href: "/adhesion" },
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

// Espace client e-banking (bouton « Espace MA2E ») et application mobile (footer).
export const EBANKING_URL = "https://ebanking.ma2e.ci/";
export const PLAYSTORE_URL = "https://play.google.com/store/apps/details?id=com.cagecfi.pmobile_mama2e_client&hl=fr&pli=1";

export const STATS = [
  { value: 8430, label: "Adhérents", suffix: "" },
  { value: 9, label: "Produits", suffix: "" },
  { value: 14, label: "Années d'activités", suffix: "" },
  { value: 2.9, label: "Mds FCFA de crédits", suffix: "" },
];

export const MILESTONES = [
  { year: "2006", title: "Création", desc: "Naissance de la MA2E à l'initiative des agents." },
  { year: "2009", title: "Agrément officiel", desc: "Reconnaissance comme institution de microfinance." },
  { year: "2010", title: "Démarrage des activités", desc: "Premiers produits d'épargne et de crédit." },
  { year: "2022", title: "Lancement E-MA2E", desc: "Plateforme digitale pour les adhérents." },
];

export const SAVINGS = [
  { id: "expresse", name: "Épargne Expresse", desc: "Épargne souple et disponible à tout moment pour répondre à vos besoins quotidiens.", features: ["Versements libres", "Disponibilité immédiate", "Sans frais d'ouverture", "Taux de rendement attractif"], image: "/images/products/Fiche_Produit_EPARGNE EXPRESSE.jpg", form: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { id: "ordinaire", name: "Épargne Ordinaire", desc: "Une formule classique pour épargner régulièrement et constituer votre capital.", features: ["Taux de 5% l'an", "Versements programmés", "Capital sécurisé", "Retraits encadrés"], image: "/images/products/Fiche_Produit_EPARGNE ORDINAIRE.jpg", form: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { id: "logement", name: "Épargne Logement", desc: "Préparez l'acquisition de votre futur logement avec une épargne dédiée.", features: ["Taux de 4% l'an", "Accès au crédit immobilier", "Durée 3 à 10 ans", "Plafond élevé"], image: "/images/products/Fiche_Produit_EPARGNE LOGEMENT.jpg", form: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { id: "dat", name: "Dépôt à terme simple", desc: "Bloquez votre capital sur une durée définie pour un rendement optimisé.", features: ["Taux de 6% à 7% l'an", "Durée 6 à 60 mois", "Capital protégé", "Intérêts capitalisés"], image: "/images/products/Fiche_Produit_DAT SIMPLE.jpg", form: "/documents/formulaires/Formulaire_DEMANDE DE SOUSCRIPTION DATS.docx" },
  { id: "datv", name: "DAT à versements progressifs", desc: "Combinez sécurité et flexibilité avec des versements échelonnés.", features: ["Taux de 6% à 7% l'an", "Rendement croissant", "Engagement modéré", "Souplesse contractuelle"], image: "/images/products/Fiche_Produit_DAT à VERSEMENT PROGRESSIF.jpg", form: "/documents/formulaires/Formulaire_DEMANDE DE SOUSCRIPTION DATAVP.docx" },
];

export const CREDITS = [
  { id: "ordinaire", name: "Crédit Ordinaire", duree: "Jusqu'à 60 mois", taux: "8% / an", montant: "Jusqu'à 30 M FCFA", conditions: "Adhérent depuis 6 mois", image: "/images/products/Fiche_Produit_CREDIT ORDINAIRE.jpg", form: "/documents/formulaires/Formulaire_DEMANDE DE CREDIT ORDINAIRE 2026.docx" },
  { id: "expresse", name: "Crédit Expresse", duree: "Jusqu'à 24 mois", taux: "9% / an", montant: "Jusqu'à 5 M FCFA", conditions: "Décaissement sous 48h", image: "/images/products/Fiche_Produit_CREDIT EXPRESS.jpg", form: "/documents/formulaires/Formulaire_DEMANDE DE CREDIT EXPRESS NOUVEAU.docx" },
  { id: "scolaire", name: "Crédit Scolaire", duree: "12 mois", taux: "6% / an", montant: "Jusqu'à 3 M FCFA", conditions: "Spécial Rentrée", image: "/images/products/Fiche_Produit_CREDIT SCOLAIRE copie.jpg", form: "/documents/formulaires/Formulaire_DEMANDE DE CREDIT SCOLAIRE.docx" },
  { id: "immobilier", name: "Crédit Immobilier", duree: "Jusqu'à 15 ans", taux: "6,5% / an", montant: "Jusqu'à 50 M FCFA", conditions: "Apport personnel 10%", image: "/images/products/Fiche_Produit_CREDIT IMMOBILIER copie.jpg", form: "/documents/formulaires/Formulaire_DEMANDE DE CREDIT ORDINAIRE 2026.docx" },
];

export const REAL_ESTATE_TYPES = [
  { name: "Duplex 4 pièces", icon: "Home" },
  { name: "Duplex 5 pièces", icon: "Building2" },
  { name: "Villa 3 pièces", icon: "House" },
  { name: "Villa 4 pièces", icon: "Castle" },
  { name: "Villa 5 pièces", icon: "Hotel" },
];

export type NewsArticle = {
  id: number;
  category: string;
  date: string;
  title: string;
  excerpt: string;
  author?: string;
  readTime?: string;
  tags?: string[];
  content: { type: "p" | "h2" | "quote" | "list" | "gallery"; text?: string; items?: string[] }[];
};

export const NEWS: NewsArticle[] = [
  {
    id: 1,
    category: "Événements",
    tags: ["Assemblée générale", "Gouvernance", "2025"],
    date: "12 mars 2025",
    title: "Assemblée Générale Ordinaire 2025",
    excerpt: "La MA2E convie tous ses adhérents à l'AG annuelle pour présenter les résultats et perspectives.",
    author: "Direction de la Communication",
    readTime: "4 min",
    content: [
      { type: "p", text: "La Mutuelle des Agents de l'Eau et de l'Électricité (MA2E) a le plaisir de convier l'ensemble de ses 7 335 adhérents à l'Assemblée Générale Ordinaire 2025, qui se tiendra le samedi 12 avril 2025 à 9h00 à l'Hôtel Pullman d'Abidjan-Plateau." },
      { type: "h2", text: "Ordre du jour" },
      { type: "list", items: ["Présentation du rapport moral du Conseil d'Administration", "Lecture du rapport financier de l'exercice 2024", "Approbation des comptes annuels et affectation du résultat", "Renouvellement partiel du Conseil d'Administration", "Perspectives stratégiques 2025-2027", "Questions diverses"] },
      { type: "h2", text: "Un exercice 2024 marqué par la croissance" },
      { type: "p", text: "L'année 2024 a été particulièrement dynamique pour notre mutuelle avec une augmentation de 12% du volume d'épargne collectée et plus de 2,4 milliards de FCFA de crédits accordés à nos adhérents. Le programme immobilier a également franchi un cap symbolique avec la livraison de la deuxième tranche de logements." },
      { type: "quote", text: "Cette assemblée est un moment fort de notre vie démocratique. Chaque adhérent est invité à contribuer activement aux décisions qui façonnent l'avenir de notre mutuelle." },
      { type: "p", text: "Les documents préparatoires (rapport moral, états financiers, projet de résolutions) sont disponibles sur la plateforme E-MA2E à compter du 25 mars 2025. Votre participation est essentielle." },
    ],
  },
  {
    id: 2,
    category: "Communiqués",
    tags: ["Agence", "Yamoussoukro", "Réseau"],
    date: "01 février 2025",
    title: "Nouvelle agence à Yamoussoukro",
    excerpt: "Ouverture officielle de notre 3ème agence pour mieux servir nos adhérents de l'intérieur.",
    author: "Direction des Opérations",
    readTime: "3 min",
    content: [
      { type: "p", text: "C'est avec une grande fierté que la MA2E annonce l'ouverture officielle de sa troisième agence, située à Yamoussoukro, capitale politique de la Côte d'Ivoire. Cette nouvelle implantation marque une étape majeure dans notre stratégie de proximité." },
      { type: "h2", text: "Une réponse aux attentes des adhérents" },
      { type: "p", text: "Avec plus de 1 200 adhérents recensés dans la région du Bélier, l'ouverture de cette agence répond à un besoin exprimé de longue date. Les adhérents pourront désormais effectuer toutes leurs opérations courantes sans avoir à se déplacer à Abidjan." },
      { type: "list", items: ["Ouverture et gestion de comptes d'épargne", "Demandes et décaissements de crédits", "Conseil patrimonial personnalisé", "Accompagnement aux projets immobiliers"] },
      { type: "h2", text: "Adresse et horaires" },
      { type: "p", text: "L'agence est située Avenue Houphouët-Boigny, immeuble Le Belier, 2ème étage. Elle est ouverte du lundi au vendredi de 8h à 17h et le samedi matin de 9h à 12h." },
    ],
  },
  {
    id: 3,
    category: "Offres",
    tags: ["Crédit immobilier", "Promotion", "Taux"],
    date: "15 janvier 2025",
    title: "Promotion crédit immobilier 2025",
    excerpt: "Bénéficiez d'un taux préférentiel de 6,2% sur tous les crédits immobiliers signés avant juin.",
    author: "Service Crédit",
    readTime: "5 min",
    content: [
      { type: "p", text: "Pour célébrer le succès de notre programme immobilier et accompagner toujours plus d'adhérents vers la propriété, la MA2E lance une offre exceptionnelle sur les crédits immobiliers signés entre le 15 janvier et le 30 juin 2025." },
      { type: "h2", text: "Les conditions de l'offre" },
      { type: "list", items: ["Taux préférentiel de 6,2% (au lieu de 6,5%)", "Durée jusqu'à 15 ans (20 ans avec différé)", "Montant maximal : 50 millions FCFA", "Apport personnel réduit à 8% (au lieu de 10%)", "Frais de dossier offerts pour les épargnants logement"] },
      { type: "quote", text: "Notre objectif est clair : permettre à 100 nouvelles familles d'accéder à la propriété en 2025." },
      { type: "h2", text: "Comment en bénéficier ?" },
      { type: "p", text: "Rendez-vous dans l'une de nos agences ou prenez rendez-vous via la plateforme E-MA2E. Un conseiller dédié étudiera votre dossier sous 7 jours ouvrés." },
    ],
  },
  {
    id: 4,
    category: "Événements",
    tags: ["Immobilier", "Logement", "Cérémonie"],
    date: "05 décembre 2024",
    title: "Cérémonie de remise des clés — 2ème tranche",
    excerpt: "12 nouvelles familles deviennent propriétaires grâce au programme immobilier MA2E.",
    author: "Direction Générale",
    readTime: "4 min",
    content: [
      { type: "p", text: "Une atmosphère chaleureuse et émouvante a régné lors de la cérémonie de remise des clés de la deuxième tranche du programme immobilier MA2E, organisée le 5 décembre 2024 à la cité résidentielle de Songon." },
      { type: "h2", text: "12 familles récompensées" },
      { type: "p", text: "Douze adhérents ont reçu officiellement les clés de leur nouveau logement, fruit de plusieurs années d'épargne et d'un accompagnement personnalisé par les équipes de la mutuelle." },
      { type: "quote", text: "Voir le sourire de ces familles, c'est la plus belle récompense pour toutes nos équipes. C'est aussi la preuve que notre modèle mutualiste fonctionne." },
      { type: "h2", text: "Vers une troisième tranche en 2026" },
      { type: "p", text: "Forte de ce succès, la MA2E annonce le lancement officiel de la troisième tranche pour 2026, avec un objectif ambitieux : 30 nouveaux logements répartis entre duplex et villas familiales." },
    ],
  },
  {
    id: 5,
    category: "Communiqués",
    tags: ["E-MA2E", "Digital", "Plateforme"],
    date: "20 novembre 2024",
    title: "Mise à jour de la plateforme E-MA2E",
    excerpt: "Nouvelle interface, espace adhérent enrichi et notifications en temps réel.",
    author: "Direction Digitale",
    readTime: "3 min",
    content: [
      { type: "p", text: "Deux ans après son lancement, la plateforme E-MA2E s'offre une refonte complète pour offrir une expérience encore plus fluide et moderne à ses utilisateurs." },
      { type: "h2", text: "Les nouveautés" },
      { type: "list", items: ["Nouvelle interface plus claire et accessible", "Tableau de bord personnalisé par profil d'adhérent", "Notifications en temps réel (SMS et push)", "Téléchargement instantané des relevés et attestations", "Simulateur de crédit et d'épargne intégré"] },
      { type: "p", text: "L'application mobile sera également mise à jour automatiquement dans les jours à venir. Aucune action n'est requise de votre part." },
    ],
  },
  {
    id: 6,
    category: "Offres",
    tags: ["Épargne logement", "Bonification", "Offre"],
    date: "10 octobre 2024",
    title: "Épargne Logement bonifiée",
    excerpt: "Profitez d'une bonification exceptionnelle sur l'épargne logement jusqu'au 31 décembre.",
    author: "Service Épargne",
    readTime: "3 min",
    content: [
      { type: "p", text: "La MA2E accorde une bonification exceptionnelle de 1,5 point sur les versements effectués sur les comptes d'épargne logement entre le 10 octobre et le 31 décembre 2024." },
      { type: "h2", text: "Pourquoi ouvrir une épargne logement ?" },
      { type: "list", items: ["Constituer l'apport personnel pour un futur achat", "Bénéficier d'un taux d'intérêt bonifié", "Accéder en priorité au programme immobilier MA2E", "Préparer sereinement votre projet de vie"] },
      { type: "p", text: "L'ouverture d'un compte épargne logement est gratuite et peut se faire en moins de 15 minutes, en agence ou directement depuis votre espace E-MA2E." },
    ],
  },
];

export const FAQ_IMMO = [
  { q: "Qui peut bénéficier du programme immobilier ?", a: "Tout adhérent MA2E à jour de ses cotisations et justifiant d'une ancienneté minimale de 24 mois." },
  { q: "Quel est l'apport personnel requis ?", a: "Un apport minimum de 10% du coût total du logement est demandé. Une épargne logement préalable peut couvrir cet apport." },
  { q: "Quelle est la durée du remboursement ?", a: "La durée maximale est de 15 ans, ou 20 ans avec différé pour le crédit immobilier différé." },
  { q: "Les logements sont-ils livrés clés en main ?", a: "Oui, tous les logements sont livrés finis, raccordés aux réseaux et prêts à habiter." },
  { q: "Comment se passe la sélection des bénéficiaires ?", a: "Une commission interne examine les dossiers selon des critères transparents : ancienneté, capacité de remboursement, projet familial." },
];

// Organes de gouvernance issus de l'organigramme officiel MA2E (22/05/2026).
// Les noms des responsables seront ajoutés après validation par la MA2E.
export const TEAM = [
  { name: "Assemblée Générale", role: "Organe souverain réunissant l'ensemble des sociétaires", initials: "AG" },
  { name: "Conseil d'Administration", role: "Définit la stratégie et oriente la gestion de la mutuelle", initials: "CA" },
  { name: "Conseil de Surveillance", role: "Contrôle la régularité et la conformité de la gestion", initials: "CS" },
  { name: "Comité de Crédit", role: "Étudie les dossiers et décide de l'octroi des crédits", initials: "CC" },
  { name: "Comité d'Éthique et de Déontologie", role: "Veille au respect des valeurs et règles mutualistes", initials: "CE" },
  { name: "Direction Générale", role: "Pilote l'exploitation, les finances et l'administration", initials: "DG" },
];
