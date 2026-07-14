// Contenu des pages légales (Mentions légales / CGU / Protection des données).
// Source de repli ET contenu initial du CMS : le back-office édite `settings.legal`
// (onglet « Légal »). Le texte est en français ; les autres langues sont assurées
// par le widget Google Translate (comme le reste du contenu du site).
//
// Format d'un `body` : paragraphes séparés par une ligne vide. Une suite de lignes
// commençant par « - » devient une liste à puces. Les e-mails et liens http(s)
// sont transformés en liens automatiquement au rendu.

export interface LegalSection {
  heading: string;
  body: string;
}
export interface LegalPage {
  title: string;
  subtitle?: string;
  intro?: string; // encadré mis en avant en tête de page (optionnel)
  sections: LegalSection[];
}
export interface LegalContent {
  mentions: LegalPage;
  cgu: LegalPage;
  dcp: LegalPage;
}

export const DEFAULT_LEGAL: LegalContent = {
  mentions: {
    title: "Mentions légales",
    sections: [
      {
        heading: "Éditeur du site",
        body:
          "Le site www.ma2e.ci est édité par la Mutuelle des Agents de l'Eau et de l'Électricité (MA2E), institution de microfinance agréée par le Ministère des Finances de Côte d'Ivoire.\n\n" +
          "- Siège social : Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, Abidjan\n" +
          "- Adresse postale : 18 BP 1210 Abidjan 18\n" +
          "- Téléphone : (+225) 27 21 23 64 87\n" +
          "- Email : contact@ma2e.ci\n" +
          "- Directeur de la publication : Le Directeur Général de la MA2E",
      },
      {
        heading: "Hébergement",
        body: "Ce site est hébergé sur une infrastructure cloud sécurisée localisée en Europe, conforme aux standards de sécurité en vigueur (chiffrement TLS, sauvegardes régulières, supervision 24/7).",
      },
      {
        heading: "Propriété intellectuelle",
        body: "L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes, vidéos, code source) est protégé par le droit d'auteur et reste la propriété exclusive de la MA2E ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est strictement interdite.",
      },
      {
        heading: "Liens hypertextes",
        body: "Le site peut contenir des liens vers des sites tiers. La MA2E n'exerce aucun contrôle sur ces sites et ne saurait être tenue responsable de leur contenu ou de leurs pratiques en matière de protection des données.",
      },
      {
        heading: "Contact",
        body: "Pour toute question relative aux présentes mentions légales, vous pouvez nous écrire à contact@ma2e.ci",
      },
    ],
  },
  cgu: {
    title: "Conditions générales d'utilisation",
    sections: [
      {
        heading: "1. Objet",
        body: "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site institutionnel de la MA2E ainsi que de la plateforme E-MA2E réservée aux sociétaires.",
      },
      {
        heading: "2. Acceptation des conditions",
        body: "L'accès au site implique l'acceptation pleine et entière des présentes CGU. La MA2E se réserve le droit de modifier les CGU à tout moment ; il appartient à l'utilisateur de les consulter régulièrement.",
      },
      {
        heading: "3. Accès au service",
        body: "Le site institutionnel est accessible librement à toute personne disposant d'un accès à Internet. L'accès à la plateforme E-MA2E est réservé aux sociétaires, après authentification, et soumis à un abonnement de 500 FCFA par mois.",
      },
      {
        heading: "4. Obligations de l'utilisateur",
        body:
          "L'utilisateur s'engage à :\n\n" +
          "- fournir des informations exactes et à jour ;\n" +
          "- préserver la confidentialité de ses identifiants ;\n" +
          "- ne pas porter atteinte au bon fonctionnement du site ;\n" +
          "- respecter les droits des tiers et la législation en vigueur.",
      },
      {
        heading: "5. Responsabilité",
        body: "La MA2E met tout en œuvre pour assurer la disponibilité et la fiabilité du site, sans toutefois pouvoir garantir une accessibilité permanente. Sa responsabilité ne saurait être engagée en cas d'interruption, de bug ou d'utilisation détournée du service.",
      },
      {
        heading: "6. Droit applicable",
        body: "Les présentes CGU sont soumises au droit ivoirien. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux d'Abidjan.",
      },
    ],
  },
  dcp: {
    title: "Politique de protection des données",
    subtitle: "Engagement MA2E pour la protection de vos données personnelles.",
    intro: "La MA2E s'engage à respecter la confidentialité, l'intégrité et la sécurité des données personnelles de ses sociétaires et visiteurs, conformément à la loi n° 2013-450 relative à la protection des données à caractère personnel en Côte d'Ivoire.",
    sections: [
      {
        heading: "Données collectées",
        body:
          "- Données d'identification : nom, prénom, date de naissance, numéro de sociétaire ;\n" +
          "- Coordonnées : adresse postale, email, téléphone ;\n" +
          "- Données financières strictement nécessaires aux opérations ;\n" +
          "- Données de connexion (logs techniques anonymisés).",
      },
      {
        heading: "Finalités",
        body:
          "Vos données sont traitées pour :\n\n" +
          "- la gestion de votre adhésion et de vos opérations ;\n" +
          "- l'envoi d'informations institutionnelles ;\n" +
          "- le respect de nos obligations légales et réglementaires ;\n" +
          "- l'amélioration de nos services et de la sécurité du site.",
      },
      {
        heading: "Conservation",
        body: "Les données sont conservées pour la durée nécessaire aux finalités mentionnées, et au plus 10 ans après la fin de la relation d'adhésion, conformément aux obligations légales.",
      },
      {
        heading: "Vos droits",
        body: "Vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition, de limitation et de portabilité de vos données. Pour exercer ces droits, contactez notre Délégué à la Protection des Données : privacyMA2E@ma2e.ci",
      },
      {
        heading: "Cookies",
        body: "Le site utilise des cookies essentiels au fonctionnement et, sous réserve de votre consentement, des cookies de mesure d'audience. Vous pouvez gérer vos préférences à tout moment depuis le bandeau dédié.",
      },
    ],
  },
};
