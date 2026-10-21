# DEV-04 — Cookies et traceurs du site MA2E : constat technique

**Destinataire :** SD_PDCP (MA2E) · **Émetteur :** EBENYX · **Date des mesures :** 20/10/2026
**Périmètre :** https://ma2e-connect.vercel.app
**Référence :** check-list de recette DCP « FP2020_0018_01 », item Cookies — tâche DEV-04 du plan d'implémentation DCP v3.

## 1. Conclusion

**Le site ne dépose aucun cookie de suivi, aucun cookie publicitaire et aucun cookie tiers.**

En navigation normale (langue française, aucune interaction), le site ne dépose **strictement rien** :
aucun cookie, aucune entrée de stockage local ou de session.

Un **unique cookie** peut apparaître, et seulement si le visiteur change lui-même la langue
d'affichage : le cookie `googtrans`. Il est **technique**, **de session**, **de première partie**, et ne
contient qu'un code de langue. Il n'identifie pas le visiteur et ne permet aucun suivi.

Les deux éléments sur lesquels portait la vérification de SD_PDCP sont donc confirmés conformes :

| Élément vérifié | Résultat |
|---|---|
| Matomo | **Non déployé.** Aucun traceur chargé, aucun cookie, aucune requête. |
| Widget Google Traduction | **1 cookie technique de session** (`googtrans`), déposé par le site lui-même, pas par Google. |

## 2. Matomo — traceur absent du site

Matomo n'est **pas** actif. La preuve est établie à trois niveaux indépendants.

**a) Code source** — `src/lib/matomo.ts` conditionne tout le traceur à deux paramètres de build :

```ts
export const matomoEnabled = Boolean(MATOMO_URL && SITE_ID);   // VITE_MATOMO_URL + VITE_MATOMO_SITE_ID
export function initMatomo() { if (!matomoEnabled || …) return; … }
```

**b) Bundle de production réellement servi** (`/assets/index-qj7IYPph.js`) — les deux paramètres sont
compilés à la valeur « non défini », donc l'indicateur d'activation est figé à *faux* :

```js
Ud = void 0,  iM = void 0,  b1 = !!Ud     // URL Matomo indéfinie, ID de site indéfini → activation = false
```

**c) Comportement observé en production** — sur 4 pages visitées dans un navigateur vierge
(`/`, `/contact`, `/adhesion`, `/produits/epargne`) :

- aucune requête vers un serveur Matomo (`matomo.js`, `matomo.php`) : **0** ;
- la variable globale du traceur (`window._paq`) **n'existe pas** ;
- aucun cookie déposé.

> À noter pour l'avenir : si MA2E décidait un jour d'activer Matomo, la configuration en place force
> déjà le respect du signal « Do Not Track » et viserait une instance **auto-hébergée**. Toute
> activation devrait faire l'objet d'une validation DCP préalable ; ce n'est pas d'actualité à ce jour.

## 3. Widget Google Traduction — le cookie `googtrans`

### 3.1 Nature exacte

Contrairement à ce que l'on pourrait supposer, **ce cookie n'est pas déposé par Google** : il est écrit
par le code du site (`src/lib/translate.ts`) lorsque le visiteur sélectionne une langue.
Caractéristiques mesurées :

| Caractéristique | Valeur constatée |
|---|---|
| Nom | `googtrans` |
| Domaine | `ma2e-connect.vercel.app` — **cookie de première partie** |
| Chemin | `/` |
| Valeur | `/fr/en` (uniquement : langue source / langue cible) |
| Durée de vie | **Aucune expiration définie → cookie de session**, supprimé à la fermeture du navigateur |
| `HttpOnly` | non (nécessairement : le sélecteur de langue le lit en JavaScript) |
| `SameSite` | `Lax` |
| Déposé par | le site MA2E lui-même, pas par un tiers |

**Qualification DCP :** cookie strictement **technique / fonctionnel**. Il mémorise une préférence
d'affichage exprimée par le visiteur, ne contient **aucun identifiant** ni donnée personnelle, et
disparaît à la fermeture du navigateur. Il relève des cookies strictement nécessaires au service
demandé par l'utilisateur, exemptés de consentement.

### 3.2 Mesure du cycle complet

| Phase | Cookies | Stockage local | Stockage de session |
|---|---|---|---|
| Visite normale, français, aucune interaction (4 pages) | **aucun** | vide | vide |
| Après changement de langue vers l'anglais | `googtrans=/fr/en` (session) | vide | vide |

### 3.3 Les données saisies dans les formulaires ne sont pas transmises à Google

Point vérifié spécifiquement, car il conditionne la conformité des 4 formulaires : une valeur témoin a
été saisie dans un champ de formulaire, page affichée en anglais. **Cette valeur n'apparaît dans
aucune des requêtes envoyées à Google.** Le widget ne traduit que les textes de l'interface présents
dans la page (libellés, titres, menus) ; il ne lit pas et ne transmet pas le contenu des champs
remplis par le visiteur.

## 4. Autres cookies : aucun

| Candidat | Statut |
|---|---|
| Cookie de session applicative | **Aucun.** L'authentification du back-office repose sur un jeton transmis en en-tête `Authorization`, pas sur un cookie. |
| Cookie d'analyse ou publicitaire | **Aucun.** |
| `sidebar:state` (cookie prévu par la bibliothèque d'interface shadcn/ui) | **Jamais déposé** : le composant concerné n'est importé par aucune page. Signalé par souci d'exhaustivité. |
| reCAPTCHA | **Non utilisé.** La protection anti-abus des formulaires publics repose sur une limitation de débit côté serveur, sans cookie ni appel à un tiers. |

## 5. Services tiers contactés (sans dépôt de cookie)

Distinction importante : **aucun cookie tiers n'est déposé**, mais le navigateur du visiteur contacte
bien quelques domaines externes, ce qui leur expose son adresse IP. Inventaire exhaustif :

| Domaine | Rôle | Cookie déposé |
|---|---|---|
| `translate.google.com`, `translate.googleapis.com`, `translate-pa.googleapis.com` | widget de traduction | non |
| `www.gstatic.com`, `fonts.gstatic.com`, `www.google.com` | ressources statiques et polices du widget | non |
| `www.openstreetmap.org` | fond de carte de la page Contact | non |
| `placehold.co` | images d'attente de certaines illustrations | non |

Le widget de traduction est chargé sur toutes les pages, y compris lorsque le visiteur reste en
français. Si MA2E souhaite supprimer cette exposition en navigation française, le chargement peut
être conditionné à la sélection effective d'une langue étrangère : évolution simple, à arbitrer par
SD_PDCP, sans incidence sur la conformité « cookies » constatée ci-dessus.

## 6. Point signalé proactivement : traduction du back-office

Conformément au point d'attention de la fiche DEV-04, nous signalons de notre propre initiative un
constat fait pendant cette vérification. Il ne s'agit **pas** d'un cookie de suivi.

**Constat.** Le widget de traduction était chargé sur l'ensemble du site, **y compris les pages du
back-office**. Un administrateur ayant basculé l'affichage en langue étrangère aurait donc fait
traduire les écrans de gestion, ce qui aurait transmis à Google les textes affichés — dont des données
personnelles de sociétaires (noms, adresses électroniques, contenu des demandes). Vérifié en
conditions réelles : un bloc de texte non protégé est bien transmis au service de traduction de Google.

**Correctif appliqué le 20/10/2026.** Le back-office est désormais exclu du périmètre de traduction
(attribut d'exclusion `notranslate` sur le conteneur racine des pages d'administration,
`src/components/layout/AdminLayout.tsx`). Efficacité vérifiée par la mesure : un bloc ainsi protégé
**n'apparaît plus** dans les données envoyées à Google, alors qu'un bloc non protégé y figure. Le
multilingue du site public reste pleinement fonctionnel.

**Aucune donnée personnelle n'est exposée du fait du site public** : les pages publiques ne contiennent
pas de données de sociétaires, et les champs de formulaire ne sont pas transmis (§ 3.3).

## 7. Conséquence sur la check-list : lien « Cookies »

Le site n'utilisant que le cookie technique décrit au § 3, et aucun cookie soumis à consentement,
l'analyse de SD_PDCP selon laquelle **aucun lien « Cookies » ni bandeau de consentement n'est
nécessaire** est confirmée par les mesures.

Si SD_PDCP préfère néanmoins une transparence explicite, nous pouvons publier une courte section
« Cookies » dans la page *Données Personnelles*, reprenant le tableau du § 3.1. Ce texte est
modifiable depuis le back-office et ne nécessite aucune nouvelle livraison.

## 8. Reproductibilité

Les mesures ont été réalisées avec un navigateur Chromium automatisé (Playwright), dans un profil
vierge sans cookie préexistant, directement contre le site de production. La méthode est
reproductible : ouverture d'un contexte neuf, visite des pages, puis énumération de l'intégralité des
cookies du contexte, du stockage local, du stockage de session et de toutes les requêtes réseau
sortantes. SD_PDCP peut obtenir le même résultat manuellement via l'onglet *Application → Cookies*
des outils de développement d'un navigateur, en navigation privée.

---

*Document établi par EBENYX à l'appui de la tâche DEV-04. Les constats des § 2, 3 et 6 sont des
mesures effectuées sur l'environnement de production, et non de simples déclarations.*
