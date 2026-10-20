// Mentions DCP affichées EN TÊTE des formulaires publics (Adhésion, Contact,
// Demande de renseignements) — exigences de la check-list de recette DCP SD_PDCP :
// mention d'information intitulée « Données Personnelles », rappel des champs
// obligatoires, cadrage des zones de commentaire libre, consentement et son retrait.
//
// Ces textes sont la source de REPLI : le back-office les édite (réglage « formsDcp »,
// onglet « Légal »). Quand SD_PDCP transmettra le texte définitif, il suffira de le
// coller dans le back-office — aucun redéploiement n'est nécessaire.
//
// `{dcpEmail}` est remplacé au rendu par l'adresse DCP du réglage « contact ».
// Les autres langues sont assurées par le widget Google Translate, comme le reste du site.

export interface FormsDcpContent {
  // Libellé de version du texte affiché. Il est enregistré avec CHAQUE consentement
  // comme preuve de la version acceptée : à modifier dès que le texte change.
  version: string;
  title: string;
  body: string;
  requiredNote: string;
  freeTextHint: string;
  consentLabel: string;
  withdrawNote: string;
  // Version des TCU acceptées sur le formulaire d'adhésion (preuve de lecture).
  tcuVersion: string;
}

export const DEFAULT_FORMS_DCP: FormsDcpContent = {
  version: "2026-10-20",
  title: "Données Personnelles",
  body:
    "Les informations recueillies dans ce formulaire sont collectées par la MA2E (Mutuelle des Agents de l'Eau et de l'Électricité), responsable du traitement, aux seules fins d'instruire et de traiter votre demande.\n\n" +
    "Les champs demandés sont limités aux informations nécessaires à ce traitement. Vos données sont destinées aux seuls services habilités de la MA2E ; elles ne sont ni cédées ni utilisées à d'autres fins. Elles sont conservées le temps nécessaire au traitement de votre demande et au respect des obligations légales applicables.\n\n" +
    "Conformément à la loi ivoirienne n° 2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel, vous disposez d'un droit d'accès, de rectification, d'effacement, d'opposition et de portabilité de vos données. Pour exercer ces droits, écrivez à {dcpEmail}.",
  requiredNote: "Les champs marqués d'un astérisque (*) sont obligatoires.",
  freeTextHint:
    "Limitez ce commentaire aux informations utiles au traitement de votre demande. N'y saisissez aucune donnée sensible (santé, religion, opinions politiques, appartenance syndicale, origine, vie sexuelle), ni information concernant un tiers.",
  consentLabel:
    "J'accepte que mes données personnelles soient traitées par la MA2E pour répondre à ma demande.",
  withdrawNote:
    "Vous pouvez retirer ce consentement à tout moment via le formulaire de contact du site ou à l'adresse {dcpEmail}.",
  tcuVersion: "2026-10-20",
};
