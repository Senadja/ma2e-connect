// Traduction du site via le widget Google Website Translate (gratuit, sans clé API).
// Le rendu de base reste en français (i18next = langue source) ; Google traduit
// tout le DOM (interface + contenu dynamique chargé depuis l'API) vers la cible.
// Le widget est chargé dans index.html ; son UI native est masquée en CSS.

export type Lang = "fr" | "en" | "ar";
export const LANGS: Lang[] = ["fr", "en", "ar"];

// Lit la langue cible courante depuis le cookie googtrans (format : /fr/<cible>).
export function getCurrentLang(): Lang {
  if (typeof document === "undefined") return "fr";
  const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  const target = m?.[1] as Lang | undefined;
  return target && LANGS.includes(target) ? target : "fr";
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

// Aligne la direction (RTL pour l'arabe) et l'attribut lang du document.
export function applyDir(lang: Lang = getCurrentLang()) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
}

// Change la langue : écrit le cookie googtrans puis recharge (Google traduit au reload).
export function setLang(lang: Lang) {
  if (lang === getCurrentLang()) return;
  if (lang === "fr") {
    writeCookie("", true); // suppression → retour au français d'origine
  } else {
    writeCookie(`/fr/${lang}`);
  }
  applyDir(lang);
  location.reload();
}

// À l'import (chargement de l'app) : aligne dir/lang sur la langue courante.
applyDir();
