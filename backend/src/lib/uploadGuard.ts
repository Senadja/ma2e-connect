import fs from 'fs';

// Validation du CONTENU réel d'un fichier téléversé (« magic bytes »), et non de son
// extension déclarée par le client — laquelle est trivialement falsifiable.
//
// Historique : ce contrôle existait déjà sur `routes/applications.ts` (pièces justificatives
// des candidats, remédiation du pentest GS2E #4). L'audit manuel du 2026-11-13 a montré que
// les DEUX autres points d'upload — `POST /api/media` et `POST /api/uploads` — ne validaient
// que l'extension. Ce module centralise les signatures pour les trois routes.
//
// Pourquoi ça compte : `/api/media` et `/api/uploads` alimentent la médiathèque PUBLIQUE
// (`GET /api/media` sert les entrées publiées sans authentification). Un document piégé
// déposé par un compte habilité serait donc distribué aux sociétaires par le site de la MA2E.
//
// ⚠️ La lecture porte sur les 16 PREMIERS OCTETS (et non 8 comme la version d'origine) :
// la signature WebP a besoin des octets 8 à 12 (« RIFF » … « WEBP »).
export const MAGIC_HEAD_BYTES = 16;

const startsWith = (b: Buffer, bytes: number[]) =>
  b.length >= bytes.length && bytes.every((v, i) => b[i] === v);

const OLE = [0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]; // Office 97-2003 (.doc/.xls)
const ZIP = [0x50, 0x4b, 0x03, 0x04]; // conteneur OOXML (.docx/.xlsx)

const MAGIC: Record<string, (b: Buffer) => boolean> = {
  '.pdf': (b) => b.subarray(0, 5).toString('latin1') === '%PDF-',
  '.png': (b) => startsWith(b, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  '.jpg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  '.jpeg': (b) => startsWith(b, [0xff, 0xd8, 0xff]),
  // RIFF….WEBP : la taille occupe les octets 4 à 8, d'où le contrôle en deux morceaux.
  '.webp': (b) =>
    b.length >= 12 &&
    b.subarray(0, 4).toString('latin1') === 'RIFF' &&
    b.subarray(8, 12).toString('latin1') === 'WEBP',
  '.gif': (b) => ['GIF87a', 'GIF89a'].includes(b.subarray(0, 6).toString('latin1')),
  '.doc': (b) => startsWith(b, OLE),
  '.xls': (b) => startsWith(b, OLE),
  '.docx': (b) => startsWith(b, ZIP),
  '.xlsx': (b) => startsWith(b, ZIP),
};

/**
 * Le contenu correspond-il à l'extension annoncée ?
 *
 * Fail-closed : une extension dont on ne connaît pas la signature est REFUSÉE. Toute
 * extension ajoutée à l'`ALLOWED_EXT` d'une route doit donc recevoir sa signature ici,
 * sinon les téléversements de ce type seront rejetés.
 */
export function contentMatchesExt(buf: Buffer, ext: string): boolean {
  const check = MAGIC[ext];
  if (!check) return false;
  return check(buf.subarray(0, MAGIC_HEAD_BYTES));
}

/**
 * Même contrôle, pour un fichier DÉJÀ écrit sur disque (routes en `multer.diskStorage`).
 * Ne charge que l'en-tête, pas les 15 Mo du fichier.
 */
export function fileContentMatchesExt(filePath: string, ext: string): boolean {
  if (!MAGIC[ext]) return false;
  let fd: number | undefined;
  try {
    fd = fs.openSync(filePath, 'r');
    const buf = Buffer.alloc(MAGIC_HEAD_BYTES);
    const read = fs.readSync(fd, buf, 0, MAGIC_HEAD_BYTES, 0);
    return contentMatchesExt(buf.subarray(0, read), ext);
  } catch {
    return false; // illisible → traité comme non conforme
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
  }
}

/**
 * Supprime un fichier refusé. Sans échec bloquant : le rejet HTTP primant, un reliquat
 * sur disque ne doit pas transformer un 400 en 500.
 */
export function discardUpload(filePath: string): void {
  try {
    fs.unlinkSync(filePath);
  } catch {
    /* déjà absent ou non supprimable : rien à faire */
  }
}
