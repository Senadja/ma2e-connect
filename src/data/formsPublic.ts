// Ouverture des formulaires publics — pilotée au back-office (réglage « formsPublic »,
// onglet « Interactions »). Chaque formulaire s'ouvre et se ferme sans redéploiement.
//
// C'est le mécanisme du déploiement en deux lots demandé par MA2E : le site institutionnel
// est mis en ligne d'abord, les formulaires collectant des DCP sont ouverts ensuite, au
// rythme décidé par le client.
//
// Ces valeurs sont la source de REPLI, et elles ouvrent tout : un réglage absent ne doit
// jamais fermer un formulaire. La fermeture est toujours un acte explicite du back-office.
//
// Le serveur applique la MÊME règle (backend/src/lib/formsPublic.ts) : fermer un formulaire
// ferme aussi l'API correspondante. Masquer seulement le formulaire à l'écran laisserait
// l'API ouverte, donc la fermeture contournable.

export interface FormsPublicContent {
  /** Formulaire d'adhésion en ligne, y compris le dépôt des pièces d'identité.
   *  Fermé, la page /adhesion devient un guide (AdhesionGuide) : fiche officielle à
   *  télécharger et informations à préparer, sans qu'aucune donnée ne soit saisie. */
  adhesion: boolean;
  /** Demandes de produit ou de service (pages Épargne, Crédits, Immobilier). */
  productRequest: boolean;
  /** Formulaire de contact (la page Contact et ses coordonnées restent affichées). */
  contact: boolean;
  /** Texte affiché à la place d'un formulaire fermé. Les paragraphes sont séparés par une ligne vide. */
  closedNotice: string;
}

export const DEFAULT_FORMS_PUBLIC: FormsPublicContent = {
  adhesion: true,
  productRequest: true,
  contact: true,
  closedNotice:
    "Ce formulaire n'est pas encore disponible en ligne.\n\n" +
    "Pour toute demande, vous pouvez joindre la MA2E par téléphone ou par courriel : " +
    "les coordonnées figurent sur la page Contact.",
};
