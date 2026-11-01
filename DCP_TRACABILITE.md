# Mise en conformité DCP — ce qui était demandé, ce qui a été livré, et où

**Destinataire :** SD_PDCP (MA2E) · **Émetteur :** EBENYX · **Date :** 26/10/2026
**Périmètre :** https://ma2e-connect.vercel.app
**Références :** check-list de recette DCP « FP2020_0018_01 », commentaires de relecture SD_PDCP du
06/10/2026 · plan d'implémentation DCP v3 du 19/10/2026 (tâches DEV-01 à DEV-13).

Ce document répond à une seule question, pour chaque demande de la check-list : **qu'est-ce qui a été
fait, et à quel endroit ?** Il sert de table de correspondance entre les instructions de SD_PDCP et le
site réellement déployé. Les chemins de fichiers sont donnés pour permettre une revue de code ; les
écrans et réglages sont donnés pour permettre une vérification depuis un navigateur, sans compétence
technique (le détail des manipulations figure dans `CAHIER_RECETTE_DCP.md`).

**Tout ce qui est marqué « livré » est en production depuis le 21/10/2026**, back-end (serveur OVH) et
front (Vercel) compris.

---

## 1. Vue d'ensemble

| Tâche | Objet | État | Livré le |
|---|---|---|---|
| DEV-01 | Preuve de lecture des TCU | **Livré** | 20/10/2026 |
| DEV-02 | Texte des mentions légales | **Bloqué** — texte attendu de SD_PDCP (R02) | — |
| DEV-03 | Intitulé exact du lien « Données Personnelles » | **Livré** | 20/10/2026 |
| DEV-04 | Absence de cookies de suivi, documentée | **Livré** | 21/10/2026 |
| DEV-05 | Mention d'information DCP en tête des formulaires | **Livré** (texte provisoire, éditable) | 20/10/2026 |
| DEV-06 | Mention « champs obligatoires » | **Livré** | 20/10/2026 |
| DEV-07 | Case de consentement + trace + retrait | **Livré** | 20/10/2026 |
| DEV-08 | Encadrement des zones de commentaire libre | **Livré** (texte provisoire) | 20/10/2026 |
| DEV-09 | Conservation et purge de fin de conservation | **Livré inerte** — durées attendues (R07) | 21/10/2026 |
| DEV-10 | Mécanismes d'exercice des droits | **Livré** (4 droits sur 5 — voir § 3) | 21/10/2026 |
| DEV-11 | Formulaire d'exercice des droits en ligne | **Non développé** — proposition en attente (R06) | — |
| DEV-12 | Formulaire d'autorisation d'utilisation de l'image | **Bloqué** — formulaire attendu de SD_PDCP (R04) | — |
| DEV-13 | Vérification des 29 règles ANSSI | **Livré** | 21/10/2026 |
| R29 | Politique de journalisation | **Livré partiellement** — réserve sur l'adresse IP (§ 3) | 21/10/2026 |

**Bilan : 10 tâches livrées sur 13**, 2 bloquées par un retour attendu de SD_PDCP, 1 non développée
faute de validation. Les trois tâches non livrées ne dépendent pas d'EBENYX.

Quatre livraisons successives, toutes traçables dans l'historique du dépôt :

| Commit | Date | Contenu |
|---|---|---|
| `f47e08b` | 20/10/2026 | Lot A — mentions DCP, consentement, preuve de lecture (DEV-01, 03, 05, 06, 07, 08) |
| `8a7dcdd` | 21/10/2026 | Lot B — droits des personnes et purge (DEV-09, DEV-10) + documents DEV-04 et DEV-13 |
| `7e83f3a` | 21/10/2026 | R29 — journalisation des événements d'authentification + cahier de recette |
| `6a648c3` | 21/10/2026 | Correction documentaire — réserve sur la valeur de l'adresse IP journalisée |

---

## 2. Détail par tâche — ce qui a été ajouté, et où

### DEV-01 — Preuve de lecture des TCU
*Réf. check-list : item 01 (TCU).*

**Demandé.** Recueillir et conserver la preuve de lecture des TCU, sans ajouter de case de
consentement supplémentaire (la relation sociétaire est un contrat d'adhésion).

**Fait.** À chaque soumission du formulaire d'adhésion, la date et la **version du texte des TCU
réellement affichée** sont enregistrées. La case à cocher préexistante, décochée par défaut, est
conservée telle quelle — aucune case n'a été ajoutée, conformément à la consigne.

**Point de conception à signaler :** la date et la version sont déterminées **côté serveur**, à partir
du réglage en vigueur, et non envoyées par le navigateur. Un appelant ne peut donc pas forger une
version, et la preuve correspond au texte qui a effectivement été servi.

| Où | Quoi |
|---|---|
| `backend/src/lib/consent.ts` | calcul de la date et de la version côté serveur |
| `backend/prisma/schema.prisma` | champs `Application.consentAt` / `consentVersion` |
| `src/pages/admin/ApplicationsManager.tsx` | affichage de la preuve dans le dossier, et export CSV |
| `src/pages/Adhesion.tsx` | case à cocher existante, inchangée |

**Vérification :** cahier de recette, tests C-01 à C-08.

### DEV-03 — Intitulé exact du lien « Données Personnelles »
*Réf. check-list : item 02.*

**Demandé.** Le lien doit s'intituler exactement « Données Personnelles ».

**Fait.** Le pied de page affichait « Politique DCP » : l'intitulé a été corrigé mot pour mot. L'écart
était donc réel, contrairement à ce qu'EBENYX avait estimé lors de la première recette.

| Où | Quoi |
|---|---|
| `src/lib/i18n.ts` (clé `dcp`) | intitulé du lien de pied de page |
| `src/pages/legal/PolitiqueDcp.tsx` (route `/politique-dcp`) | page de destination, inchangée |

### DEV-04 — Absence de cookies de suivi, documentée
*Réf. check-list : item 03 (Cookies).*

**Demandé.** Documenter le fonctionnement de Matomo et du cookie `googtrans` avant la vérification de
SD_PDCP.

**Fait.** Note de constat technique livrée, appuyée sur des **mesures** et non sur des déclarations :
aucun cookie ni stockage local en navigation normale ; `googtrans` est un cookie de session de
première partie écrit par le site lui-même et ne contenant qu'un code de langue ; Matomo est inerte,
prouvé à trois niveaux (code source, bundle réellement servi, comportement observé).

**Écart signalé de notre propre initiative, et corrigé dans la même livraison :** le widget de
traduction s'appliquait aussi au **back-office**. Un administrateur passant l'affichage en langue
étrangère aurait fait traduire ses écrans de gestion, donc transmis à Google des données de
sociétaires. Une exclusion locale `notranslate` a été posée sur le conteneur racine des pages
d'administration, et son efficacité vérifiée par la mesure. L'exclusion est volontairement **locale** :
une balise globale aurait désactivé le multilingue du site public.

| Où | Quoi |
|---|---|
| `DCP_COOKIES.md` | note de constat livrée à SD_PDCP (méthode reproductible au § 8) |
| `src/components/layout/AdminLayout.tsx` | exclusion `notranslate` du back-office |

**Vérification :** cahier de recette, tests K-01 à K-04.

### DEV-05 et DEV-06 — Mention d'information DCP et mention « champs obligatoires »
*Réf. check-list : les 4 formulaires (remontés KO).*

**Demandé.** Une mention intitulée « Données Personnelles », visible **en tête** de chaque formulaire
collectant des DCP, et l'indication explicite de ce que signifie l'astérisque.

**Fait.** Un composant partagé unique affiche, en tête de formulaire, la mention d'information et le
rappel « les champs marqués d'un astérisque sont obligatoires ». Sur le formulaire de Contact,
l'ancienne notice repliée en bas de page — explicitement remontée KO — a été supprimée.

**Correspondance avec les 4 formulaires de la check-list :** l'application en compte trois, car la
*demande de produit/service* et la *demande de renseignement* sont servies par le **même composant**,
instancié sur les pages Épargne, Crédits et Immobilier.

| Où | Quoi |
|---|---|
| `src/components/forms/DcpNotice.tsx` | composant de mention (+ consigne de texte libre) |
| `src/data/formsDcp.ts` | textes par défaut |
| `src/pages/admin/SettingsManager.tsx` | **édition des textes au back-office** : *Réglages > Légal > « Mentions DCP des formulaires »* |
| `src/pages/Adhesion.tsx`, `src/pages/Contact.tsx`, `src/components/forms/ProductRequestForm.tsx` | affichage en tête des 3 formulaires |

**Réserve assumée.** Les textes actuellement affichés sont **provisoires** et n'engagent **aucune durée
de conservation chiffrée**, en attente de la mention d'information définitive de SD_PDCP (R02). Ils
sont éditables depuis le back-office : à réception du texte, il suffira de le coller — **aucun
redéploiement ne sera nécessaire**.

**Vérification :** cahier de recette, tests F-01 à F-09.

### DEV-07 — Consentement, sa trace et son retrait
*Réf. check-list : formulaires Contact et Demande de renseignement.*

**Demandé.** Case de consentement non cochée par défaut, conservation de la trace, et mention du
retrait possible.

**Fait.** La case existait sur Contact ; elle a été ajoutée sur la demande de produit/renseignement,
décochée par défaut. La trace est horodatée et versionnée comme pour les TCU. La mention du retrait
(via le formulaire de contact) figure dans la mention d'information.

**Durcissement ajouté :** le consentement est désormais **exigé par l'API**, et non seulement par le
navigateur — une soumission sans consentement est refusée avec un code 400. Une validation purement
côté client aurait été contournable.

| Où | Quoi |
|---|---|
| `src/components/forms/ProductRequestForm.tsx` | case décochée par défaut, obligatoire |
| `backend/src/routes/applications.ts`, `backend/src/routes/contact.ts` | refus serveur si consentement absent |
| `backend/prisma/schema.prisma` | `ContactMessage.consentAt` / `consentVersion` |
| `src/pages/admin/ContactManager.tsx` | affichage de la preuve de consentement |

### DEV-08 — Encadrement des zones de commentaire libre
*Réf. check-list : 4 formulaires — 6 principes RGPD rappelés par SD_PDCP.*

**Demandé.** Une consigne au-dessus de chaque zone de texte libre, un accès restreint, et un
rattachement au mécanisme de purge.

**Fait.** Consigne courte affichée au-dessus des zones de commentaire (ne pas y saisir de données
sensibles ni d'informations inutiles). L'accès au contenu reste réservé aux comptes habilités du
back-office, et ces champs sont couverts par la purge livrée en DEV-09.

| Où | Quoi |
|---|---|
| `src/components/forms/DcpNotice.tsx` (`FreeTextHint`) | consigne de cadrage |
| `src/pages/Contact.tsx`, `src/components/forms/ProductRequestForm.tsx` | affichage au-dessus des zones de texte libre |

**Réserve :** le texte de cadrage définitif relève de la mention d'information attendue de SD_PDCP
(R02). Ce point ne peut donc pas être considéré comme clos tant que cette mention n'est pas reçue.

### DEV-09 — Conservation et purge de fin de conservation
*Réf. check-list : tous formulaires (remonté KO).*

**Demandé.** Un mécanisme identifiant les données arrivées en fin de conservation et déclenchant leur
suppression ou leur anonymisation.

**Fait.** Durées paramétrables **par source** (demandes, messages de contact, journal d'activité),
rapport des enregistrements arrivés à échéance, purge manuelle et passe automatique quotidienne.

**Livré volontairement inerte**, conformément au point d'attention de la fiche : **sans durée
renseignée, aucune purge n'a lieu** (l'API répond 409 et l'automatisme est désactivé). Le mécanisme
s'activera à réception des durées validées par MA2E (R07). Aucune donnée réelle ne peut donc être
détruite par inadvertance avant cette validation.

| Où | Quoi |
|---|---|
| `backend/src/lib/dcp.ts` | calcul des échéances, anonymisation, suppression |
| `backend/src/routes/dcp.ts` | `/retention` (lecture et réglage), `/purge` |
| `backend/src/index.ts` | passe quotidienne automatique |
| `src/pages/admin/DcpManager.tsx` | écran de réglage des durées et de purge |

**Vérification :** cahier de recette, tests P-01 à P-07. Le test P-04 prouve le calcul avec une durée
de 600 mois — aucune donnée du site n'a cinquante ans — ce qui démontre le mécanisme sans risquer
d'anonymiser quoi que ce soit.

### DEV-10 — Mécanismes d'exercice des droits
*Réf. check-list : item 07 (Droits des personnes).*

**Demandé.** Des mécanismes d'accès, de suppression/effacement, de rectification et de portabilité,
fiables et traçables, pouvant être opérés par un administrateur habilité.

**Fait.** Un écran dédié « **Droits des personnes** » au back-office, réservé aux **administrateurs**
(l'API refuse un éditeur, même gestionnaire des demandes) :

- **accès** : recherche par e-mail, nom, téléphone, matricule ou référence, restituant un dossier qui
  regroupe les demandes, les messages de contact et les comptes back-office de la personne ;
- **portabilité** : export JSON et CSV (CSV généré côté serveur, avec BOM UTF-8 pour une ouverture
  correcte dans Excel) ;
- **rectification** : correction des données d'identité d'un enregistrement ;
- **effacement** : au choix **anonymisation** (identité et pièces retirées, la ligne subsiste pour les
  statistiques d'adhésion) ou **suppression**, avec confirmation par e-mail à la personne concernée.

**Deux garde-fous conçus pour cette tâche.** L'effacement ne porte que sur des identifiants
**explicitement désignés** par l'administrateur, jamais sur « tout ce qui ressemble à ce nom » : une
homonymie ne doit pas détruire le dossier d'un tiers. Et **toute opération, consultation comprise**,
est inscrite dans un registre dédié conservant qui a fait quoi, quand, et sur combien
d'enregistrements — c'est ce registre qui rend les mécanismes traçables au sens de la fiche.

Les **pièces justificatives** (pièces d'identité, photographies) sont effacées du disque dans les deux
modes : ce sont les données les plus sensibles du dossier.

| Où | Quoi |
|---|---|
| `src/pages/admin/DcpManager.tsx` | écran « Droits des personnes » |
| `src/components/layout/AdminLayout.tsx` | entrée de menu, réservée aux administrateurs |
| `backend/src/routes/dcp.ts` | `/subject`, `/subject.csv`, `/application/:id`, `/contact/:id`, `/erase`, `/actions` |
| `backend/prisma/schema.prisma` | modèle `DcpAction` (registre) et `Application.anonymizedAt` |
| `backend/src/lib/appDocs.ts` | suppression des pièces justificatives sur le disque |
| `backend/src/lib/mailer.ts` | courriel de confirmation à la personne concernée |

**Vérification :** cahier de recette, tests D-01 à D-11.

### DEV-13 et R29 — Sécurité : 29 règles ANSSI et politique de journalisation
*Réf. check-list : item 09 (Sécurité ANSSI).*

**Demandé.** Vérifier la liste des 29 règles au regard de la dernière version du guide, et définir une
politique de journalisation (R29).

**Fait — vérification des règles.** La liste est à jour : le guide **DAT-NT-009 n'a jamais été révisé
depuis le 22/04/2013**. Aucune règle n'a été ajoutée, retirée ni modifiée.

**Trois corrections apportées au passage, dont une qui contredit le plan :**

1. le plan annonçait « 28 OK/NA, 1 point à finaliser » ; la relecture du tableau montre **trois lignes
   vides** (R5, R11, R29), et non une ;
2. la **matrice des flux** (R11) n'existait pas sous forme documentée : elle a été établie, entrants et
   sortants ;
3. l'adresse de référence du guide est à corriger dans la check-list (l'ANSSI a migré ses publications
   de `ssi.gouv.fr` vers `cyber.gouv.fr`).

**Fait — journalisation (R29).** Le journal ne consignait que les écritures **réussies** d'un
utilisateur **déjà authentifié** : une tentative de connexion refusée ne laissait aucune trace, alors
que c'est le principal signal d'une attaque par force brute. Sont désormais consignés, chacun avec
l'adresse de l'appelant : connexion réussie **en précisant la voie** (code reçu par courriel, code de
secours, lien à usage unique), mot de passe incorrect avec le rang de l'échec, identifiant inconnu,
compte en attente d'activation, verrouillage après 5 échecs, tentative sur un compte verrouillé, code
de vérification incorrect, et abandon après trop de codes erronés.

**Pourquoi journaliser aussi les succès :** c'est l'enchaînement qui porte l'information. Une série
d'échecs **suivie d'une connexion réussie depuis la même adresse** est la signature d'une force brute
aboutie ; journaliser les échecs seuls ne l'aurait pas dit.

| Où | Quoi |
|---|---|
| `DCP_ANSSI.md` | note de vérification, matrice des flux (§ 3.1), politique de journalisation (§ 3.2) |
| `backend/src/lib/audit.ts` | adresse de l'appelant, fonction de journalisation des événements d'authentification |
| `backend/src/routes/auth.ts` | les 9 points de journalisation |
| `backend/prisma/schema.prisma` | `AuditLog.ip`, `AuditLog.detail`, index sur `createdAt` |
| `src/pages/admin/AuditLog.tsx` | affichage du code de retour, du libellé et de l'adresse IP |

**Vérification :** cahier de recette, tests J-01 à J-08. **Réserve importante sur la valeur de
l'adresse IP : voir § 3.**

### Mesures de sécurité connexes, réutilisées
Antérieures à la campagne DCP mais directement utiles aux items *Sécurité* et *Habilitations*
(commit `80a03e6`, 08/09/2026) : mot de passe de 12 caractères minimum avec politique de complexité,
expiration à 42 jours, historique des 5 derniers mots de passe, verrouillage après 5 échecs réservé à
l'administrateur pour le déverrouillage, et création de compte **par invitation** (lien à usage unique,
l'administrateur ne saisit plus de mot de passe).
*Où :* `backend/src/lib/passwordPolicy.ts`, `backend/src/routes/auth.ts`, `backend/src/routes/users.ts`,
`src/pages/admin/Activation.tsx`.

---

## 3. Ce qui reste ouvert — et de qui cela dépend

### Ne dépend pas d'EBENYX

| Point | Nature | Conséquence aujourd'hui |
|---|---|---|
| **R02** — texte des mentions légales et mention d'information DCP | texte attendu de SD_PDCP | DEV-02 non livré ; les textes des formulaires restent provisoires (DEV-05, DEV-08) |
| **R07** — durées de conservation | décision MA2E | la purge reste inerte ; la conservation est de fait illimitée, journal compris |
| **R04** — formulaire d'autorisation d'utilisation de l'image | formulaire attendu de SD_PDCP | DEV-12 non livré ; les personnes affichées sur le site ne sont pas encore couvertes par une autorisation signée |
| **R06** — formulaire d'exercice des droits en ligne | opportunité à valider par MA2E | DEV-11 non développé, pour ne pas construire une fonction non souhaitée |
| **R5** (règle ANSSI) — restriction de l'accès à l'administration | choix d'organisation MA2E | ligne non statuée ; trois options chiffrées proposées dans `DCP_ANSSI.md` § 3.3 |
| Déclaration des traitements à l'ARTCI | obligation du responsable de traitement | EBENYX opère ces traitements pour le compte de MA2E ; la déclaration incombe à MA2E |

### Réserves techniques assumées par EBENYX

**1. Valeur de l'adresse IP journalisée.** Les événements sont correctement journalisés, mais
l'adresse enregistrée est celle du **dernier relais interne**, identique pour tous les visiteurs, et
non celle du visiteur. La chaîne d'exposition compte plusieurs relais (Vercel, tunnel, proxy inverse)
alors que l'application n'en déclare qu'un seul. **Mesuré le 22/10/2026** par trois sondes : par le
chemin public l'adresse retenue est constamment interne ; en revanche, un appelant atteignant
directement l'API depuis le réseau interne peut **écrire l'adresse de son choix** dans le journal.

Le correctif n'a pas été appliqué à l'aveugle : déclarer un nombre de relais trop élevé rendrait
l'adresse falsifiable, donc le journal manipulable — l'inverse du but recherché. Il faut d'abord
réduire l'exposition à un seul chemin d'entrée, puis faire **remplacer** l'en-tête au premier relais
maîtrisé. R29 est donc déclaré **« OK partiel »**, et la colonne d'adresse du cahier de recette est à
noter **KO** jusqu'au correctif.

**2. Droit de limitation non outillé.** La check-list énumère cinq droits ; quatre sont outillés
(accès, rectification, extraction, effacement/anonymisation). La **limitation** ne l'est pas. À
développer si MA2E le demande.

**3. Journaux non externalisés.** Les journaux résident sur le serveur qu'ils tracent et pourraient
donc être altérés par un attaquant ayant obtenu un accès — point explicitement soulevé par le guide
ANSSI. Y remédier suppose un service de collecte distinct : c'est un choix d'hébergement et de coût, à
arbitrer avec MA2E.

**4. Hébergement hors CEDEAO — point relevé le 22/10/2026.** Le site public est hébergé sur **Vercel**
(société américaine) et l'API ainsi que la base de données sur un serveur **OVH en France**
(l'adresse publique du serveur est enregistrée au RIPE comme OVH SAS, France). Or la check-list v4
répond « Oui, Côte d'Ivoire » à la ligne *Site hébergé dans un pays de la CEDEAO ?* et « Prestataire
situé en Côte d'Ivoire » — **deux lignes qui avaient été laissées vides par EBENYX et renseignées lors
de la relecture**. La situation réelle est un hébergement hors CEDEAO, ce qui appelle l'information de
l'ARTCI et une demande d'autorisation de transfert, formalités qui relèvent du responsable de
traitement. Nous signalons cet écart pour correction de la check-list.

---

## 4. Comment vérifier

`CAHIER_RECETTE_DCP.md` (livré le 21/10/2026) contient **57 tests** jouables depuis un navigateur par
une personne non technique, avec une fiche de résultats à viser, répartis ainsi :

| Série | Objet | Items couverts |
|---|---|---|
| F-01 → F-09 | Mentions et formulaires | DEV-05, DEV-06, DEV-08 |
| C-01 → C-08 | Consentement et preuve de lecture des TCU | DEV-01, DEV-07 |
| D-01 → D-11 | Les quatre droits et le registre | DEV-10 |
| P-01 → P-07 | Conservation et purge | DEV-09 |
| J-01 → J-08 | Journalisation | R29 |
| H-01 → H-04 | Cloisonnement des accès | item Sécurité |
| K-01 → K-04 | Cookies et traduction | DEV-04 |
| T-01 → T-06 | Contrôles techniques | — |

Le jeu de données de test est **créé par les formulaires publics eux-mêmes** : les tests d'effacement
et de purge ne touchent jamais un dossier réel.

Côté développement, la non-régression est tenue par **76 tests automatisés** exécutés à chaque
livraison (25 d'entre eux portent spécifiquement sur les items DCP de ce document).

---

## 5. Récapitulatif des fichiers livrés

**Ajoutés**

| Fichier | Rôle |
|---|---|
| `src/components/forms/DcpNotice.tsx` | mention d'information DCP et consigne de texte libre |
| `src/data/formsDcp.ts` | textes par défaut des mentions |
| `src/pages/admin/DcpManager.tsx` | écran « Droits des personnes » (droits, conservation, purge, registre) |
| `backend/src/lib/consent.ts` | preuve de consentement et de lecture, calculée côté serveur |
| `backend/src/lib/dcp.ts` | moteur des droits, de l'anonymisation et de la purge |
| `backend/src/routes/dcp.ts` | API des droits et de la conservation |
| `backend/src/lib/appDocs.ts` | gestion du dossier privé des pièces justificatives |
| `DCP_COOKIES.md` | constat technique sur les cookies (DEV-04) |
| `DCP_ANSSI.md` | vérification des 29 règles, matrice des flux, politique de journalisation |
| `CAHIER_RECETTE_DCP.md` | cahier de recette de 57 tests |

**Modifiés**

| Fichier | Modification |
|---|---|
| `backend/prisma/schema.prisma` | `consentAt`/`consentVersion` (demandes et messages), `anonymizedAt`, modèle `DcpAction`, `AuditLog.ip`/`detail` + index |
| `backend/src/lib/audit.ts`, `backend/src/routes/auth.ts` | journalisation des événements d'authentification avec adresse IP |
| `backend/src/routes/applications.ts`, `backend/src/routes/contact.ts` | consentement exigé côté serveur |
| `backend/src/index.ts` | passe de purge quotidienne |
| `src/pages/Adhesion.tsx`, `src/pages/Contact.tsx`, `src/components/forms/ProductRequestForm.tsx` | mention en tête, consentement, consigne de texte libre |
| `src/pages/admin/ApplicationsManager.tsx`, `src/pages/admin/ContactManager.tsx` | affichage des preuves de consentement |
| `src/pages/admin/SettingsManager.tsx` | édition des mentions DCP au back-office |
| `src/pages/admin/AuditLog.tsx` | code de retour, libellé et adresse IP au journal |
| `src/components/layout/AdminLayout.tsx` | entrée de menu « Droits des personnes » ; exclusion `notranslate` |
| `src/lib/i18n.ts` | intitulé « Données Personnelles » |

Toutes les modifications de schéma sont **non destructives** et appliquées automatiquement au
démarrage du conteneur ; les enregistrements antérieurs restent à `null` et sont affichés comme « non
enregistrée » plutôt que supposés conformes.

---

*Document établi par EBENYX. Les dates sont celles de l'historique du dépôt ; les constats techniques
des § 2 (DEV-04) et § 3 (adresse IP, hébergement) sont des mesures effectuées sur l'environnement de
production, et non des déclarations.*
