# DEV-13 — Vérification des 29 règles ANSSI au regard de la dernière version du guide

**Destinataire :** SD_PDCP (MA2E) · **Émetteur :** EBENYX · **Date de la vérification :** 20/10/2026
**Référence :** check-list de recette DCP « FP2020_0018_01 », item Sécurité — tâche DEV-13 du plan d'implémentation DCP v3.

## 1. Conclusion

**La liste des 29 règles figurant dans la check-list est à jour. Aucune règle n'a été ajoutée,
retirée ni modifiée depuis son établissement.**

Le guide dont elle est issue est la note technique ANSSI **« Recommandations pour la sécurisation des
sites web », référence DAT-NT-009/ANSSI/SDE/NP, version 1.0 du 22 avril 2013**. Sa page
« Évolutions du document » ne comporte qu'une seule entrée :

> Date : 22 avril 2013 — Nature des modifications : **Version initiale**

Autrement dit, **cette note n'a jamais été révisée** : la version de 2013 est toujours la dernière
version publiée. Les 29 règles R1 à R29 de la check-list correspondent exactement, et dans le même
ordre, aux 29 recommandations de ce guide. La vérification demandée est donc concluante sans
modification du tableau.

Trois points d'attention subsistent néanmoins, détaillés ci-dessous : une **adresse de référence à
corriger** (§ 2), **trois lignes non renseignées** et non une seule comme indiqué dans le plan (§ 3),
et l'existence d'un **guide ANSSI plus récent et complémentaire** (§ 5).

## 2. Adresse de référence à corriger dans la check-list

La check-list renvoie à deux adresses sur `www.ssi.gouv.fr`. L'ANSSI a depuis migré ses publications
vers `cyber.gouv.fr`. Les anciennes adresses répondent encore, mais il est préférable de citer
l'adresse actuelle dans un document de conformité :

| Dans la check-list | À remplacer par |
|---|---|
| `www.ssi.gouv.fr/entreprise/guide/recommandations-pour-la-securisation-des-sites-web/` | `cyber.gouv.fr/publications/recommandations-pour-la-securisation-des-sites-web` |
| `www.ssi.gouv.fr/uploads/IMG/pdf/NP_Securite_Web_NoteTech.pdf` | lien de téléchargement depuis la page ci-dessus |

Il serait également utile d'ajouter la référence et la version du guide (**DAT-NT-009, v1.0,
22/04/2013**) dans l'en-tête du tableau : la conformité est ainsi rattachée à une version précise, ce
qui évite de refaire cette vérification à chaque recette.

**Divergence de formulation relevée (sans incidence).** Le libellé de la règle R25 dans la check-list
(« Limiter au strict nécessaire les inclusions de contenus tiers. Effectuer au moins quelques
contrôles élémentaires pour s'assurer de la fiabilité du fournisseur de contenu. ») est une
reformulation du texte officiel, qui dit : « Limiter au strict nécessaire les inclusions de contenus
tiers après les avoir contrôler un minimum. » Le sens est identique ; la reformulation corrige une
maladresse de rédaction du guide d'origine. Aucune action requise, signalé pour traçabilité.

## 3. Correction d'un décompte : trois lignes non renseignées, et non une

Le plan d'implémentation indique « 28 OK/NA, 1 point R29 à finaliser ». La relecture du tableau
effectivement rempli montre **trois lignes vides** (ni date, ni statut, ni observation) :

| Règle | Objet | État réel |
|---|---|---|
| **R5** | Accès aux mécanismes d'administration restreint aux seuls postes autorisés | **non renseignée** |
| **R11** | Matrice des flux et filtrage réseau | **non renseignée** |
| **R29** | Politique de journalisation | **non renseignée** (seule ligne identifiée par le plan) |

Le décompte exact est donc : **26 règles renseignées** (23 OK + 3 NA) et **3 à compléter**. Nous
proposons ci-dessous le contenu des trois lignes manquantes.

### 3.1 R11 — Matrice des flux (proposition de réponse : **OK**)

La matrice n'existait pas sous forme documentée ; elle est établie ci-dessous. Elle décrit
l'architecture réellement déployée.

**Flux entrants**

| # | Source | Destination | Protocole | Usage | Contrôle en place |
|---|---|---|---|---|---|
| 1 | Internet | Vercel (`ma2e-connect.vercel.app`) | 443 / TLS | Site public et back-office | HSTS, CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`, `Permissions-Policy` |
| 2 | Vercel | `srv-ma2e.tail4cac84.ts.net` | 443 / TLS | Redirection de `/api/*` et `/documents/uploads/*` | Tunnel Tailscale Funnel : le serveur n'expose pas d'adresse publique directe |
| 3 | Tunnel | Conteneur `ma2e-connect-caddy-1` | 443 | Terminaison TLS et proxy inverse | Caddy, unique point d'entrée applicatif |
| 4 | Caddy | `backend:3000` | HTTP, **réseau Docker privé** | API Express | CORS strict, limitation de débit, authentification JWT, 2FA |
| 5 | `backend` | `db:5432` | PostgreSQL, **réseau Docker privé** | Accès aux données | Compte applicatif dédié ; **port non publié sur l'hôte** |
| 6 | Poste d'administration EBENYX | Serveur OVH | 22 / SSH | Déploiement | Authentification par clé uniquement, via le réseau privé Tailscale |

**Flux sortants**

| # | Source | Destination | Protocole | Usage |
|---|---|---|---|---|
| 7 | `backend` | Serveur SMTP MA2E | 587 / STARTTLS | Notifications de demandes et codes de double authentification |
| 8 | Navigateur du visiteur | Services Google Traduction | 443 / TLS | Traduction du site public (back-office exclu — voir `DCP_COOKIES.md` § 6) |
| 9 | Navigateur du visiteur | `www.openstreetmap.org`, `placehold.co`, `fonts.gstatic.com` | 443 / TLS | Fond de carte, images d'attente, polices |

**Écart à corriger, signalé proactivement.** Le fichier `docker-compose.yml` publie le port du backend
sur l'hôte (`3000:3000`), avec le commentaire « exposé pour le débogage ». En production, le chemin
légitime est exclusivement Caddy → backend via le réseau Docker privé (flux n° 4) : cette publication
est inutile et élargit la surface d'exposition, d'autant que **le serveur OVH est mutualisé avec
d'autres clients**. Nous recommandons de retirer ce mapping en production, ou de le restreindre à
`127.0.0.1`. Correctif non appliqué à ce stade : il touche la configuration de déploiement et doit
être validé puis vérifié sur le serveur.

### 3.2 R29 — Politique de journalisation (proposition de réponse : **à finaliser**)

Les éléments techniques existent ; ce qui manque est la formalisation et, surtout, **les durées de
conservation**, qui dépendent du retour R07 de MA2E.

**Ce qui est journalisé aujourd'hui**

| Journal | Contenu | Emplacement | Conservation actuelle |
|---|---|---|---|
| Journal d'audit applicatif | Toute écriture authentifiée et réussie : adresse électronique et nom de l'auteur, méthode HTTP, chemin, code de retour, horodatage | Table `AuditLog` en base, consultable dans le back-office (menu *Journal d'audit*) | **illimitée — aucune purge** |
| Journaux techniques des conteneurs | Démarrages, erreurs applicatives, accès au proxy | `docker logs` sur le serveur OVH | selon la rotation Docker par défaut |

**Lacunes identifiées, à combler pour clore R29**

1. **Les échecs ne sont pas journalisés.** Le journal d'audit n'enregistre que les actions réussies
   (les réponses en erreur sont ignorées) et uniquement celles d'un utilisateur authentifié. Les
   **tentatives de connexion échouées ne figurent donc pas** dans le journal d'audit, alors qu'elles
   constituent le principal signal d'une attaque par force brute. Le verrouillage de compte après
   5 échecs fonctionne, mais l'événement n'est pas tracé de façon consultable.
2. **Aucune adresse IP n'est enregistrée**, ce qui limite l'analyse a posteriori.
3. **Aucune durée de conservation définie** ni purge automatique du journal d'audit.
4. **Aucune externalisation** des journaux : ils résident sur le serveur concerné, et pourraient donc
   être altérés par un attaquant ayant obtenu un accès — point explicitement soulevé par le guide ANSSI.

**Proposition.** Nous pouvons livrer, dans le même lot que la purge des données (DEV-09) :
journalisation des échecs d'authentification et des verrouillages de compte, enregistrement de
l'adresse IP, et purge automatique du journal selon une durée que MA2E doit fixer (demande R07). La
politique de journalisation elle-même — document court précisant quoi, où, combien de temps et qui
l'analyse — sera rédigée sur cette base et soumise à SD_PDCP.

### 3.3 R5 — Accès à l'administration restreint aux postes autorisés (**décision MA2E requise**)

**État réel :** le back-office est accessible depuis n'importe quelle adresse IP. Il n'y a pas de
restriction réseau. Les contrôles compensatoires en place sont : mot de passe de 12 caractères minimum
avec politique de complexité, double authentification par courriel obligatoire, verrouillage du compte
après 5 échecs, limitation de débit sur la connexion, et journal d'audit des actions.

Nous ne proposons pas de statut nous-mêmes : qualifier cette ligne **OK** ou **KO** dépend d'un choix
d'organisation de MA2E. Trois options :

| Option | Description | Effort | Contrainte pour MA2E |
|---|---|---|---|
| **A** | Statu quo, justifié par les contrôles compensatoires ci-dessus | nul | ligne probablement **KO** ou « OK partiel » à l'appréciation de SD_PDCP |
| **B** | Restriction par liste d'adresses IP autorisées sur les routes d'administration | ~0,5 j | MA2E doit fournir des adresses IP fixes, et les administrateurs ne peuvent plus se connecter hors de ces réseaux |
| **C** | Back-office accessible uniquement via le réseau privé Tailscale | ~1 j | installation d'un client sur chaque poste d'administration |

**Question à MA2E :** les postes d'administration disposent-ils d'adresses IP publiques fixes, et les
administrateurs doivent-ils pouvoir se connecter depuis l'extérieur (télétravail, déplacement) ?

## 4. Tableau des 29 règles — statut après vérification

Aucune modification de libellé. Les 26 lignes déjà renseignées restent valides ; les observations
portées au 14/09/2026 ont été recontrôlées et demeurent exactes, y compris après les correctifs du
pentest applicatif GS2E d'août 2026 et la mise en conformité DCP des formulaires d'octobre 2026.

| Règles | Statut | Commentaire |
|---|---|---|
| R1–R4, R6–R10, R12–R15, R18–R20, R22–R28 | **OK** (23) | inchangé |
| R16, R17, R21 | **NA** (3) | pas de redirection dynamique, pas d'inclusion de fichier par donnée externe, session par jeton et non par cookie |
| **R5** | à décider | voir § 3.3 |
| **R11** | **OK** proposé | matrice fournie au § 3.1 |
| **R29** | à finaliser | voir § 3.2, dépend de R07 |

## 5. Un guide ANSSI plus récent existe — proposition d'arbitrage

La note DAT-NT-009 de 2013 n'est pas obsolète et reste publiée, mais l'ANSSI a depuis édité un guide
distinct et plus exigeant sur les aspects navigateur :

> **ANSSI-PA-009, version 2.0 du 28 avril 2021** — « Recommandations pour la mise en œuvre d'un site
> web : maîtriser les standards de sécurité côté navigateur » — **63 recommandations**.

Ce guide **complète** la note de 2013 sans la remplacer : il traite en détail HTTPS et HSTS, la
politique de sécurité de contenu (CSP), l'intégrité des ressources externes, la protection contre le
détournement de clic, la politique de *referrer*, les attributs de cookies et la protection CSRF.

**Plusieurs de ses recommandations sont déjà satisfaites** par le site, en particulier celles portant
sur HTTPS et HSTS, la CSP, l'en-tête de politique de *referrer*, la protection contre le détournement
de clic, le type de contenu explicite, et le format non exécutable des réponses d'API.

**Arbitrage demandé à SD_PDCP :** souhaitez-vous que la check-list reste cadrée sur les 29 règles de
2013 — périmètre inchangé, ce qui est la lecture stricte de l'item Sécurité — ou faut-il y ajouter une
section dédiée au guide de 2021 ? Dans ce second cas, nous estimons à **1 à 1,5 jour** l'évaluation
des 63 recommandations et le renseignement du tableau correspondant.

---

*Document établi par EBENYX à l'appui de la tâche DEV-13. La version et la date du guide ont été
relevées sur le document lui-même ; la note officielle n'étant pas téléchargeable par script depuis
`ssi.gouv.fr` (protection anti-robot), le texte a été consulté via une copie publique en ligne du même
document, dont la référence et la pagination ont été confrontées à celles de la page officielle.*
