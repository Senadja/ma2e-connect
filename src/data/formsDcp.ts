// Mentions DCP affichées EN TÊTE des formulaires publics — exigences de la check-list de
// recette DCP SD_PDCP : mention d'information intitulée « Données Personnelles », rappel des
// champs obligatoires, cadrage des zones de commentaire libre, consentement et son retrait.
//
// ⚠️ SOURCE DES TROIS MENTIONS — NE PAS RÉÉCRIRE SANS SD_PDCP.
// Les textes de `bodies` et de `freeTextHint` sont la TRANSCRIPTION LITTÉRALE du retour
// SD_PDCP « MENTIONS D'INFORMATION_FORMULAIRES_e-MA2E »
// (DCP_Mention_dInformation_Formulaire_SiteInternetMA2E.docx, novembre 2026), reçu en réponse
// au prérequis R02. Seule modification apportée : l'adresse du correspondant DCP est remplacée
// par le gabarit {dcpEmail}, afin qu'elle ne puisse pas diverger du réglage « contact ».
// Ce sont des textes juridiques signés par le responsable de traitement : toute correction
// (y compris de style ou de typographie) relève de SD_PDCP, pas du prestataire.
//
// ⚠️ CONDITION DE MISE EN SERVICE — TRANSFERT HORS CEDEAO.
// Les mentions « adhesion » et « contact » affirment « Elles ne font pas l'objet de transfert
// hors espace CEDEAO. » Cette phrase décrit l'ARCHITECTURE CIBLE (hébergement repris par MA2E
// en zone CEDEAO), et non la plateforme de démonstration actuelle (site public sur Vercel, USA ;
// API et base sur un serveur OVH en France). Ces mentions ne sont rendues qu'à l'intérieur d'un
// formulaire OUVERT (cf. réglage « formsPublic ») : tant que les trois formulaires restent
// fermés, rien n'est affiché et rien n'est collecté. NE PAS RÉOUVRIR les formulaires sur
// l'hébergement de démonstration tant que la migration n'est pas faite, sans quoi cette phrase
// devient une déclaration inexacte aux personnes concernées (loi n° 2013-450).
// Voir aussi DCP_COOKIES.md § 5 : même après migration, le navigateur du visiteur contacte des
// services hors CEDEAO (widget de traduction, carte OSM) — arbitrage SD_PDCP en attente.
//
// Ces textes sont la source de REPLI : le back-office les édite (réglage « formsDcp »,
// onglet « Légal ») — aucun redéploiement n'est nécessaire pour les corriger.
// Les autres langues sont assurées par le widget Google Translate, comme le reste du site.

/** Formulaires publics collectant des données personnelles — une mention d'information par formulaire. */
export type DcpForm = "adhesion" | "contact" | "productRequest";

export interface FormsDcpFreeText {
  /** Phrase d'introduction affichée au-dessus d'une zone de commentaire libre. */
  intro: string;
  /** Consignes de minimisation, une par puce. */
  bullets: string[];
}

export interface FormsDcpContent {
  // Libellé de version du texte affiché. Il est enregistré avec CHAQUE consentement
  // comme preuve de la version acceptée : à modifier dès que le texte change.
  // ⚠️ Doit rester aligné avec FALLBACK dans backend/src/lib/consent.ts.
  version: string;
  title: string;
  /** Mention d'information propre à chaque formulaire (catégories, destinataires et durées diffèrent). */
  bodies: Record<DcpForm, string>;
  requiredNote: string;
  freeTextHint: FormsDcpFreeText;
  consentLabel: string;
  withdrawNote: string;
  // Version des TCU acceptées sur le formulaire d'adhésion (preuve de lecture).
  // Inchangée : SD_PDCP maintient les TCU en ligne (prérequis R01).
  tcuVersion: string;
}

export const DEFAULT_FORMS_DCP: FormsDcpContent = {
  version: "2026-11-10",
  title: "Données Personnelles",
  bodies: {
    // Mention d'information DCP_Formulaire d'adhésion
    adhesion:
      "Vos données personnelles (identité, professionnelles, vie personnelle, filiation, contact, financières, signature) sont collectées par les services habilités de la MA2E, aux seules fins de traiter votre demande d’adhésion en vue du prélèvement sur votre salaire du droit d’adhésion ainsi que de la libération de votre part sociale. Elles peuvent être communiquées aux autorités suivantes : la BCEAO, le BIC et la CENTIF-CI pour le respect de nos obligations légales. Vos données sont conservées pendant la durée de la relation contractuelle augmentée de 10 ans puis détruites. Elles ne font pas l'objet de transfert hors espace CEDEAO. Conformément à la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, vous pouvez exercer vos droits d’accès et de rectification sur vos données en contactant notre correspondant à la protection des données à l’adresse suivante : {dcpEmail}.",
    // Mention d'information DCP_Formulaire de contact
    contact:
      "Vos données personnelles (identification, contact, avis) sont collectées par la MA2E, aux seules fins de traiter votre demande et de vous faire un retour. Elles sont destinées aux seuls services habilités de la MA2E et ne sont ni cédées ni utilisées à d'autres fins. Elles sont conservées pendant douze (12) mois après le traitement de votre demande, puis supprimées. Vos données ne font pas l'objet de transfert hors espace CEDEAO. Conformément à la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, vous pouvez exercer vos droits d’accès et de rectification sur vos données en contactant notre correspondant à la protection des données à l’adresse suivante : {dcpEmail}.",
    // Mention d'information DCP_Formulaire de demande de renseignement
    productRequest:
      "Vos données personnelles (identification, professionnelle, contact, type de produit, financière, avis) sont collectées par la MA2E, aux seules fins de traiter votre demande. Elles sont destinées aux seuls services habilités de la MA2E ; et ne sont ni cédées ni utilisées à d'autres fins. Elles sont conservées pendant douze (12) mois après le traitement de votre demande, puis supprimées. Conformément à la loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, vous pouvez exercer vos droits d’accès et de rectification de vos données en contactant notre correspondant à la protection des données à l’adresse suivante : {dcpEmail}.",
  },
  requiredNote: "Les champs marqués d'un astérisque (*) sont obligatoires.",
  freeTextHint: {
    intro:
      "Veuillez faire preuve de vigilance dans les zones de texte libre (commentaires ouverts) tout au long du formulaire :",
    bullets: [
      "Ne mentionnez aucun nom : Ne citez personne. Usez de termes génériques si nécessaire tels que « l’équipe », « le service concerné ».",
      "Évitez les détails trop précis : Ne décrivez pas une situation spécifique ou une anecdote personnelle unique qui permettrait de vous reconnaître ou tout autre personne immédiatement à la lecture du commentaire.",
      "Évitez les données sensibles : N'évoquez pas d'éléments liés à la santé (arrêts maladies, fatigue médicale, …), à vos opinions politiques, religieuses, ou philosophiques, à vos appartenances syndicales, à votre vie sexuelle ou raciale, aux mesures d’ordre social, aux poursuites, aux sanctions pénales ou administratives.",
    ],
  },
  consentLabel:
    "J'accepte que mes données personnelles soient traitées par la MA2E pour répondre à ma demande.",
  withdrawNote:
    "Vous pouvez retirer ce consentement à tout moment via le formulaire de contact du site ou à l'adresse {dcpEmail}.",
  tcuVersion: "2026-10-20",
};
