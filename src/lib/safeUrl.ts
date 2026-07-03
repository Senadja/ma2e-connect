// Garde anti-XSS pour les URLs pilotées par le CMS (liens de settings, partenaires, splash…).
// Renvoie l'URL uniquement si son schéma est http(s) ou s'il s'agit d'un chemin interne (« / »),
// sinon undefined. Neutralise les schémas dangereux (javascript:, data:, vbscript:…) qui,
// injectés dans un href rendu par React, s'exécutent au clic (XSS stockée via le back-office).
export function safeHref(url?: string | null): string | undefined {
  if (!url) return undefined;
  const u = url.trim();
  if (!u) return undefined;
  if (u.startsWith("/") && !u.startsWith("//")) return u; // chemin relatif interne
  try {
    const protocol = new URL(u).protocol;
    return protocol === "http:" || protocol === "https:" ? u : undefined;
  } catch {
    return undefined;
  }
}

// Vrai si l'URL est un lien externe absolu (http/https) → pour décider target="_blank".
export function isExternalHref(url?: string | null): boolean {
  return !!url && /^https?:\/\//i.test(url.trim());
}
