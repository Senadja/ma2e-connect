# PLAN D'IMPLÉMENTATION — RÉFONTE SITE WEB MA2E

## 1. RÉSUMÉ EXÉCUTIF
Le projet frontend actuel pour la MA2E est **avancé à environ 70%** sur la partie publique. La structure globale, l'identité visuelle (#1A6147 / #F5A623) et les pages institutionnelles sont en place et de haute qualité. Cependant, les formulaires de conversion spécifiques (adhésion, crédits) sont manquants, et toute la couche logicielle "Back-office / CMS" promise dans l'offre technique reste à développer. L'optimisation SEO et performance (lazy loading) doit également être finalisée pour atteindre les objectifs de l'offre.

---

## 2. TABLEAU DE CONFORMITÉ (AO × OFFRE × CODE)

| Catégorie | Fonctionnalité / Exigence | Promis (Offre) | Code existant | Statut |
| :--- | :--- | :---: | :---: | :---: |
| **PAGES** | Accueil, À propos, FAQ, Contact | ✅ | ✅ | ✅ FAIT |
| | Produits (Épargne, Crédit, Immo) | ✅ | ✅ | ✅ FAIT |
| | Actualités (Liste & Détail) | ✅ | ✅ | ✅ FAIT |
| | Médiathèque & Partenaires | ✅ | ✅ | ✅ FAIT |
| | Pages Légales (Mentions, CGU, DCP) | ✅ | ✅ | ✅ FAIT |
| **NAVIGATION** | Navbar Sticky / Glassmorphism | ✅ | ✅ | ✅ FAIT |
| | Dropdowns & Hamburger mobile | ✅ | ✅ | ✅ FAIT |
| | Footer 4 colonnes | ✅ | ✅ | ✅ FAIT |
| **COMPOSANTS** | Hero Section & Stats animés | ✅ | ✅ | ✅ FAIT |
| | Cards produits & Citation PCA | ✅ | ✅ | ✅ FAIT |
| | Timeline Historique | ✅ | ✅ (About) | ✅ FAIT |
| | Flash Info (Banner) | ✅ | ✅ | ✅ FAIT |
| **FORMULAIRES** | Formulaire de Contact | ✅ | ✅ | ✅ FAIT |
| | Formulaire Demande d'adhésion | ✅ | ❌ | ❌ MANQUANT |
| | Formulaire Demande Épargne/Crédit | ✅ | ❌ | ❌ MANQUANT |
| **TECHNIQUE** | Responsive Design | ✅ | ✅ | ✅ FAIT |
| | Animations UX (Reveal on scroll) | ✅ | ✅ | ✅ FAIT |
| | SEO (Meta tags, Helmet, Sitemap) | ✅ | ❌ | ❌ MANQUANT |
| | Performance (Lazy loading, WebP) | ✅ | 🟡 | 🟡 PARTIEL |
| | Accessibilité (ARIA, Contrastes) | ✅ | 🟡 | ⚠️ À VÉRIFIER |
| **CMS / BACK** | Back-office sur-mesure (React) | ✅ | ❌ | ❌ MANQUANT |
| | Gestion des rôles (RBAC) | ✅ | ❌ | ❌ MANQUANT |
| | Dashboard Analytics (Matomo) | ✅ | ❌ | ❌ MANQUANT |

---

## 3. MÉTRIQUES DE PROGRESSION
*   **Pages statiques/institutionnelles :** 100%
*   **Composants UI (Frontend) :** 85%
*   **Formulaires métier :** 20%
*   **SEO & Optimisation :** 10%
*   **Back-office / CMS :** 0%
*   **Couverture globale des exigences AO :** ~55%

---

## 4. PLAN D'IMPLÉMENTATION PAR SPRINTS

### Sprint 1 — Finalisation Frontend & Conversion (2 semaines)
**Objectif :** Finaliser l'expérience utilisateur publique et les outils de conversion.
**Priorité :** Haute

1. **Formulaires métier** — Création des formulaires d'adhésion et de demande de produits (Savings/Credits).
   - Fichiers : `src/pages/Adhesion.tsx`, `src/components/forms/ProductRequestForm.tsx`
   - Validation : Validation Zod complète et envoi simulé.
2. **SEO & Metadata** — Intégration de `react-helmet-async` pour la gestion des titres et meta-tags dynamiques.
   - Fichiers : `src/App.tsx`, `src/components/layout/Layout.tsx`
   - Validation : Chaque page a un titre unique et des tags OpenGraph.
3. **Performance** — Implémentation du Lazy Loading des routes (React.lazy) et optimisation des images en WebP.
   - Fichiers : `src/App.tsx`, `public/assets/`
   - Validation : Score Lighthouse Performance > 90.

### Sprint 2 — Socle Back-office & Authentification (2 semaines)
**Objectif :** Mettre en place l'environnement d'administration sécurisé.
**Priorité :** Critique

1. **Layout Admin** — Création du dashboard d'administration (Sidebar, Header, User menu).
   - Fichiers : `src/pages/admin/AdminLayout.tsx`
   - Validation : Navigation interne fonctionnelle.
2. **Authentification** — Système de login avec JWT et protection des routes.
   - Fichiers : `src/hooks/useAuth.ts`, `src/pages/admin/Login.tsx`
   - Validation : Redirection automatique vers /login si non authentifié.
3. **Gestion des Rôles** — Implémentation du RBAC (Admin, Éditeur).
   - Fichiers : `src/lib/auth-utils.ts`
   - Validation : Menu restreint selon le rôle.

### Sprint 3 — Gestion de Contenu (CMS) (2 semaines)
**Objectif :** Permettre l'autonomie éditoriale promise à la MA2E.
**Priorité :** Haute

1. **CRUD Actualités** — Interface de création/édition/suppression des news avec éditeur WYSIWYG.
   - Fichiers : `src/pages/admin/news/NewsManager.tsx`
   - Validation : Possibilité de publier une news sans toucher au code.
2. **Gestionnaire de Médias** — Bibliothèque d'images et documents pour la médiathèque.
   - Fichiers : `src/pages/admin/media/Library.tsx`
   - Validation : Upload et suppression de fichiers PDF/Images.

---

## 5. BACKLOG COMPLET PRIORISÉ

| Priorité | Catégorie | Tâche | Estimation |
| :--- | :--- | :--- | :--- |
| 🔴 CRITIQUE | Admin | Structure Back-office & Authentification JWT | 16h |
| 🔴 CRITIQUE | Formulaires | Formulaire de demande d'adhésion complet | 8h |
| 🟠 HAUTE | CMS | Module de gestion des actualités (CRUD) | 12h |
| 🟠 HAUTE | SEO | Intégration Meta tags dynamiques & Sitemap | 6h |
| 🟠 HAUTE | Formulaires | Formulaire de demande Épargne / Crédit | 8h |
| 🟡 MOYENNE | Perf | Optimisation images (WebP) & Lazy Loading | 4h |
| 🟡 MOYENNE | Analytics | Intégration Dashboard Matomo | 6h |
| 🟢 BASSE | UX | Animations de transition entre les pages | 4h |

---

## 6. RISQUES & RECOMMANDATIONS
*   **Risque technique :** L'offre mentionne Node.js/NestJS. Si le backend n'est pas encore commencé, la liaison API pourrait retarder le Sprint 3.
*   **Recommandation :** Utiliser un CMS Headless (Strapi) comme suggéré dans l'Option B de l'offre pour accélérer la livraison si le budget temps est serré.
*   **Recommandation SEO :** Le passage à Next.js (SSR) est fortement recommandé dans l'offre mais le code actuel est en Vite (SPA). Pour un SEO optimal, une migration vers Next.js devrait être envisagée ou un pré-rendu (SSG/Prerender.io).

---

## 7. PROCHAINE ACTION IMMÉDIATE
**Installer `react-helmet-async` et configurer le SEO de base sur toutes les pages pour sortir de l'état "site vitrine statique".**
