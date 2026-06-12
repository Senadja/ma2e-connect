# MA2E — Guide de présentation des fonctionnalités

> Script de démonstration pour présenter le site et le back-office au client.
> Suis l'ordre proposé : il raconte une histoire (le visiteur découvre, adhère ;
> l'admin gère). Durée indicative : 20–30 min.

## 0. Préparation
- **Site public** : http://localhost:8080
- **Back-office** : http://localhost:8080/admin (compte démo : `admin@ma2e.ci` / `admin123`)
- Bascule de langue : bouton **FR / EN** en haut à droite du site public.
- Données de démo déjà en place : 6 demandes (tous statuts), 2 messages, 1 demande avec pièce jointe.

---

## 1. Parcours VISITEUR (site public) — ~10 min

### 1.1 Accueil (`/`)
- Hero, chiffres clés (adhérents, produits…), produits phares, dernières actualités.
- **À dire** : « Tout ce qui est affiché ici (chiffres, bannière, actualités) est piloté depuis le back-office, sans toucher au code. »
- Si une **bannière d'information** est active, elle apparaît en haut et disparaît au scroll.

### 1.2 À propos (`/a-propos`)
- Histoire (frise chronologique), missions, **organigramme** (CA → Direction Générale → directions), gouvernance (membres).
- **À dire** : « L'organigramme et l'équipe sont éditables depuis le CMS. »

### 1.3 Produits & Offres
- **Épargne** (`/produits/epargne`), **Crédits** (`/produits/credits`), **Immobilier** (`/produits/immobilier`).
- Chaque produit : description, **caractéristiques**, fiche visuelle, formulaire téléchargeable, et **formulaire de demande en ligne**.
- Le simulateur de crédit renvoie vers l'espace E-MA2E.

### 1.4 Actualités (`/actualites`)
- Article à la une, filtres par **catégorie** (traduits FR/EN), recherche, tags, pagination, flux RSS.
- Cliquer un article → page détail avec partage social, articles liés.

### 1.5 Médiathèque (`/mediatheque`)
- Documents téléchargeables (formulaires, rapports, statuts), filtrables par catégorie.

### 1.6 Partenaires (`/partenaires`) & FAQ (`/faq`)
- Partenaires avec logos ; FAQ par thématique (accordéon).

### 1.7 Contact (`/contact`)
- Formulaire → arrive dans le back-office (Messages de contact).
- **Démo** : choisir l'objet **« Autre »** → un champ « Précisez l'objet » apparaît.

### 1.8 Adhésion (`/adhesion`) — le parcours clé
- Formulaire en 3 onglets : Informations personnelles → professionnelles → **Documents**.
- **Démo** : dans l'onglet Documents, **téléverser une pièce** (PDF/image/Word) → elle apparaît dans la liste.
- Soumettre → la demande (avec ses pièces jointes) arrive dans le back-office.

### 1.9 Multilingue (FR / EN)
- Basculer en **EN** : toute l'interface se traduit (menus, libellés, boutons, catégories d'actualités).
- **À dire** : « L'interface est entièrement bilingue. Le contenu éditorial (corps des articles) reste dans sa langue de rédaction — la traduction du contenu est un chantier optionnel. »

---

## 2. Parcours ADMIN (back-office) — ~12 min

### 2.1 Connexion & Tableau de bord (`/admin`)
- Login → **Vue d'ensemble** : compteurs réels (adhérents, demandes reçues, demandes approuvées, publications), dernières demandes, raccourcis.
- Menu latéral gauche : tous les modules (défile si l'écran est petit).

### 2.2 Demandes & Formulaires — **le cœur de la démo**
- Liste filtrable (Toutes / En attente / En examen / Approuvées / Rejetées) + recherche.
- Sélectionner une demande → fiche : infos demandeur, **détails du formulaire**, **pièces justificatives téléchargeables**.
- **Workflow** (voir §3) : **Approuver** / **Mettre en examen** / **Rejeter (motif obligatoire)**.
- Montrer la demande **rejetée** (Mariam Touré) : le motif est enregistré et envoyé au demandeur.
- **Export CSV** : exporte la liste affichée (Excel-compatible).

### 2.3 Produits & Offres
- 3 onglets (Épargne / Crédits / Immobilier). Éditer un produit :
  - nom, description, **caractéristiques** (puces), taux/durée/montant (crédits),
  - **upload réel** de la fiche visuelle et du formulaire (clic → choix du fichier → aperçu).
- Masquer/afficher un produit du site, créer un nouveau produit.

### 2.4 Actualités
- Créer/éditer un article : titre, corps, catégorie, **image à la une (upload réel)**, brouillon/publié.
- « Aperçu en direct » ouvre l'article sur le site public.

### 2.5 Autres modules CMS
- **FAQ** : CRUD par catégorie.
- **Médiathèque** : upload de documents.
- **Partenaires** : CRUD + upload de logo.
- **Équipe & gouvernance** : CRUD des membres (alimente la page À propos).
- **Messages de contact** : lecture, marquer lu, répondre, supprimer.

### 2.6 Paramètres du site (sans toucher au code)
- **Bannière d'information** (texte + lien), **Coordonnées**, **Réseaux sociaux**, **Chiffres clés** (accueil),
  **Organigramme** (organes + directions), **Serveur e-mail SMTP**.
- **À dire** : « Le SMTP se configure ici : les notifications partent en vrai dès qu'il est renseigné, sans intervention technique. »

### 2.7 Sécurité & traçabilité
- **Utilisateurs & rôles** : permissions fines par profil (rédacteur, communication, produits, demandes…).
  Le menu s'adapte : chacun ne voit que ce qu'il a le droit de gérer.
- **Journal d'activité** : trace les actions des administrateurs.

---

## 3. Scénario fil rouge : une adhésion de bout en bout
1. **Visiteur** : remplit `/adhesion`, téléverse sa pièce d'identité, soumet.
2. **Admin** : la demande apparaît dans *Demandes* (statut En attente) avec la pièce jointe.
3. **Admin** : ouvre la pièce, vérifie. Deux issues :
   - **Documents OK** → **Approuver** → le demandeur reçoit un e-mail de validation.
   - **Documents manquants/incorrects** → **Rejeter** → saisir le **motif** (causes pré-cochées + précisions) → le demandeur reçoit le motif par e-mail.
4. **Admin** : peut aussi mettre **En examen** (instruction en cours) ou **Rouvrir** un dossier déjà décidé.

> C'est la réponse à « comment on gère l'adhésion » : **l'admin instruit le dossier, vérifie les pièces, puis valide ou refuse en motivant**. Tout est tracé (qui, quand, pourquoi).

---

## 4. Points forts à mettre en avant
- **100 % piloté par le CMS** : contenus, produits, organigramme, paramètres, SMTP — aucune intervention technique.
- **Workflow de demandes complet** : statuts, refus motivé, pièces justificatives, notifications e-mail, export CSV.
- **Bilingue FR/EN** sur toute l'interface.
- **Sécurité** : rôles & permissions fines, journal d'audit, mots de passe chiffrés, SMTP jamais exposé publiquement.
- **Prêt à déployer** : conteneurisé (Docker), responsive, optimisé (SEO, cache).
