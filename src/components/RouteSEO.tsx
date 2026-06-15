import { useLocation } from "react-router-dom";
import { SEO } from "./SEO";

// SEO par route pour les pages publiques qui n'ont pas de balise <SEO> propre.
// Les pages dynamiques (épargne, crédits, article, adhésion) définissent leur
// propre SEO, qui prime (rendu plus profond dans l'arbre → Helmet le garde).
const MAP: Record<string, { title: string; description: string }> = {
  "/a-propos": {
    title: "À propos",
    description:
      "Découvrez la MA2E : histoire depuis 2006, mission mutualiste, gouvernance et équipe au service des agents de l'eau et de l'électricité de Côte d'Ivoire.",
  },
  "/produits": {
    title: "Nos produits",
    description:
      "Épargne rémunérée, crédits (scolaire, ordinaire, express, immobilier) et accession à la propriété : toutes les solutions de la mutuelle MA2E.",
  },
  "/produits/immobilier": {
    title: "Projet immobilier",
    description:
      "Accédez à la propriété avec le programme immobilier de la MA2E : villas et duplex, financement à taux préférentiel pour les agents de l'eau et de l'électricité.",
  },
  "/actualites": {
    title: "Actualités",
    description:
      "Communiqués, événements et offres de la MA2E : assemblées générales, agences, programme immobilier et nouveautés pour les sociétaires.",
  },
  "/contact": {
    title: "Contact",
    description:
      "Contactez la MA2E (Mutuelle des Agents de l'Eau et de l'Électricité) : adresse, téléphone, email et formulaire pour toutes vos demandes.",
  },
  "/faq": {
    title: "FAQ",
    description:
      "Questions fréquentes sur l'adhésion, l'épargne, les crédits, l'immobilier et l'espace E-MA2E de la mutuelle MA2E.",
  },
  "/mediatheque": {
    title: "Médiathèque",
    description:
      "Téléchargez les documents officiels de la MA2E : formulaires d'adhésion et de crédit, statuts, rapports annuels et communiqués.",
  },
  "/partenaires": {
    title: "Partenaires",
    description:
      "Les partenaires institutionnels de la MA2E : BCEAO, Ministère des Finances, CIE, SODECI, CNPS et l'APSFD-CI.",
  },
  "/mentions-legales": {
    title: "Mentions légales",
    description: "Mentions légales du site de la MA2E (Mutuelle des Agents de l'Eau et de l'Électricité).",
  },
  "/cgu": {
    title: "Conditions générales d'utilisation",
    description: "Conditions générales d'utilisation du site et des services en ligne de la MA2E.",
  },
  "/politique-dcp": {
    title: "Politique de protection des données",
    description: "Politique de confidentialité et de protection des données personnelles de la MA2E.",
  },
};

export const RouteSEO = () => {
  const { pathname } = useLocation();
  if (pathname.startsWith("/admin")) return <SEO noindex />;
  const entry = MAP[pathname];
  if (!entry) return null;
  return <SEO title={entry.title} description={entry.description} />;
};
