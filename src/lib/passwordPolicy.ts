// Miroir côté client de la politique de mot de passe du serveur (source de vérité).
// Sert uniquement à donner un retour immédiat à la saisie ; le backend revalide toujours.

export const PASSWORD_RULE_TEXT =
  'Au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.';

// Retourne un message d'erreur, ou null si le mot de passe respecte la politique.
export function validatePasswordClient(pw: string): string | null {
  if (
    pw.length < 12 ||
    !/[A-Z]/.test(pw) ||
    !/[a-z]/.test(pw) ||
    !/[0-9]/.test(pw) ||
    !/[^A-Za-z0-9]/.test(pw)
  ) {
    return PASSWORD_RULE_TEXT;
  }
  return null;
}
