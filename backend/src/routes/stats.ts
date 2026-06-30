import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const statsRouter = Router();

// Valeurs de référence officielles MA2E (à valider avec le rapport annuel).
// Les comptages dynamiques s'ajoutent à ces bases.
const BASELINE = {
  adherents: 8430,
  produitsActifs: 9,
  anneesExperience: 14,
  mdsFcfa: 2.9,
};

statsRouter.get('/', async (_req, res) => {
  try {
    // 1) Si l'admin a défini des chiffres clés (réglage "stats"), on les sert tels quels.
    const setting = await prisma.setting.findUnique({ where: { key: 'stats' } });
    if (Array.isArray(setting?.value) && setting!.value.length > 0) {
      return res.json(setting!.value);
    }

    // 2) Sinon, valeurs de référence + comptages dynamiques.
    const [usersCount, productsCount] = await Promise.all([
      prisma.user.count({ where: { role: 'USER' } }),
      prisma.product.count({ where: { active: true } }),
    ]);

    res.json([
      { value: BASELINE.adherents + usersCount, label: 'Sociétaires', suffix: '' },
      {
        value: productsCount > 0 ? productsCount : BASELINE.produitsActifs,
        label: 'Produits actifs',
        suffix: '',
      },
      { value: BASELINE.anneesExperience, label: "Années d'expérience", suffix: '' },
      { value: BASELINE.mdsFcfa, label: 'Mds FCFA accordés', suffix: '' },
    ]);
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});
