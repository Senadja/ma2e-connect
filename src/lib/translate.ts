// Traduction du site via le widget Google Website Translate (gratuit, sans clé API).
// Le rendu de base reste en français (i18next = langue source) ; Google traduit
// tout le DOM (interface + contenu dynamique chargé depuis l'API) vers la cible.
// Le widget est chargé dans index.html ; son UI native est masquée en CSS.

export type Lang = "fr" | "en";
export const LANGS: Lang[] = ["fr", "en"];

// Cible brute lue dans le cookie googtrans (format : /fr/<cible>), ou null.
function rawTarget(): string | null {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
  return m?.[1] ?? null;
}

// Langue cible courante (seules fr/en sont proposées).
export function getCurrentLang(): Lang {
  return rawTarget() === "en" ? "en" : "fr";
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

// Aligne l'attribut lang du document (le site est en LTR uniquement).
export function applyLangAttr(lang: Lang = getCurrentLang()) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang;
}

// Change la langue : écrit le cookie googtrans puis recharge (Google traduit au reload).
export function setLang(lang: Lang) {
  if (lang === getCurrentLang()) return;
  if (lang === "fr") {
    writeCookie("", true); // suppression → retour au français d'origine
  } else {
    writeCookie(`/fr/${lang}`);
  }
  applyLangAttr(lang);
  location.reload();
}

// Au chargement : nettoie un ancien cookie pointant vers une langue non proposée
// (ex. arabe retiré) pour ne pas rester bloqué dans cette langue. Garde-fou anti-boucle.
(function normalize() {
  if (typeof document === "undefined") return;
  const t = rawTarget();
  if (t && t !== "en") {
    const HEAL = "ma2e-trans-heal";
    if (!sessionStorage.getItem(HEAL)) {
      sessionStorage.setItem(HEAL, "1");
      writeCookie("", true);
      location.reload();
      return;
    }
  }
  document.documentElement.dir = "ltr";
  applyLangAttr();
})();
