export const FAQ_CATEGORIES = ["Adhésion", "Épargne", "Crédit", "E-MA2E"] as const;
export type FaqCategory = typeof FAQ_CATEGORIES[number];

export const FAQS: { category: FaqCategory; q: string; a: string }[] = [
  { category: "Adhésion", q: "Qui peut devenir adhérent de la MA2E ?", a: "Tout agent en activité des sociétés du secteur de l'eau et de l'électricité (CIE, SODECI, et structures affiliées) peut devenir adhérent." },
  { category: "Adhésion", q: "Quels sont les frais d'adhésion ?", a: "L'adhésion comprend un droit unique de 6 000 FCFA et la souscription à la part sociale. Les détails sont disponibles en agence." },
  { category: "Adhésion", q: "Comment soumettre ma demande d'adhésion ?", a: "Téléchargez le formulaire dans la médiathèque, complétez-le et déposez-le en agence avec les pièces justificatives demandées." },
  { category: "Épargne", q: "Quels sont les types d'épargne proposés ?", a: "La MA2E propose 5 formules : Épargne Expresse, Ordinaire, Logement, Dépôt à terme simple et DAT à versements progressifs." },
  { category: "Épargne", q: "Mon épargne est-elle disponible à tout moment ?", a: "Cela dépend de la formule choisie. L'Épargne Expresse est disponible à tout moment, alors que les DAT sont bloqués sur la durée contractuelle." },
  { category: "Crédit", q: "Quelles sont les conditions pour obtenir un crédit ?", a: "Être adhérent depuis au moins 6 mois, être à jour de ses cotisations et présenter un dossier complet (justificatifs de revenus, projet, garanties)." },
  { category: "Crédit", q: "Quel est le délai de traitement d'un dossier ?", a: "Crédit Expresse : 48h. Crédit Ordinaire : 7 jours ouvrés. Crédit Immobilier : 15 à 30 jours selon complexité du dossier." },
  { category: "Crédit", q: "Puis-je rembourser par anticipation ?", a: "Oui, le remboursement anticipé est possible sans pénalité sur la plupart de nos formules." },
  { category: "E-MA2E", q: "Qu'est-ce que la plateforme E-MA2E ?", a: "E-MA2E est l'espace digital permettant aux adhérents de consulter leur compte, télécharger leurs relevés et effectuer des opérations en ligne." },
  { category: "E-MA2E", q: "Combien coûte l'accès à E-MA2E ?", a: "L'abonnement est de 500 FCFA par mois, prélevé directement sur votre compte." },
  { category: "E-MA2E", q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur « Mot de passe oublié » sur la page de connexion, ou contactez le support à info@ma2e.ci." },
];

export const MEDIA_CATEGORIES = ["Formulaires", "Rapports annuels", "Statuts & règlements", "Brochures"] as const;
export type MediaCategory = typeof MEDIA_CATEGORIES[number];

export const MEDIA: { category: MediaCategory; title: string; desc: string; size: string; year: string; href?: string }[] = [  
  { category: "Formulaires", title: "Formulaire d'adhésion MA2E", desc: "Demande d'adhésion à la mutuelle.", size: "191 Ko", year: "2025", href: "/documents/formulaires/Formulaire_FICHE D'ADHESION E-MA2E.pdf" },
  { category: "Formulaires", title: "Demande d'épargne", desc: "Formulaire d'ouverture d'un compte épargne.", size: "60 Ko", year: "2025", href: "/documents/formulaires/Formulaire_DEMANDE D'EPARGNE.docx" },
  { category: "Formulaires", title: "Demande de crédit ordinaire", desc: "Dossier de demande pour un crédit ordinaire.", size: "190 Ko", year: "2026", href: "/documents/formulaires/Formulaire_DEMANDE DE CREDIT ORDINAIRE 2026.docx" },
  { category: "Formulaires", title: "Demande de crédit express", desc: "Dossier de demande pour un crédit express.", size: "140 Ko", year: "2025", href: "/documents/formulaires/Formulaire_DEMANDE DE CREDIT EXPRESS NOUVEAU.docx" },
  { category: "Formulaires", title: "Demande de souscription DAT", desc: "Dossier de demande pour un Dépôt à Terme.", size: "84 Ko", year: "2025", href: "/documents/formulaires/Formulaire_DEMANDE DE SOUSCRIPTION DATS.docx" },
  { category: "Rapports annuels", title: "Rapport annuel 2024", desc: "Bilan d'activité, états financiers et perspectives.", size: "6,4 Mo", year: "2024", href: "/documents/institutionnel/MA2E_Rapport_2024_22 Sept 2025.pdf" },
  { category: "Rapports annuels", title: "Rapport annuel 2023", desc: "Bilan d'activité de l'exercice 2023.", size: "3,8 Mo", year: "2023" },
  { category: "Statuts & règlements", title: "Statuts de la MA2E", desc: "Texte fondateur de la mutuelle, version consolidée.", size: "5,8 Mo", year: "2025", href: "/documents/institutionnel/STATUTS MODIFIE LE 26 JUIN 2025 ENREGISTRE.pdf" },
  { category: "Statuts & règlements", title: "Organigramme de la MA2E", desc: "Structure organisationnelle mise à jour.", size: "109 Ko", year: "2026", href: "/documents/institutionnel/Organigramme de la MA2E - MISE A JOUR LE 22-05-2026.pdf" },
  { category: "Brochures", title: "Brochure produits 2025", desc: "Présentation complète de l'offre MA2E.", size: "2,1 Mo", year: "2025" },
];

export const PARTNERS: { name: string; type: string; desc: string }[] = [
  { name: "BCEAO", type: "Tutelle", desc: "Banque Centrale des États de l'Afrique de l'Ouest — autorité monétaire régionale." },
  { name: "Ministère des Finances", type: "Tutelle", desc: "Tutelle administrative et financière des institutions de microfinance." },
  { name: "APSFD-CI", type: "Association professionnelle", desc: "Association Professionnelle des Systèmes Financiers Décentralisés de Côte d'Ivoire." },
  { name: "CNPS", type: "Partenaire", desc: "Caisse Nationale de Prévoyance Sociale — partenaire pour les retraites complémentaires." },
];
