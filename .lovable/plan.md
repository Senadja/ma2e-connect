

## État actuel vs. Cahier des charges (CDC)

J'ai croisé l'offre EBENYX (section 06 — couverture du CDC) avec ce qui existe dans le projet. Le projet est purement frontend, donc je laisse de côté le back-office, l'infra et la sécurité serveur (UFW, Fail2ban, MFA, etc.) qui ne s'implémentent pas ici.

### Déjà fait ✅
- Présentation MA2E (À propos, histoire, mission, équipe)
- Catalogue produits (Épargne, Crédits, Immobilier)
- Actualités + détail d'article
- Module contact (formulaire + carte OSM)
- Navbar/Footer/Layout, design system, animations

### Ce qu'il reste côté **site public** 🔧

| # | Exigence CDC | Statut |
|---|---|---|
| 1 | **FAQ globale** avec recherche, catégories, accordéons | Manquant (seul un FAQ immobilier existe) |
| 2 | **Téléchargement de documents** (médiathèque : formulaires, rapports) | Manquant — boutons "Télécharger" présents mais sans page dédiée |
| 3 | **Liens utiles / Partenaires** (logos, tutelles) | Manquant |
| 4 | **Mentions légales, CGU, Politique DCP** | Manquant |
| 5 | **Recherche intégrée** sur actualités + tags + RSS + partage social | Partiel (filtres oui, recherche/tags/RSS non) |
| 6 | **Pagination** sur la liste des actualités | Manquant |
| 7 | **Multilingue FR + EN** (architecture i18n) | Manquant |
| 8 | **Bandeau cookies** conforme DCP, granulaire par catégorie | Manquant |
| 9 | **SEO** : meta tags par page, sitemap.xml, schema.org (Organization, FAQ, Article) | Partiel (robots.txt OK) |
| 10 | **Accessibilité** : audit ARIA, skip-link, focus visibles | Partiel |
| 11 | **404 stylisée** cohérente avec la charte | À vérifier/refaire |
| 12 | **Page Espace E-MA2E** (landing pour la plateforme adhérent) | Manquant |

---

## Plan proposé — découpé en 4 lots

Je propose de regrouper par lots cohérents pour avancer sans tout faire d'un coup. Tu pourras valider lot par lot.

### Lot 1 — Pages institutionnelles manquantes
- `/faq` — FAQ globale (catégories : Adhésion, Épargne, Crédit, Immobilier, E-MA2E) avec barre de recherche + accordéons
- `/mediatheque` — Médiathèque de documents téléchargeables (formulaires, rapports annuels, statuts) avec filtres
- `/partenaires` — Page partenaires & institutions de tutelle (grille de logos)
- `/mentions-legales`, `/cgu`, `/politique-dcp` — Pages légales
- Mise à jour du **Footer** pour pointer vers ces nouvelles pages

### Lot 2 — Enrichissement Actualités
- Barre de **recherche** (texte libre)
- Système de **tags** en plus des catégories
- **Pagination** (6 articles/page)
- Boutons de **partage social** (Facebook, LinkedIn, X, copier le lien) sur le détail
- Lien **flux RSS** (statique côté front : page `/rss.xml` placeholder)

### Lot 3 — Conformité & SEO
- **Bandeau cookies** dismissible, granulaire (Essentiels / Mesure d'audience / Marketing) avec persistance localStorage
- Composant **SEO** réutilisable (react-helmet-async) : title, description, OG, Twitter card par page
- **Schema.org** JSON-LD : Organization (homepage), FAQPage (faq), Article (news detail)
- **sitemap.xml** statique généré dans `/public`
- **Skip-to-content link**, audit des `aria-label` et focus rings

### Lot 4 — Multilingue + Espace adhérent
- Architecture **i18n** (react-i18next) : extraction des chaînes FR, scaffold EN, sélecteur de langue dans la navbar
- Page **`/espace-ma2e`** : landing présentant la plateforme adhérent (fonctionnalités, tarif 500 F/mois, captures d'écran maquettes, CTA "Se connecter")
- Refonte de la page **404** avec illustration et liens utiles

---

## Question

Quel(s) lot(s) veux-tu que j'attaque maintenant ?

