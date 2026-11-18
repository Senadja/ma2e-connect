import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import crypto from 'crypto';
import { contentMatchesExt, fileContentMatchesExt, discardUpload } from '../lib/uploadGuard';

// Non-régression de la validation de contenu des téléversements (audit manuel 2026-11-13,
// constat 5.1). Tests purs : ni base de données, ni serveur HTTP.

const head = (...bytes: number[]) => Buffer.from(bytes);
const text = (s: string) => Buffer.from(s, 'latin1');

// En-têtes authentiques, chacun complété pour dépasser les 16 octets lus.
const VALID: Record<string, Buffer> = {
  '.pdf': Buffer.concat([text('%PDF-1.7'), Buffer.alloc(16)]),
  '.png': Buffer.concat([head(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a), Buffer.alloc(16)]),
  '.jpg': Buffer.concat([head(0xff, 0xd8, 0xff, 0xe0), Buffer.alloc(16)]),
  '.jpeg': Buffer.concat([head(0xff, 0xd8, 0xff, 0xe1), Buffer.alloc(16)]),
  // RIFF + taille (4 octets quelconques) + WEBP : la signature est en DEUX morceaux.
  '.webp': Buffer.concat([text('RIFF'), head(0x1a, 0x00, 0x00, 0x00), text('WEBPVP8 '), Buffer.alloc(8)]),
  '.gif': Buffer.concat([text('GIF89a'), Buffer.alloc(16)]),
  '.doc': Buffer.concat([head(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1), Buffer.alloc(16)]),
  '.xls': Buffer.concat([head(0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1), Buffer.alloc(16)]),
  '.docx': Buffer.concat([head(0x50, 0x4b, 0x03, 0x04), Buffer.alloc(16)]),
  '.xlsx': Buffer.concat([head(0x50, 0x4b, 0x03, 0x04), Buffer.alloc(16)]),
};

describe('uploadGuard — signatures de fichiers', () => {
  it('accepte chaque extension autorisée par /api/media avec son vrai en-tête', () => {
    // Couvre l'union des ALLOWED_EXT des trois routes d'upload : une extension permise par
    // une route mais sans signature ici serait rejetée en production (fail-closed).
    for (const [ext, buf] of Object.entries(VALID)) {
      expect(contentMatchesExt(buf, ext), `${ext} devrait être accepté`).toBe(true);
    }
  });

  it('refuse un contenu texte déguisé en PDF (le PoC de l\'audit)', () => {
    const fake = Buffer.from('Ceci est un fichier texte, pas un PDF.\n'.repeat(4));
    expect(contentMatchesExt(fake, '.pdf')).toBe(false);
  });

  it('refuse un exécutable Windows déguisé', () => {
    const mz = Buffer.concat([head(0x4d, 0x5a, 0x90, 0x00), Buffer.alloc(32)]);
    for (const ext of ['.pdf', '.png', '.jpg', '.docx', '.webp']) {
      expect(contentMatchesExt(mz, ext), `MZ déguisé en ${ext}`).toBe(false);
    }
  });

  it('refuse du HTML déguisé en image (XSS stockée potentielle)', () => {
    const html = Buffer.from('<html><script>alert(1)</script></html>');
    for (const ext of ['.png', '.jpg', '.gif', '.webp']) {
      expect(contentMatchesExt(html, ext), `HTML déguisé en ${ext}`).toBe(false);
    }
  });

  it('refuse un RIFF qui n\'est pas du WebP (ex. WAV) — contrôle des octets 8 à 12', () => {
    // Régression ciblée : avec une lecture limitée à 8 octets, ce cas passait.
    const wav = Buffer.concat([text('RIFF'), head(0x1a, 0x00, 0x00, 0x00), text('WAVEfmt '), Buffer.alloc(8)]);
    expect(contentMatchesExt(wav, '.webp')).toBe(false);
  });

  it('est fail-closed : extension inconnue ou sans signature = refus', () => {
    for (const ext of ['.svg', '.html', '.js', '.exe', '.zip', '', '.PDF']) {
      expect(contentMatchesExt(VALID['.pdf'], ext), `${ext} ne doit pas être accepté`).toBe(false);
    }
  });

  it('ne déborde pas sur un fichier plus court que la signature', () => {
    expect(contentMatchesExt(Buffer.alloc(0), '.pdf')).toBe(false);
    expect(contentMatchesExt(Buffer.from('%PD'), '.pdf')).toBe(false);
    expect(contentMatchesExt(text('RIFF'), '.webp')).toBe(false);
  });
});

describe('uploadGuard — contrôle sur fichier écrit (diskStorage)', () => {
  const tmp = (name: string) => path.join(os.tmpdir(), `ma2e-${crypto.randomUUID()}-${name}`);

  it('valide puis rejette un fichier réellement présent sur disque', () => {
    const good = tmp('vrai.pdf');
    const bad = tmp('faux.pdf');
    fs.writeFileSync(good, VALID['.pdf']);
    fs.writeFileSync(bad, Buffer.from('pas un PDF du tout'));
    try {
      expect(fileContentMatchesExt(good, '.pdf')).toBe(true);
      expect(fileContentMatchesExt(bad, '.pdf')).toBe(false);
    } finally {
      discardUpload(good);
      discardUpload(bad);
    }
  });

  it('discardUpload supprime le fichier refusé et reste silencieux s\'il a déjà disparu', () => {
    const f = tmp('a-supprimer.png');
    fs.writeFileSync(f, VALID['.png']);
    discardUpload(f);
    expect(fs.existsSync(f)).toBe(false);
    expect(() => discardUpload(f)).not.toThrow();
  });

  it('traite un fichier absent comme non conforme, sans lever', () => {
    expect(fileContentMatchesExt(tmp('jamais-ecrit.pdf'), '.pdf')).toBe(false);
  });
});
