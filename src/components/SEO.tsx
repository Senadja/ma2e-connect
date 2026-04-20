import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: "website" | "article";
  ogImage?: string;
  twitterHandle?: string;
}

export const SEO = ({
  title,
  description = "La MA2E (Mutuelle des Agents de l'Eau et de l'Électricité) accompagne ses adhérents dans leurs projets d'épargne, de crédit et d'accession à la propriété en Côte d'Ivoire.",
  canonical = "https://www.ma2e.ci",
  ogType = "website",
  ogImage = "/og-image.jpg",
  twitterHandle = "@ma2e_ci",
}: SEOProps) => {
  const siteName = "MA2E";
  const fullTitle = title ? `${title} | ${siteName}` : `${siteName} — Votre mutuelle, votre avenir`;

  return (
    <Helmet>
      {/* Basic metadata */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph */}
      <meta property="og:site_name" content={siteName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
