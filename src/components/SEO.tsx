import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

// Domaine public actuel. À changer ici (un seul endroit) quand MA2E passera sur ma2e.ci.
export const SITE_URL = "https://ma2e-connect.vercel.app";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  twitterHandle?: string;
  noindex?: boolean;
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

const DEFAULT_DESC =
  "La MA2E (Mutuelle des Agents de l'Eau et de l'Électricité) accompagne ses adhérents en Côte d'Ivoire : épargne rémunérée, crédits à taux préférentiels et accession à la propriété.";

export const SEO = ({
  title,
  description = DEFAULT_DESC,
  canonical,
  ogType = "website",
  ogImage = "/logo-ma2e.png",
  twitterHandle = "@ma2e_ci",
  noindex = false,
  jsonLd,
}: SEOProps) => {
  const { pathname } = useLocation();
  const siteName = "MA2E";
  const fullTitle = title
    ? `${title} | ${siteName}`
    : "MA2E — Mutuelle des Agents de l'Eau et de l'Électricité (Côte d'Ivoire)";
  const url = canonical || `${SITE_URL}${pathname}`;
  const img = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={img} />
      <meta property="og:locale" content="fr_FR" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {jsonLd && <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  );
};
