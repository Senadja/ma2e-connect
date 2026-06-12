// Intégration Matomo (analytics auto-hébergé, RGPD-friendly).
// Le tracking ne s'active QUE si l'URL et l'ID de site sont fournis
// (variables VITE_MATOMO_URL et VITE_MATOMO_SITE_ID). Sinon : no-op.
const MATOMO_URL = (import.meta.env.VITE_MATOMO_URL as string | undefined)?.replace(/\/$/, "");
const SITE_ID = import.meta.env.VITE_MATOMO_SITE_ID as string | undefined;

declare global {
  interface Window {
    _paq?: unknown[][];
  }
}

export const matomoEnabled = Boolean(MATOMO_URL && SITE_ID);

let initialized = false;

export function initMatomo() {
  if (!matomoEnabled || initialized || typeof window === "undefined") return;
  initialized = true;

  const _paq = (window._paq = window._paq || []);
  _paq.push(["enableLinkTracking"]);
  // Respect de la vie privée : anonymisation et respect du Do Not Track.
  _paq.push(["setDoNotTrack", true]);
  _paq.push(["setTrackerUrl", `${MATOMO_URL}/matomo.php`]);
  _paq.push(["setSiteId", SITE_ID as string]);

  const script = document.createElement("script");
  script.async = true;
  script.src = `${MATOMO_URL}/matomo.js`;
  document.head.appendChild(script);
}

export function trackPageView(path: string, title?: string) {
  if (!matomoEnabled || typeof window === "undefined" || !window._paq) return;
  window._paq.push(["setCustomUrl", path]);
  if (title) window._paq.push(["setDocumentTitle", title]);
  window._paq.push(["trackPageView"]);
}
