# Plan d'implémentation — Finalisation Backend & Contenu Front · MA2E

**Date :** 10 juin 2026 · **Auteur :** Équipe technique EBENYX
**Objet :** Plan pour (1) finaliser le backend + les API nécessaires, (2) remplacer les contenus « en construction » du front par du vrai contenu.
**Échéance projet :** 30 juin 2026.
**Note :** remplace et actualise `Plan_Implementation_MA2E.md` (version avril 2026, obsolète : le back-office, les formulaires, le SEO et le lazy-loading qui y figuraient comme « manquants » sont désormais réalisés).

---

## 0. État des lieux (constat technique au 10/06)

| Élément | État actuel | Cible |
|---------|-------------|-------|
| Auth admin (`/api/auth/login`) | Mockée — `mock-jwt-token`, aucune comparaison bcrypt | JWT réel + bcrypt + middleware RBAC |
| Routes backend | 4 routes en lecture seule (`health`, `applications`, `stats`, `login`) | CRUD complet News / Products / Applications + Auth + Upload |
| Persistance front admin | Lit `src/data/site.ts` (statique) — l'édition n'enregistre rien | Données servies par l'API (PostgreSQL via Prisma) |
| Formulaires publics | `ProductRequestForm` = `console.log` ; `Adhesion` idem | `POST /api/applications` + notification e-mail |
| Stats accueil | `GET /api/stats` invente des chiffres | Stats calculées + valeurs de référence en base |
| Modèles Prisma | `User`, `Application` | + `Article` (news), `Product`, `MediaFile` |
| Pages « en construction » | EspaceSocietaire (volontaire), admin Users/Settings (placeholder) | Contenu réel / module fonctionnel |

> **Principe directeur :** le front est très avancé mais branché sur des données statiques. L'essentiel du travail backend consiste à **exposer ces données via l'API et à connecter le back-office en écriture**, sans refondre le front.

---

## 1. Backend — Plan d'implémentation

### 1.1 Fondations & sécurité (priorité 1 — tâche planning 2.7)

- [ ] **Restructurer `backend/src`** en modules : `routes/`, `controllers/`, `middleware/`, `lib/` (au lieu d'un seul `index.ts` de 63 lignes).
- [ ] **Auth JWT réelle** :
  - `POST /api/auth/login` → `bcrypt.compare(password, user.password)` (le seed hashe déjà avec bcrypt), génération d'un JWT signé (`JWT_SECRET` dans `.env`), expiration 8 h.
  - `GET /api/auth/me` → renvoie l'utilisateur courant à partir du token.
- [ ] **Middleware `requireAuth`** : vérifie le Bearer token, rejette 401 sinon.
- [ ] **Middleware `requireRole('ADMIN')`** : RBAC pour toutes les routes d'écriture.
- [ ] **Variables d'environnement** : ajouter `JWT_SECRET`, `CORS_ORIGIN`, `SMTP_*`. Ne jamais committer `.env` (vérifier `.gitignore`).
- [ ] **Durcissement** : `cors` restreint à l'origine du front, `express-rate-limit` sur `/auth/login`, validation des entrées (Zod côté serveur), `helmet` déjà présent.

### 1.2 Modèle de données (extension Prisma — tâche 2.6)

Ajouter au `schema.prisma` :

```prisma
model Article {           // Actualités
  id          String   @id @default(uuid())
  slug        String   @unique
  title       String
  excerpt     String
  category    String
  content     Json              // blocs { type, text, items }
  author      String?
  tags        String[]
  status      String   @default("draft")  // draft | published
  publishedAt DateTime?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Product {            // Épargne / Crédits / Immobilier
  id          String   @id @default(uuid())
  type        String            // epargne | credit | immobilier
  name        String
  description String
  features    String[]
  meta        Json?             // taux, durée, montant, conditions…
  image       String?
  form        String?           // chemin du formulaire à télécharger
  active      Boolean  @default(true)
  order       Int      @default(0)
}

model MediaFile {          // Médiathèque / uploads
  id        String   @id @default(uuid())
  title     String
  category  String
  path      String
  size      String?
  year      String?
  createdAt DateTime @default(now())
}
```

- [ ] Migration : `npx prisma migrate dev --name add_content_models`.
- [ ] **Seed** (`prisma/seed.ts`) : injecter les données actuelles de `src/data/site.ts` et `institutional.ts` (NEWS, SAVINGS, CREDITS, MEDIA) pour que la base reflète le contenu existant dès le départ.

### 1.3 API REST — endpoints à créer (tâches 2.6 / 2.8 / 2.9)

**Actualités**
- [ ] `GET /api/articles` (public, `?status=published`) · `GET /api/articles/:slug` (public)
- [ ] `POST /api/articles` · `PUT /api/articles/:id` · `DELETE /api/articles/:id` (admin)

**Produits**
- [ ] `GET /api/products?type=epargne|credit|immobilier` (public)
- [ ] `POST` / `PUT /:id` / `DELETE /:id` (admin)

**Demandes (Applications)**
- [ ] `POST /api/applications` (public) — réception des `ProductRequestForm` + `Adhesion` ; génère un `appId` lisible (ex. `MA2E-2026-0001`).
- [ ] `GET /api/applications` (admin, déjà existant — sécuriser + pagination/filtre par statut)
- [ ] `PATCH /api/applications/:id` (admin) — changer `status` / `priority`.

**Médiathèque & upload**
- [ ] `GET /api/media` (public) · `POST /api/media` (admin, upload via `multer`) · `DELETE /api/media/:id`.

**Stats**
- [ ] `GET /api/stats` — refonte : valeurs de référence stockées (adhérents, Mds FCFA) + comptages réels, plus de chiffres « magiques » en dur.

### 1.4 Notifications e-mail (tâche 2.9 / CDC)

- [ ] À la création d'une `Application` : envoi d'un e-mail au service MA2E concerné (Nodemailer + SMTP), accusé de réception optionnel au demandeur.
- [ ] Gabarits e-mail simples (texte + HTML) avec récapitulatif de la demande.

### 1.5 Connexion du front à l'API (remplacement des données statiques)

- [ ] Créer `src/lib/api.ts` (client `fetch` centralisé, base URL via `VITE_API_URL`, injection du Bearer token).
- [ ] **Auth admin** : `Login.tsx` → vraie requête ; stocker le token ; route `AdminLayout` protégée (redirection si non authentifié).
- [ ] **NewsManager / ProductsManager** : remplacer les `import { NEWS }` / `{ SAVINGS, CREDITS }` par des requêtes React Query (lecture) + mutations (création/édition/suppression).
- [ ] **ApplicationsManager** : remplacer les « Simulated applications data » par `GET /api/applications` + `PATCH` statut.
- [ ] **Dashboard** : brancher les vrais comptages.
- [ ] **Pages publiques** (`News`, `NewsDetail`, `Savings`, `Credits`, `RealEstate`, `Mediatheque`) : lecture depuis l'API (avec fallback statique pour résilience pendant la transition).
- [ ] **`ProductRequestForm` + `Adhesion`** : `POST /api/applications`, gestion erreurs + toast.

### 1.6 Tests & déploiement (Phase 3)

- [ ] Tests d'intégration des routes (au moins auth + CRUD + POST application).
- [ ] Audit OWASP Top 10 (injection, auth, exposition de données, rate-limiting).
- [ ] `Dockerfile` / `docker-compose` (API + PostgreSQL) ou config PM2 sur VPS.
- [ ] Variables de prod, HTTPS/SSL (dépend de la fourniture du certificat + domaine par MA2E — tâche 3.5).

---

## 2. Front — Contenus « en construction » à compléter

### 2.1 Pages / modules à finaliser

| Page / module | Statut | Action |
|---------------|--------|--------|
| **Espace E-MA2E** (`EspaceSocietaire.tsx`) | Landing « Bientôt » **volontaire** (E-MA2E = futur périmètre sécurisé) | À **conserver** tel quel, mais confirmer le message avec MA2E. Pas de connexion réelle attendue sur le site public. |
| **Admin → Utilisateurs** (`/admin/users`) | Placeholder « en cours de développement » | Construire le module CRUD utilisateurs (liste, création admin, rôles) — dépend de l'API Auth/Users. |
| **Admin → Paramètres** (`/admin/settings`) | Placeholder | Définir le périmètre (coordonnées, réseaux sociaux, libellés) ou retirer du menu si hors lot. |

### 2.2 Contenus statiques à corriger / fiabiliser

- [ ] **Documents manquants** (déjà identifié) : formulaires **Crédit Scolaire** et **Crédit Immobilier** — actuellement le formulaire « Crédit Ordinaire » sert de contournement (`src/data/site.ts`). → à fournir par MA2E.
- [ ] **Médiathèque** : 2 entrées sans lien de téléchargement (`Rapport annuel 2023`, `Brochure produits 2025`) — fournir les fichiers ou retirer les entrées (`src/data/institutional.ts`).
- [ ] **Incohérence offre crédit** : `Products.tsx` annonce « Crédit Ordinaire / Expresse / Immobilier / **Immobilier Différé** » alors que la page Crédits liste « Ordinaire / Expresse / **Scolaire** / Immobilier ». → harmoniser la liste officielle des produits.
- [ ] **Équipe / gouvernance** (`TEAM` dans `site.ts`) : vérifier les noms et fonctions avec l'**Organigramme officiel** (`Organigramme de la MA2E - MISE A JOUR LE 22-05-2026.pdf`) — certains noms semblent génériques.
- [ ] **Statistiques** (`STATS`) : valider les chiffres officiels (7 335 adhérents, 2,4 Mds FCFA, 14 ans) avec le **Rapport annuel 2024** avant de les figer côté API.
- [ ] **Coordonnées / contact** : vérifier adresses agences, téléphones, e-mails (`contact@ma2e.ci`) — à confirmer avec MA2E.

### 2.3 Tâches Phase 2 transverses encore ouvertes

- [ ] **Multilingue FR/EN** (i18n) — non implémenté (tâche 2.10).
- [ ] **Matomo analytics** — non implémenté (tâche 2.10).
- [ ] Audit responsive / accessibilité / SEO (tâche 2.5).

---

## 3. Séquencement proposé (jusqu'au 30/06)

| Lot | Contenu | Dépendances |
|-----|---------|-------------|
| **L1 (priorité)** | Auth JWT réelle + middleware RBAC + protection back-office | — |
| **L2** | Modèles Prisma (Article/Product/Media) + migration + seed depuis `site.ts` | L1 |
| **L3** | API CRUD News/Products/Applications + branchement back-office en lecture/écriture | L2 |
| **L4** | `POST /applications` + notifications e-mail + branchement formulaires publics | L2 |
| **L5** | i18n FR/EN + Matomo + corrections contenus (médias, équipe, produits) | contenus MA2E |
| **L6** | Tests, audit OWASP/SEO, dockerisation, config VPS/SSL, mise en prod | SSL/domaine MA2E |

---

## 4. Dépendances externes (à obtenir de MA2E)

1. Formulaires officiels **Crédit Scolaire** et **Crédit Immobilier**.
2. Fichiers manquants médiathèque (Rapport 2023, Brochure produits).
3. Validation des **chiffres officiels** (stats) et de l'**organigramme** (équipe).
4. **Certificat SSL + nom de domaine** + accès **VPS** pour la mise en production.
5. Coordonnées SMTP (serveur d'envoi e-mail) pour les notifications.

---

*Document de travail — à mettre à jour au fil de l'avancement.*
