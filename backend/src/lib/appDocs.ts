import fs from 'fs';
import path from 'path';

// Pièces justificatives des demandes (CNI, passeport, photo) : données personnelles
// SENSIBLES. Dossier PRIVÉ, jamais servi par l'express.static public de app.ts — l'accès
// passe par une URL signée (voir routes/applications.ts).
//
// La résolution du chemin vit ici, et non dans la route, parce que deux usages en ont
// besoin : la réception des pièces et leur SUPPRESSION lors de l'exercice du droit à
// l'effacement ou d'une purge de fin de conservation (voir lib/dcp.ts).
const PUBLIC_UPLOAD_DIR = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../../../public/documents/uploads');

export const APP_DOCS_DIR = process.env.APP_DOCS_DIR
  ? path.resolve(process.env.APP_DOCS_DIR)
  : path.resolve(PUBLIC_UPLOAD_DIR, '..', 'app-docs');

fs.mkdirSync(APP_DOCS_DIR, { recursive: true });

// Extrait les noms de fichiers des pièces attachées à une demande, depuis son champ `data`
// (forme { documents: { slot: { path: "/api/applications/documents/<uuid>.<ext>" } } }).
export function docFilesOf(data: unknown): string[] {
  const docs = data && typeof data === 'object' ? (data as Record<string, unknown>).documents : undefined;
  if (!docs || typeof docs !== 'object') return [];
  const names: string[] = [];
  for (const entry of Object.values(docs as Record<string, unknown>)) {
    const p = entry && typeof entry === 'object' ? (entry as { path?: unknown }).path : undefined;
    const m = typeof p === 'string' ? p.match(/\/api\/applications\/documents\/([A-Za-z0-9._-]+)$/) : null;
    if (m) names.push(m[1]);
  }
  return names;
}

// Supprime physiquement des pièces justificatives. Renvoie le nombre de fichiers réellement
// effacés : un fichier déjà absent n'est pas une erreur (purge rejouée, pièce déjà retirée).
export function removeDocFiles(names: string[]): number {
  let removed = 0;
  for (const name of names) {
    const full = path.join(APP_DOCS_DIR, name);
    // Garde-fou : jamais d'écriture hors du dossier privé, même si un chemin a été forgé.
    if (!full.startsWith(APP_DOCS_DIR + path.sep)) continue;
    try {
      fs.unlinkSync(full);
      removed++;
    } catch {
      /* fichier déjà absent → rien à faire */
    }
  }
  return removed;
}
