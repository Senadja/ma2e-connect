// Permissions fines du back-office MA2E.
export const PERMISSIONS = [
  'news:write',
  'products:write',
  'faq:write',
  'media:write',
  'applications:manage',
  'settings:write',
  'users:manage',
  'partners:write',
  'team:write',
  'contact:manage',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

// Profils prédéfinis (presets) proposés dans l'interface de gestion des utilisateurs.
export const PROFILES: Record<string, { label: string; permissions: Permission[] }> = {
  admin: { label: 'Administrateur', permissions: [...PERMISSIONS] },
  redacteur: { label: 'Rédacteur', permissions: ['news:write', 'faq:write'] },
  communication: {
    label: 'Communication',
    permissions: ['news:write', 'faq:write', 'media:write', 'partners:write', 'team:write', 'contact:manage'],
  },
  produits: { label: 'Gestionnaire produits', permissions: ['products:write'] },
  demandes: { label: 'Gestionnaire des demandes', permissions: ['applications:manage', 'contact:manage'] },
  mediatheque: { label: 'Gestionnaire médiathèque', permissions: ['media:write'] },
};
