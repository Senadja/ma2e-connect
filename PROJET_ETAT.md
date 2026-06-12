# État du projet MA2E — journal de bord

> Point de re-lecture unique pour reprendre le travail après un compactage de contexte
> ou une nouvelle session. **À mettre à jour à la fin de chaque tâche significative.**
> Dernière mise à jour : 2026-06-11.

## Git & déploiement (état au 2026-06-12)
- Remote : `github.com/Senadja/ma2e-connect`.
- `main` (`95c7767`) = **ancienne version front statique, déployée par Vercel** (`ma2e-connect.vercel.app`). **Ne pas pousser dessus** sans gérer Vercel.
- `online-vercel-backup` + tag `vercel-prod-2026-06-12` = sauvegarde de la prod Vercel.
- `refonte-fullstack` = nouvelle version full-stack (branche de travail courante, poussée).
- **Cible de déploiement** : front sur **Vercel**, backend (Node + PostgreSQL) sur **serveur dédié OVH**, tout en **Docker**.
  Identifiants serveur fournis hors-repo (NE PAS committer ; à faire tourner en clé SSH + rotation du mot de passe).
- **À décider avant déploiement** : domaine/sous-domaine de l'API (CORS + `VITE_API_URL`), stratégie de stockage des uploads (cf. ci-dessous).

## Stack
- **Front** : Vite + React + React Router (SPA), react-i18next (FR/EN), React Query, zustand (`useAuth`).
- **Back** : Node/Express 5 + Prisma 5.22 + PostgreSQL.
- **Infra** : Docker Compose 3 services (`db`, `backend`, `web` nginx). `web` proxifie `/api` → `backend:3000`.
- **Schéma DB** appliqué au démarrage via `prisma db push` (pas de migrations versionnées) — voir `backend/docker-entrypoint.sh`.
- **Comptes seed** : `admin@ma2e.ci` / `admin123` (ADMIN), `editor@ma2e.ci` / `editor123`.
- **URLs** : site `http://localhost:8080`, API `http://localhost:8080/api`.

## Commandes utiles
- Rebuild ciblé : `docker compose up -d --build backend web`
- Typecheck front : `npx tsc -p tsconfig.app.json --noEmit`
- Typecheck back : `cd backend && npx tsc --noEmit`
- Audit i18n (navigateur headless) : `node e2e/check-i18n.mjs` (doit afficher « Aucune chrome française détectée »).
- Régénérer client Prisma après changement de schéma : `cd backend && npx prisma generate`

## Fait & vérifié
- **Backend complet** : auth JWT/bcrypt + RBAC (permissions fines), CRUD news/products/faq/media/partners/team,
  applications, contact, settings (clé/valeur), audit log.
- **CMS** : rôles/utilisateurs, FAQ, médiathèque, paramètres (bannière, contact, social, stats, **SMTP**),
  partenaires, immobilier, équipe, contact, journal d'activité.
- **i18n** : interface 100 % FR/EN (17 routes auditées, 0 résidu de chrome). Reste FR = **contenu de données** (BDD).
- **SMTP configurable depuis le CMS** : clé `smtp` privée (exclue du GET public), lue par le mailer au runtime,
  repli sur variables d'env. Carte SMTP dans Paramètres.
- **Fix chunks 404** : `lazyWithReload` (App.tsx) + `index.html` en no-cache (nginx.conf).
- **Workflow demande → décision** (2026-06-11) : voir section dédiée ci-dessous.

## Workflow « demande d'adhésion → validation / refus motivé »
- Modèle `Application` : ajout `decisionReason`, `decidedAt`, `decidedBy`.
- `PATCH /applications/:id` : **refus impose un motif** (400 sinon) ; horodate + trace l'admin ;
  efface la décision si retour à PENDING/REVIEWING ; notifie le demandeur par e-mail (`sendApplicationDecision`).
- Back-office `ApplicationsManager.tsx` : dialogue de refus (causes pré-définies + précisions),
  statut « En examen », bloc Décision, **historique réel** (createdAt + decidedAt), vraies données demandeur,
  bouton « Rouvrir le dossier ».
- Testé E2E : refus sans motif → 400 ; refus motivé → 200 + traçabilité ; approbation → 200 + e-mail ;
  réouverture → décision effacée.

## Audit du 2026-06-11 (avant démo client)
**Corrigé :**
- Produits Épargne : ajout d'un **éditeur de caractéristiques** (`features`) dans le modal (tous types) — c'était la
  cause du « l'épargne ne s'édite pas » : la page publique épargne affiche `features`, qui n'avait aucun éditeur.
- **Export CSV** des demandes : branché (séparateur `;` + BOM UTF-8 pour Excel FR ; respecte onglet + recherche).
- Clics morts corrigés : Dashboard (boutons → routes admin), Credits + NewsDetail (`href="#"` → `/espace-ema2e`),
  Adhésion (bouton télécharger → vrai PDF), Footer réseaux sociaux (pilotés par réglages, n'affiche que les configurés),
  NewsManager « Aperçu en direct » → ouvre l'article public.

**Corrigé (2e passe) :**
- **Uploads réels** : nouvel endpoint backend `POST /api/uploads` (stockage seul, sans entrée médiathèque ;
  `backend/src/routes/uploads.ts`, volume partagé `ma2e_uploads` servi par nginx en `/documents/uploads/`).
  Branché dans ProductsManager (image + formulaire, input fichier caché + aperçu) et NewsManager (image à la une).
  Testé E2E : upload → 200 servi par nginx → attaché produit/article, persiste.
- **Image à la une des articles** : champ `image` ajouté au modèle `Article` (+ schéma route). Rendu public branché
  sur Index, News (vedette + liste), NewsDetail (héro + liés) avec repli placehold.co si absent.
- **Dashboard honnête** : faux « Prêts Octroyés 2,4 Mds » + tendances « +x% vs mois dernier » retirés ; remplacés par
  des compteurs réels (Demandes reçues / Demandes approuvées / Publications, depuis l'API).
- **Doublons de test supprimés** : `epargne-express`, `credit-express`, `credit-ordinaire`. Produits propres :
  crédit 4, épargne 5, immobilier 5 (conformes au seed).

**Corrigé (3e passe — avant présentation) :**
- **Navbar admin** : `overflow-y-auto` ajouté (sidebar desktop + mobile) → menu défile sur petits écrans.
- **Catégories d'actualités traduites** : map `newsPage.categories` (FR/EN) + helper `tCat()` dans News, NewsDetail, Index
  (Événements→Events, Communiqués→Press releases, Offres→Offers). Le **corps des articles reste éditorial** (mono-langue).
- **Upload de documents à l'adhésion** : endpoint **public** `POST /api/applications/documents` (whitelist .pdf/.jpg/.png/.doc/.docx,
  8 Mo max ; `backend/src/routes/applications.ts`). Formulaire d'adhésion : upload multi-fichiers réel + liste + retrait,
  stockés dans `data.documents`. Back-office : section « Pièces justificatives » téléchargeables dans la fiche de demande.
- **Données de démo** : 6 demandes propres (tous statuts), dont MA2E-2026-0006 « Adjoua Kouassi » **avec pièce jointe** (CNI).
- **`PRESENTATION_MA2E.md`** : script de démonstration complet (parcours visiteur + admin + scénario fil rouge adhésion).

**Workflow adhésion (réponse à « comment on gère ») :** le visiteur soumet + téléverse ses pièces → l'admin instruit
(consulte les pièces) → **Approuver** (e-mail de validation) ou **Rejeter** avec motif obligatoire (e-mail du motif) ;
statuts intermédiaires « En examen » / « Rouvrir ». Tout est tracé (decidedBy/decidedAt/decisionReason).

**Reste à traiter :**
- **NewsManager** : toggle « Épingler », boutons « Filtrage avancé » / « Partager » non fonctionnels (masquer ou implémenter) ;
  champs Auteur/temps de lecture/vues en dur.
- **Traduction du contenu éditorial** des articles (titres/corps) : nécessiterait des champs bilingues en base — chantier optionnel.
- **Images placehold.co** : repli encore visible pour les articles du seed sans visuel uploadé.

## Pistes / chantiers ouverts
- **Contenu CMS bilingue** (FR+EN par enregistrement : news, partenaires, FAQ…) — non commencé. C'est la source
  du français résiduel visible en mode EN. Chantier distinct de l'i18n de l'interface.
- **Organigramme « Organisation »** (À propos #organisation) : redesign fait (arbre + icônes) ET **éditable via le CMS**
  → réglage JSON `orgChart` ({level1Name, level2Name, departments[]}), carte « Organigramme » dans Paramètres.
  Les noms viennent du CMS (repli i18n) ; les libellés de rôle (« Organe délibérant »…) restent traduits FR/EN.
  La section « Gouvernance » (cartes de personnes) reste gérée par `TeamManager` / `TeamMember`.
- Export CSV des demandes (bouton présent, non branché).
- Upload réel des pièces jointes d'adhésion (actuellement simulé côté formulaire).
- Simulation de crédit (évoquée, mise de côté).

## Conventions / contraintes à respecter
- Vérifier les faits contre les **documents sources** (CDC, offre technique Ebenyx, Rapport annuel 2024),
  pas le contenu de démo.
- **Conserver** le « 500 FCFA » dans la page CGU.
- Le **mot de passe SMTP ne doit jamais** être exposé par l'API publique.
