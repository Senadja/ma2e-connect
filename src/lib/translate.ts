// Traduction du site via le widget Google Website Translate (gratuit, sans clé API).
// Le rendu de base reste en français (i18next = langue source) ; Google traduit
// tout le DOM (interface + contenu dynamique chargé depuis l'API) vers la cible.
// La liste des langues proposées est gérée par l'admin via le CMS (réglage « languages »).

export type Language = { code: string; label: string };

// Langue source (toujours présente, non supprimable) = celle du rendu.
export const BASE_LANG = "fr";

// Langues affichées par défaut tant que le CMS n'en définit pas.
export const DEFAULT_LANGUAGES: Language[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
];

// Catalogue proposé à l'admin dans le CMS (codes Google Translate valides).
export const LANGUAGE_PRESETS: Language[] = [
  { code: "fr", label: "Français" },
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "ar", label: "العربية" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "nl", label: "Nederlands" },
  { code: "ru", label: "Русский" },
  { code: "tr", label: "Türkçe" },
  { code: "zh-CN", label: "中文 (简体)" },
  { code: "ja", label: "日本語" },
];

// Langues à écriture droite-à-gauche → on bascule dir="rtl".
const RTL_CODES = new Set(["ar", "he", "fa", "ur", "ps", "sd"]);

// Langue cible courante (code) lue dans le cookie googtrans (format : /fr/<cible>).
export function getCurrentLang(): string {
  if (typeof document === "undefined") return BASE_LANG;
  const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  return m?.[1] || BASE_LANG;
}

// Écrit (ou supprime) le cookie googtrans sur toutes les variantes de domaine utiles.
function writeCookie(value: string, remove = false) {
  if (typeof document === "undefined") return;
  const host = location.hostname;
  const exp = remove ? ";expires=Thu, 01 Jan 1970 00:00:00 GMT" : "";
  const base = `googtrans=${value};path=/${exp}`;
  document.cookie = base;
  document.cookie = `${base};domain=${host}`;
  const apex = host.split(".").slice(-2).join("."); // ex. ma2e.ci pour les sous-domaines
  if (apex !== host) document.cookie = `${base};domain=.${apex}`;
}

// Aligne l'attribut lang et la direction (RTL pour ar/he/…) du document.
export function applyDir(code: string = getCurrentLang()) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = code;
  document.documentElement.dir = RTL_CODES.has(code) ? "rtl" : "ltr";
}

// Change la langue : écrit le cookie googtrans puis recharge (Google traduit au reload).
export function setLang(code: string) {
  if (code === getCurrentLang()) return;
  if (code === BASE_LANG) {
    writeCookie("", true); // suppression → retour à la langue source
  } else {
    writeCookie(`/${BASE_LANG}/${code}`);
  }
  applyDir(code);
  location.reload();
}

// Au chargement : aligne dir/lang sur la langue courante.
applyDir();
