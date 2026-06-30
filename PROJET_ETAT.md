# État du projet MA2E — journal de bord

> Point de re-lecture unique pour reprendre le travail après un compactage de contexte
> ou une nouvelle session. **À mettre à jour à la fin de chaque tâche significative.**
> Dernière mise à jour : 2026-06-30.

## MAJ 2026-06-30 (post-recette, suite)
- **Chiffres unifiés** (commits `fa340ae`, `78e6679`) : 8 430 sociétaires / 6,3 Md / 20 ans PARTOUT
  (accueil, menu, EN, repli `stats.ts`). feat1Desc/feat2Desc + FAQ e-mail corrigés **en BDD prod**.
  Compteur accueil = réglage `settings.stats` (éditable au BO) ; **ce n'est PAS orphelin**.
- **Organigramme** (commit `d44069f`) : rendu **responsive sans débordement** (composant partagé
  `src/components/OrgChart.tsx` : organes en grille 1/2/4 col + structures rattachées en arbre
  vertical indenté). Le **BO affiche le même composant** (aperçu) → BO = front. Conforme au PDF
  officiel (MAJ 22/05/2026). Vérifié 375/1280 px sans scroll horizontal.
- **Organigramme → SVG vectoriel** (`src/components/OrgChartSvg.tsx`) reproduisant la
  **disposition exacte du PDF officiel** (AG → 4 organes → DG + Staff DG + colonne RAI/RSI/Contrôleur
  avec lien pointillé Surveillance→Audit → DAGF → 4 services → sous-services), net/responsive, sans
  débordement (375/1280 vérifiés), + lien de téléchargement du PDF. Front + BO utilisent ce composant.
  Étapes intermédiaires (arbre interactif, puis image PNG) abandonnées au profit du SVG (« l'image
  n'est pas l'idéale »). Cadre AG en **bleu** (cohérent PDF). **Upload d'image possible au BO**
  (réglage `orgImage` ; si présente, l'image téléversée remplace le SVG sur le front). Pour modifier
  le schéma par défaut : éditer `OrgChartSvg.tsx`.
- **Dossier d'adhésion PDF — FAIT** (`adhesionPdf.ts`, choix client = Option 3) : **3 pages** =
  P1 Adhésion/Capital + P2 Demande d'Épargne (Épargne Expresse cochée/obligatoire, identité
  pré-remplie, société cochée, montants/période vierges = réglés à l'agence « à la source »,
  Prélèvement coché) + P3 Pièce d'identité (CNI recto/verso embarqués depuis `data.documents`,
  images uniquement ; PDF/Word ignorés). Pages Ordinaire/Logement facultatives **omises** (Option 3).
  Vérifié par rendu headless (3 pages conformes à l'exemple).
  **Montant Expresse auto-rempli selon la catégorie** (`expresseAmountByCategory`) : Cadre sup 10 000 /
  Cadre 5 000 / Maîtrise 5 000 / Employé-Ouvrier-Exécution 1 500 ; période laissée vierge (à la source).

## Git & déploiement (état au 2026-06-26)
- Remote : `github.com/Senadja/ma2e-connect`.
- **`main` = branche de PRODUCTION Vercel** → `ma2e-connect.vercel.app`. On y pousse via
  `git push origin refonte-fullstack:main` (fast-forward). À jour au commit `6dee356`.
- **`refonte-fullstack`** = branche de travail → déployée en **preview**
  (`ma2e-connect-git-refonte-fullstack-…vercel.app`).
  ⚠️ **Le back-office ne marche PAS sur l'URL de preview** (origine non autorisée par le CORS du backend).
  → Utiliser **la prod `ma2e-connect.vercel.app`** pour l'admin. (Pour débloquer le preview : ajouter son
  origine à `CORS_ORIGIN` côté backend OVH puis redéployer le backend.)
- **Backend** : Node + PostgreSQL sur **OVH**, exposé via **Tailscale Funnel** `srv-ma2e.tail4cac84.ts.net`.
  Le front (Vercel) réécrit `/api` et `/documents/uploads` vers ce backend (`vercel.json`).
- **Synchro de contenu** : produits / FAQ / partenaires / réglages sont servis **depuis la base** ; mise à jour
  via le CMS ou l'API (`PUT /settings/:key`, `PUT /products/:id`, `DELETE /faq/:id`…). Le code (`src/data/*`,
  `seed-data.ts`) ne sert que de **repli au 1er rendu** + source des déploiements neufs.

## Recette du CR du 26/06/2026 — TRAITÉE (déployée prod + base synchronisée)
Refonte/correctifs suite au rapport de recette EBENYX/MA2E. Tous les amendements du CR sont en ligne.
- **Anomalies** : bug bloquant formulaire (parsing JSON tolérant, `src/lib/api.ts`) ; pop-up/chatbot/Épargne
  Expresse intermittents → suppression du `catch → repli` dans `useSettings`/`useProducts` (React Query garde la
  dernière valeur valide) + Épargne Expresse réactivée en base.
- **Formulaire d'adhésion** (`Adhesion.tsx`, refonte 4 onglets) : champ **Société** (liste), Nom de la mère,
  ayants droit, personne à prévenir ; email pro non bloquant ; téléversement **CNI recto/verso** + passeport + photo ;
  case **intention de paiement** (6 000 F + 8 000 F) ; « Devenir sociétaire ». **PDF pré-rempli** imprimable
  téléchargeable au back-office (`src/lib/adhesionPdf.ts`, jsPDF) — signature **physique** à la MA2E.
- **Contenu** : taux/durées produits, stats 20 ans / 6,3 Mds, FAQ, **info@ma2e.ci**, horaires sans samedi,
  retrait nom Bakayoko, **retrait Projet Immobilier** (programme), infobulle croissance.
- **Institution** : Vision du fondateur (photo Marcel ZADI KESSY + mot + nom, **cadrage XY** réglable au CMS) ;
  organigramme avec vrais noms ; **organes en tableaux** (CA/CC/CS/CED) ; **personnel en cartes photo** (cadrage
  réglable, composant `FocalPointPicker`). Sociétés membres : +CIE/SODECI/MA2E, −groupe Eranove.
- **Back-office** : fix sessions expirées silencieuses (gestion globale du `401`, déconnexion+redirection) ;
  coordonnées + horaires + email DCP éditables au CMS (Footer/Contact lisent les réglages) ; champs longs en textarea.
- **Sécurité** : dossiers contenant des données personnelles (CNI, formulaires remplis) **git-ignorés**.
- **Comptes seed à durcir avant usage réel** : `admin@ma2e.ci`/`admin123` + JWT_SECRET par défaut → à changer.

**Restes mineurs / dépendances MA2E** : photos du personnel (seules DG/DAGF/RSI fournies, reste en initiales) ;
image de la pop-up OQSF (réglage CMS « splash ») ; titre govTitle « une seule ligne » (F3, cosmétique) ;
modèle PDF à ajuster si le formulaire officiel MA2E diffère de l'exemple.

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
