// Vérification i18n : ouvre chaque page en anglais et détecte toute "chrome" française restante.
// Usage : node e2e/check-i18n.mjs  (la stack doit tourner sur http://localhost:8080)
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:8080";

const ROUTES = [
  "/", "/adhesion", "/a-propos", "/produits", "/produits/epargne", "/produits/credits",
  "/produits/immobilier", "/actualites", "/actualites/nouvelle-agence-a-yamoussoukro",
  "/faq", "/mediatheque", "/partenaires", "/contact", "/espace-ema2e",
  "/mentions-legales", "/cgu", "/politique-dcp",
];

// Phrases de "chrome" (interface) qui DOIVENT disparaître en anglais.
// (Volontairement des expressions multi-mots distinctives, pas du contenu de données.)
const FR_CHROME = [
  "Nos solutions", "Découvrir nos produits", "Devenir adhérent", "En savoir plus sur la MA2E",
  "Pourquoi nous choisir", "Dernières actualités", "Lire la suite", "Voir toutes les actualités",
  "Notre histoire", "Notre mission", "Trois engagements", "Organes de gouvernance",
  "Une gouvernance structurée", "Nos résultats en chiffres", "Vision du fondateur",
  "Nos produits & services", "Caractéristiques principales", "Conditions d'accès",
  "Besoin d'aide", "Documents utiles", "Comparatif rapide", "Simulateur de crédit",
  "Formulaire de demande", "Faire une demande", "Types de logements", "Un programme structuré",
  "Questions fréquentes", "Rechercher une question",
  "Contactez-nous", "Envoyez-nous un message", "Coordonnées", "Envoyer le message",
  "Demande de renseignements", "Envoyer ma demande", "Produit souhaité",
  "Pourquoi adhérer", "Documents requis", "Finaliser ma demande", "Téléverser vos documents",
  "Dossier d'adhésion", "Devenir adhérent",
  "Mentions légales", "Conditions générales d'utilisation", "Propriété intellectuelle",
  "Données collectées", "Politique de protection des données",
  "Être informé du lancement", "Espace E-MA2E",
  // pages probablement non traduites :
  "Actualités & événements", "Rechercher un article", "À la une", "Articles liés",
  "Retour aux actualités", "Toutes les actualités",
  "Rechercher un document", "Bientôt disponible",
  "Partenaires & tutelles",
];

const run = async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  // Force la langue EN avant tout chargement.
  await ctx.addInitScript(() => localStorage.setItem("ma2e-lang", "en"));
  const page = await ctx.newPage();

  let totalIssues = 0;
  const report = [];

  // Sanity : la home doit afficher une chaîne EN connue.
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const homeText = await page.locator("body").innerText();
  const enActive = homeText.includes("Discover our products") || homeText.includes("Our solutions");
  console.log(enActive ? "✓ Mode EN actif (home)" : "✗ EN NON actif — le test n'est pas fiable");

  // Attributs (placeholders, aria-label, title, alt) susceptibles de rester en FR.
  const FR_ATTRS = [
    "Filtrer par catégorie", "Flux RSS", "Partager sur Facebook", "Partager sur X",
    "Partager sur LinkedIn", "Copier le lien", "Choix de la langue", "Ouvrir le menu",
    "Fermer le menu", "Réseau social", "Localisation MA2E", "Fil d'Ariane",
    "Rechercher un document", "Rechercher un article", "Rechercher une question",
    "Rechercher dans", "Télécharger ", "Effacer la recherche",
  ];

  for (const route of ROUTES) {
    await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(300);
    const text = await page.locator("body").innerText();
    const attrs = (
      await page.$$eval("[placeholder],[aria-label],[title],[alt]", (els) =>
        els.flatMap((e) => [
          e.getAttribute("placeholder"),
          e.getAttribute("aria-label"),
          e.getAttribute("title"),
          e.getAttribute("alt"),
        ])
      )
    ).filter(Boolean).join(" || ");

    const found = FR_CHROME.filter((p) => text.includes(p));
    const foundAttrs = FR_ATTRS.filter((p) => attrs.includes(p));
    if (found.length || foundAttrs.length) {
      totalIssues += found.length + foundAttrs.length;
      report.push({ route, found, foundAttrs });
      console.log(`\n✗ ${route}`);
      found.forEach((f) => console.log(`    – [texte] "${f}"`));
      foundAttrs.forEach((f) => console.log(`    – [attribut] "${f}"`));
    } else {
      console.log(`✓ ${route}`);
    }
  }

  console.log(`\n──────────────────────────────`);
  console.log(totalIssues === 0
    ? "✅ Aucune chrome française détectée en mode EN."
    : `⚠ ${totalIssues} occurrence(s) FR sur ${report.length} page(s) à traduire.`);

  await browser.close();
  process.exit(totalIssues === 0 ? 0 : 1);
};

run().catch((e) => { console.error(e); process.exit(2); });
