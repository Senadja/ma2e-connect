// Couleur de marque MA2E : conversion hex → HSL puis application aux variables CSS du thème.
// Le défaut (aucun réglage côté CMS) vit dans src/index.css ; ici on ne fait que le surcharger.

export const DEFAULT_BRAND_HEX = "#1C8243"; // vert MA2E (logo) calibré = hsl(143 64% 31%)

const THEME_VARS = ["--primary", "--primary-glow", "--primary-dark", "--ring"] as const;

export function hexToHsl(hex: string): { h: number; s: number; l: number } | null {
  const m = /^#?([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) return null;
  const int = parseInt(m[1], 16);
  const r = ((int >> 16) & 255) / 255;
  const g = ((int >> 8) & 255) / 255;
  const b = (int & 255) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Applique la couleur (+ nuances dérivées : halo plus clair, fond foncé). hex vide/invalide = retour au défaut CSS.
export function applyBrandColor(hex: string | null | undefined): void {
  const root = document.documentElement;
  const hsl = hex ? hexToHsl(hex) : null;
  if (!hsl) {
    THEME_VARS.forEach((v) => root.style.removeProperty(v));
    return;
  }
  const { h, s, l } = hsl;
  const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));
  root.style.setProperty("--primary", `${h} ${s}% ${l}%`);
  root.style.setProperty("--primary-glow", `${h} ${clamp(s + 4)}% ${clamp(l + 10)}%`);
  root.style.setProperty("--primary-dark", `${h} ${clamp(s - 6)}% ${clamp(l - 19, 8)}%`);
  root.style.setProperty("--ring", `${h} ${s}% ${l}%`);
}
