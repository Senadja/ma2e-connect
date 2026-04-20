export const FAQ_CATEGORIES = ["Adhésion", "Épargne", "Crédit", "Immobilier", "E-MA2E"] as const;
export type FaqCategory = typeof FAQ_CATEGORIES[number];

export const FAQS: { category: FaqCategory; q: string; a: string }[] = [
  { category: "Adhésion", q: "Qui peut devenir adhérent de la MA2E ?", a: "Tout agent en activité ou retraité des sociétés du secteur de l'eau et de l'électricité (CIE, SODECI, et structures affiliées) peut devenir adhérent." },
  { category: "Adhésion", q: "Quels sont les frais d'adhésion ?", a: "L'adhésion comprend un droit unique de 5 000 FCFA et la souscription à au moins une part sociale. Les détails sont disponibles en agence." },
  { category: "Adhésion", q: "Comment soumettre ma demande d'adhésion ?", a: "Téléchargez le formulaire dans la médiathèque, complétez-le et déposez-le en agence avec les pièces justificatives demandées." },
  { category: "Épargne", q: "Quels sont les types d'épargne proposés ?", a: "La MA2E propose 5 formules : Épargne Expresse, Ordinaire, Logement, Dépôt à terme simple et DAT à versements progressifs." },
  { category: "Épargne", q: "Mon épargne est-elle disponible à tout moment ?", a: "Cela dépend de la formule choisie. L'Épargne Expresse est disponible à tout moment, alors que les DAT sont bloqués sur la durée contractuelle." },
  { category: "Épargne", q: "Quel est le rendement de l'épargne logement ?", a: "Le taux varie selon la durée. Une bonification est appliquée si l'épargne sert à un projet immobilier MA2E." },
  { category: "Crédit", q: "Quelles sont les conditions pour obtenir un crédit ?", a: "Être adhérent depuis au moins 6 mois, être à jour de ses cotisations et présenter un dossier complet (justificatifs de revenus, projet, garanties)." },
  { category: "Crédit", q: "Quel est le délai de traitement d'un dossier ?", a: "Crédit Expresse : 48h. Crédit Ordinaire : 7 jours ouvrés. Crédit Immobilier : 15 à 30 jours selon complexité du dossier." },
  { category: "Crédit", q: "Puis-je rembourser par anticipation ?", a: "Oui, le remboursement anticipé est possible sans pénalité sur la plupart de nos formules." },
  { category: "Immobilier", q: "Qui peut bénéficier du programme immobilier ?", a: "Tout adhérent à jour, justifiant d'une ancienneté de 24 mois minimum." },
  { category: "Immobilier", q: "Quel est l'apport personnel requis ?", a: "10% du coût total du logement, qui peut être couvert par votre épargne logement." },
  { category: "Immobilier", q: "Les logements sont-ils livrés clés en main ?", a: "Oui, tous nos logements sont livrés finis et raccordés aux réseaux." },
  { category: "E-MA2E", q: "Qu'est-ce que la plateforme E-MA2E ?", a: "E-MA2E est l'espace digital permettant aux adhérents de consulter leur compte, télécharger leurs relevés et effectuer des opérations en ligne." },
  { category: "E-MA2E", q: "Combien coûte l'accès à E-MA2E ?", a: "L'abonnement est de 500 FCFA par mois, prélevé directement sur votre compte." },
  { category: "E-MA2E", q: "J'ai oublié mon mot de passe, que faire ?", a: "Cliquez sur « Mot de passe oublié » sur la page de connexion, ou contactez le support à contact@ma2e.ci." },
];

export const MEDIA_CATEGORIES = ["Formulaires", "Rapports annuels", "Statuts & règlements", "Brochures"] as const;
export type MediaCategory = typeof MEDIA_CATEGORIES[number];

export const MEDIA: { category: MediaCategory; title: string; desc: string; size: string; year: string }[] = [
  { category: "Formulaires", title: "Formulaire d'adhésion MA2E", desc: "Demande d'adhésion à la mutuelle (PDF à compléter et déposer en agence).", size: "180 Ko", year: "2025" },
  { category: "Formulaires", title: "Demande d'épargne logement", desc: "Formulaire d'ouverture d'un compte épargne logement.", size: "210 Ko", year: "2025" },
  { category: "Formulaires", title: "Demande de crédit ordinaire", desc: "Dossier de demande pour un crédit ordinaire.", size: "240 Ko", year: "2025" },
  { category: "Formulaires", title: "Demande de crédit immobilier", desc: "Dossier complet pour un projet immobilier MA2E.", size: "320 Ko", year: "2025" },
  { category: "Rapports annuels", title: "Rapport annuel 2024", desc: "Bilan d'activité, états financiers et perspectives.", size: "4,2 Mo", year: "2024" },
  { category: "Rapports annuels", title: "Rapport annuel 2023", desc: "Bilan d'activité de l'exercice 2023.", size: "3,8 Mo", year: "2023" },
  { category: "Rapports annuels", title: "Rapport annuel 2022", desc: "Bilan d'activité de l'exercice 2022.", size: "3,5 Mo", year: "2022" },
  { category: "Statuts & règlements", title: "Statuts de la MA2E", desc: "Texte fondateur de la mutuelle, version consolidée.", size: "560 Ko", year: "2024" },
  { category: "Statuts & règlements", title: "Règlement intérieur", desc: "Règles de fonctionnement et droits des adhérents.", size: "420 Ko", year: "2024" },
  { category: "Brochures", title: "Brochure produits 2025", desc: "Présentation complète de l'offre MA2E.", size: "2,1 Mo", year: "2025" },
  { category: "Brochures", title: "Programme immobilier — Plaquette", desc: "Présentation du programme immobilier et des typologies de logements.", size: "5,4 Mo", year: "2025" },
];

export const PARTNERS: { name: string; type: string; desc: string }[] = [
  { name: "BCEAO", type: "Tutelle", desc: "Banque Centrale des États de l'Afrique de l'Ouest — autorité monétaire régionale." },
  { name: "Ministère des Finances", type: "Tutelle", desc: "Tutelle administrative et financière des institutions de microfinance." },
  { name: "APSFD-CI", type: "Association professionnelle", desc: "Association Professionnelle des Systèmes Financiers Décentralisés de Côte d'Ivoire." },
  { name: "CIE", type: "Partenaire institutionnel", desc: "Compagnie Ivoirienne d'Électricité — partenaire historique." },
  { name: "SODECI", type: "Partenaire institutionnel", desc: "Société de Distribution d'Eau de la Côte d'Ivoire — partenaire historique." },
  { name: "CNPS", type: "Partenaire", desc: "Caisse Nationale de Prévoyance Sociale — partenaire pour les retraites complémentaires." },
];
