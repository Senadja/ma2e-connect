import type { RequestHandler } from 'express';
import { prisma } from './prisma';

// Ouverture des formulaires publics, pilotée au back-office (réglage « formsPublic » ;
// cf. src/data/formsPublic.ts pour les valeurs de repli du front et le contexte des deux lots).
//
// Le contrôle est fait ICI, côté serveur, et pas seulement à l'écran : masquer un formulaire
// dans le navigateur laisserait son API ouverte, donc la fermeture contournable — c'est la
// même raison qui fait exiger le consentement côté serveur (cf. lib/consent).

export type PublicForm = 'adhesion' | 'productRequest' | 'contact';

export const FORM_CLOSED_MESSAGE = "Ce formulaire n'est pas disponible actuellement.";

// 403 et non 503 : il ne s'agit pas d'une panne mais d'un refus par configuration, voulu et
// durable le temps du lot. Un 503 inviterait les clients et les sondes à réessayer.
export const FORM_CLOSED_STATUS = 403;

// Ouvert par défaut : réglage absent, clé inconnue ou lecture en échec → le formulaire reste
// ouvert, ce qui préserve le comportement d'origine du site. Seul un `false` explicitement
// enregistré ferme un formulaire.
export async function isFormOpen(form: PublicForm): Promise<boolean> {
  const row = await prisma.setting.findUnique({ where: { key: 'formsPublic' } }).catch(() => null);
  const stored = (row?.value ?? {}) as Record<string, unknown>;
  return stored[form] !== false;
}

// Pour les routes dont le formulaire est connu d'avance (contact, dépôt de pièces).
// Le refus intervient AVANT la lecture du corps de la requête : un dépôt de pièce
// d'identité fermé ne doit pas être reçu en mémoire avant d'être rejeté.
export function requireFormOpen(form: PublicForm): RequestHandler {
  return async (_req, res, next) => {
    if (await isFormOpen(form)) return next();
    res.status(FORM_CLOSED_STATUS).json({ error: FORM_CLOSED_MESSAGE });
  };
}
