import bcrypt from 'bcrypt';
import crypto from 'crypto';

// --- Politique de mot de passe locale ---------------------------------------
// Reproduit dans l'application ce qu'une stratégie de groupe (GPO) Active Directory
// imposerait au niveau du domaine : complexité, expiration, historique et verrouillage.
// Une seule source de vérité pour tous les points d'entrée (login, invitation,
// changement self-service, création par un administrateur).

export const PASSWORD_POLICY = {
  minLength: 12, // ANSSI recommande ≥ 12 (AD par défaut = 8)
  maxAgeDays: 42, // expiration : identique au défaut historique d'Active Directory
  historyDepth: 5, // nombre de mots de passe précédents interdits à la réutilisation
  lockThreshold: 5, // échecs de mot de passe consécutifs avant verrouillage du compte
  inviteTtlHours: 48, // durée de vie du lien d'invitation (première activation / reset admin)
  resetTtlMinutes: 30, // durée de vie du jeton de changement forcé (mot de passe expiré)
} as const;

const BCRYPT_ROUNDS = 10;

// Message unique décrivant l'exigence, réutilisé côté serveur ET affiché côté client.
export const PASSWORD_RULE_TEXT =
  'Le mot de passe doit contenir au moins 12 caractères, dont une majuscule, une minuscule, un chiffre et un caractère spécial.';

// Valide la complexité. Retourne un message d'erreur, ou null si le mot de passe est conforme.
export function validatePasswordComplexity(pw: string): string | null {
  if (pw.length < PASSWORD_POLICY.minLength) return PASSWORD_RULE_TEXT;
  if (!/[A-Z]/.test(pw)) return PASSWORD_RULE_TEXT;
  if (!/[a-z]/.test(pw)) return PASSWORD_RULE_TEXT;
  if (!/[0-9]/.test(pw)) return PASSWORD_RULE_TEXT;
  // « caractère spécial » = tout ce qui n'est ni lettre ASCII ni chiffre.
  if (!/[^A-Za-z0-9]/.test(pw)) return PASSWORD_RULE_TEXT;
  return null;
}

// Le mot de passe est-il expiré ? Un compte hérité (passwordChangedAt null) n'expire pas
// tant qu'il n'a pas été changé au moins une fois sous la nouvelle politique.
export function isPasswordExpired(passwordChangedAt: Date | null | undefined): boolean {
  if (!passwordChangedAt) return false;
  const ageMs = Date.now() - passwordChangedAt.getTime();
  return ageMs > PASSWORD_POLICY.maxAgeDays * 24 * 60 * 60 * 1000;
}

// Le nouveau mot de passe réutilise-t-il le mot de passe actuel ou l'un des précédents ?
// currentHash + history contiennent des empreintes bcrypt ; on compare une à une.
export async function isPasswordReused(
  newPassword: string,
  currentHash: string | null | undefined,
  history: string[]
): Promise<boolean> {
  const hashes = [currentHash, ...history].filter((h): h is string => !!h);
  for (const h of hashes) {
    if (await bcrypt.compare(newPassword, h)) return true;
  }
  return false;
}

// Construit le tableau d'historique mis à jour : on y verse l'ancien mot de passe courant
// puis on tronque aux N plus récents.
export function pushHistory(currentHash: string | null | undefined, history: string[]): string[] {
  const next = currentHash ? [currentHash, ...history] : [...history];
  return next.slice(0, PASSWORD_POLICY.historyDepth);
}

export function hashPassword(pw: string): Promise<string> {
  return bcrypt.hash(pw, BCRYPT_ROUNDS);
}

// Jeton à usage unique (invitation ou changement forcé) : la valeur brute part par e-mail /
// au navigateur, seule son empreinte bcrypt est stockée en base.
export async function createOneTimeToken(
  ttlMs: number
): Promise<{ raw: string; hash: string; expiresAt: Date }> {
  const raw = crypto.randomBytes(32).toString('hex');
  const hash = await bcrypt.hash(raw, BCRYPT_ROUNDS);
  const expiresAt = new Date(Date.now() + ttlMs);
  return { raw, hash, expiresAt };
}
