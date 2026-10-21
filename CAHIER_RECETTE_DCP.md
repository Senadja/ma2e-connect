# Cahier de recette — conformité DCP

**Projet :** MA2E Connect (site public + back-office)
**Référentiel :** check-list de recette DCP de SD_PDCP et plan d'implémentation EBENYX (DEV-01 à DEV-13)
**Version :** 1.0 — 21/10/2026
**Rédigé par :** EBENYX

---

## 1. Objet

Ce cahier permet de **vérifier par soi-même**, sans accès au code, que les points de la check-list
DCP livrés à ce jour fonctionnent réellement sur le site en production. Chaque test est rédigé pour
être exécuté par une personne non technique, depuis un navigateur, et donne un résultat
**observable** : ce qui est attendu est décrit, pas déduit.

| Couvert par ce cahier | Item de la check-list |
|---|---|
| DEV-01 — preuve de lecture des TCU | Item 01 — TCU |
| DEV-03 — intitulé du lien « Données Personnelles » | Item 02 |
| DEV-04 — absence de cookies de suivi | Item 03 |
| DEV-05 / DEV-06 — mention d'information et champs obligatoires | 4 formulaires |
| DEV-07 — consentement, sa trace et son retrait | Contact, Demande de renseignement |
| DEV-08 — encadrement des zones de commentaire libre | 4 formulaires |
| DEV-09 — conservation et purge | Tous formulaires |
| DEV-10 — droits des personnes (accès, rectification, effacement, portabilité) | Item 07 |
| DEV-13 / R29 — journalisation (règle ANSSI R29) | Item 09 — Sécurité |

**Non couvert, et pourquoi** — voir § 13 : DEV-02, DEV-11 et DEV-12 attendent un contenu de MA2E,
et l'**activation** de la purge attend les durées de conservation (demande R07).

---

## 2. Avant de commencer

### 2.1 Adresses et comptes

| Élément | Valeur |
|---|---|
| Site public | `https://ma2e-connect.vercel.app` |
| Back-office | `https://ma2e-connect.vercel.app/admin/login` |
| Compte **administrateur** | nécessaire pour les § 6, 7, 8 (droits des personnes, purge, journal) |
| Compte **éditeur** | nécessaire pour le § 9 (cloisonnement des accès) — un compte sans le rôle administrateur suffit |

La connexion au back-office exige un **code à 6 chiffres reçu par courriel** : prévoir l'accès à la
boîte du compte de test.

### 2.2 Trois précautions, à lire avant tout

1. **L'effacement et la purge sont irréversibles.** Ils ne doivent porter que sur le jeu de données
   de test créé au § 3 — jamais sur le dossier d'un sociétaire réel. Chaque test concerné est
   signalé par ⚠️.
2. **Ne pas renseigner de durée de conservation « pour voir »** en production : une durée courte
   saisie par erreur anonymise des dossiers réels à la première purge. Le test **P-04** explique
   comment éprouver le mécanisme sans aucun risque.
3. **Ne saisir aucune donnée personnelle réelle** dans le jeu de test (pas de pièce d'identité, pas
   de photo d'une personne réelle). Un fichier PDF quelconque suffit comme pièce justificative.

### 2.3 Conventions

- Résultat à cocher : **OK** (conforme) / **KO** (non conforme) / **SO** (sans objet).
- Les tests marqués 🔧 demandent un outil technique (`curl`, ou un accès au serveur) ; ils sont
  facultatifs pour la recette fonctionnelle et regroupés au § 11.

---

## 3. Jeu de données de test (à créer une seule fois)

Utiliser une identité fictive et **une adresse de courriel que le testeur contrôle** (elle servira à
vérifier la confirmation d'effacement au test D-10). À défaut, utiliser `recette-dcp@example.org` —
aucun courriel ne sera alors reçu, et le test D-10 sera noté **SO**.

| ID | Action | À noter |
|---|---|---|
| DS-1 | Envoyer le formulaire de **contact** (`/contact`) au nom de « Recette DCP » | — |
| DS-2 | Envoyer une **demande d'adhésion** (`/adhesion`) avec la même identité, en joignant un PDF quelconque comme pièce | la référence `MA2E-…` affichée en fin de parcours |
| DS-3 | Envoyer une **demande de produit** depuis `/produits/epargne` (ou `/produits/credits`) | — |

Ces trois envois alimentent les tests des § 5, 6 et 7. Conserver la référence `MA2E-…` : elle sert
de clé de recherche.

---

## 4. Mentions d'information et formulaires publics — DEV-03, 05, 06, 08

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| F-01 | Mention en tête du formulaire d'adhésion | Ouvrir `/adhesion` et faire défiler jusqu'au formulaire | Un encadré intitulé **« Données Personnelles »** apparaît **au-dessus** des onglets (Personnel / Professionnel / Proches / Documents), déjà déplié : aucun clic n'est nécessaire pour le lire | |
| F-02 | Mention en tête du formulaire de contact | Ouvrir `/contact` | Le même encadré « Données Personnelles » apparaît au-dessus des champs. **Aucune** mention repliée ne subsiste en bas de page | |
| F-03 | Mention en tête de la demande de produit / renseignement | Ouvrir `/produits/epargne` puis `/produits/credits` | Le même encadré apparaît au-dessus du formulaire, sur les deux pages | |
| F-04 | Intitulé exact du lien (DEV-03) | Regarder le pied de page de n'importe quelle page | Le lien s'intitule exactement **« Données Personnelles »** (et non « Politique DCP ») | |
| F-05 | Accès à la politique | Cliquer sur « Consulter la politique de protection des données personnelles » dans l'encadré | La page `/politique-dcp` s'ouvre | |
| F-06 | Champs obligatoires (DEV-06) | Sur chacun des 3 formulaires, lire le bas de l'encadré | La phrase « **Les champs marqués d'un astérisque (*) sont obligatoires.** » est affichée | |
| F-07 | Zones de commentaire libre (DEV-08) | Sur `/contact` et sur la demande de produit, regarder juste au-dessus du champ « Message » | Une consigne courte rappelle de ne pas saisir de données sensibles ni d'informations inutiles | |
| F-08 | Zones de commentaire libre — adhésion | Parcourir les 4 onglets du formulaire d'adhésion | **Aucune zone de commentaire libre** n'existe sur ce formulaire : DEV-08 y est **sans objet**. À confirmer avec SD_PDCP | SO |
| F-09 | Textes modifiables sans redéploiement | Back-office → **Paramètres du site** → onglet **Légal** → « Mentions DCP des formulaires ». Modifier le titre, enregistrer, recharger `/contact` | Le nouveau titre s'affiche immédiatement sur le site public. **Rétablir ensuite le texte d'origine** | |

> F-09 est le test qui compte pour la suite : à réception de la mention d'information définitive de
> SD_PDCP, il suffira de la coller ici. Aucune intervention d'EBENYX ne sera nécessaire.

---

## 5. Consentement et preuve de lecture — DEV-07, DEV-01

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| C-01 | Case décochée par défaut — contact | Ouvrir `/contact` | La case de consentement est **décochée** | |
| C-02 | Case décochée par défaut — demande de produit | Ouvrir `/produits/epargne` | La case de consentement est **décochée** | |
| C-03 | Envoi refusé sans consentement | Remplir le formulaire de contact **sans** cocher la case, puis valider | L'envoi est refusé avec le message « Vous devez accepter le traitement de vos données » ; **rien n'est enregistré** | |
| C-04 | Mention du retrait du consentement | Lire la mention sous la case de consentement | Le texte indique que le consentement **peut être retiré à tout moment**, via le formulaire de contact ou à l'adresse DCP | |
| C-05 | Trace du consentement — contact | Back-office → **Messages de contact** → ouvrir le message DS-1 | La date et la version du texte accepté sont affichées | |
| C-06 | Preuve de consentement — demande de produit | Back-office → **Demandes & Formulaires** → ouvrir la demande DS-3 | Un bloc **« Preuve de consentement »** affiche « Version acceptée » et « Horodatage » | |
| C-07 | Preuve de lecture des TCU — adhésion (DEV-01) | Back-office → **Demandes & Formulaires** → ouvrir la demande DS-2 | Un bloc **« Preuve de lecture des TCU »** affiche la version des TCU et l'horodatage. **Aucune case à cocher supplémentaire** n'a été ajoutée au parcours d'adhésion, conformément à la consigne SD_PDCP | |
| C-08 | Preuve exportable | Back-office → **Demandes & Formulaires** → bouton d'export CSV | Le fichier contient les colonnes **« Consentement (version) »** et **« Consentement (horodatage) »** | |

> **Pourquoi la version est fiable.** La date et la version ne sont pas envoyées par le navigateur :
> elles sont déterminées par le serveur à partir du texte qu'il servait à cet instant. Un visiteur ne
> peut donc pas forger une version, et la preuve correspond bien au texte réellement affiché.

---

## 6. Droits des personnes — DEV-10

Back-office → menu **Administration** → **Droits des personnes**.

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| D-01 | Accès au mécanisme | Se connecter avec le compte administrateur | Le menu **« Droits des personnes »** est présent | |
| D-02 | **Droit d'accès** | Saisir l'adresse de courriel du jeu de test, cliquer sur « Rechercher » | Le dossier regroupe en une seule vue : les **demandes** (DS-2, DS-3), les **messages de contact** (DS-1) et, le cas échéant, les comptes back-office portant cette adresse | |
| D-03 | Recherche multi-critères | Rechercher successivement par **nom**, **téléphone**, **matricule** et **référence `MA2E-…`** | Chaque critère retrouve le même dossier | |
| D-04 | **Droit à la portabilité** — CSV | Cliquer sur « Dossier CSV » | Un fichier se télécharge. Ouvert dans Excel, il affiche **une donnée par colonne** et les **accents corrects** | |
| D-05 | **Droit à la portabilité** — JSON | Cliquer sur « Dossier JSON » | Un fichier `.json` se télécharge, contenant le dossier complet | |
| D-06 | **Droit de rectification** | Sur la demande DS-2, cliquer sur le bouton de rectification, corriger le nom, valider | Le nom corrigé apparaît dans le dossier **et** dans l'écran « Demandes & Formulaires » | |
| D-07 | Rectification — donnée invalide | Rejouer D-06 en saisissant une adresse de courriel sans `@` | La correction est **refusée** avec un message d'erreur ; l'ancienne valeur est conservée | |
| D-08 | Effacement — garde-fou | Ouvrir la fenêtre d'effacement **sans cocher** aucun enregistrement, puis valider | L'opération est **refusée** : il faut désigner explicitement les enregistrements. *(Ce garde-fou évite qu'une homonymie détruise le dossier d'un tiers.)* | |
| D-09 ⚠️ | **Droit à l'effacement** — anonymisation | Cocher la demande DS-3 et le message DS-1, choisir **« Anonymiser »**, confirmer | • L'identité de la demande est remplacée par « — (effacé) » ; **la ligne subsiste** pour les statistiques d'adhésion.<br>• Le **message de contact est supprimé** (un message anonymisé ne serait qu'un texte libre sans valeur).<br>• La **pièce justificative n'est plus téléchargeable** | |
| D-10 ⚠️ | **Droit à l'effacement** — suppression | Rejouer sur la demande DS-2 en choisissant **« Supprimer »**, en cochant la notification | La demande disparaît totalement, pièce justificative comprise. La personne reçoit un **courriel de confirmation** | |
| D-11 | Traçabilité | Faire défiler jusqu'au **« Registre des opérations DCP »** | Les opérations des tests D-02 à D-10 y figurent : nature (consultation, portabilité, rectification, effacement), **personne concernée**, **administrateur auteur**, date, et nombre d'enregistrements touchés | |

> **La consultation elle-même est tracée.** Ouvrir un dossier est une consultation de données
> personnelles : elle s'inscrit au registre. Le rafraîchissement automatique a été désactivé sur cet
> écran pour qu'un simple changement d'onglet ne crée pas d'entrée supplémentaire.

---

## 7. Conservation et purge — DEV-09

Même écran, carte **« Conservation et purge »**.

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| P-01 | État livré : mécanisme **inerte** | Regarder la carte en production, sans rien modifier | Un bandeau ambre indique : « Aucune durée de conservation n'est définie : **la purge est inopérante** ». Les trois champs affichent « non définie » | |
| P-02 | Purge impossible sans règle | Cliquer sur le bouton de purge, confirmer | L'opération est **refusée** avec un message explicite. Aucune donnée n'est touchée | |
| P-03 | Automatisme désactivé | Regarder l'interrupteur « Purge automatique quotidienne » | Il est sur **Désactivé** | |
| P-04 | Le mécanisme calcule bien — **sans risque** | Saisir **600** dans les trois champs (600 mois = 50 ans), enregistrer | Le bandeau ambre disparaît et les compteurs « arrivés en fin de conservation » affichent **0** : aucune donnée du site n'a 50 ans. Le calcul est donc opérationnel. **Vider ensuite les trois champs et enregistrer** pour revenir à l'état inerte (vérifier le retour du bandeau ambre) | |
| P-05 | Trois durées distinctes | Lire les libellés sous chaque champ | Demandes → **anonymisation** (la ligne reste pour les statistiques) ; Messages de contact → **suppression définitive** ; Journal d'activité → **suppression définitive** | |
| P-06 | Traçabilité de la purge | Après P-02 et P-04, consulter le registre | Les opérations de purge y sont consignées, avec leurs compteurs | |
| P-07 | **Activation** (à faire après R07) | *Ne pas exécuter avant réception des durées validées par MA2E* | Procédure recommandée : saisir les durées validées → vérifier les compteurs → **sauvegarder la base** → lancer une purge **manuelle** → contrôler le résultat → seulement ensuite activer l'automatisme quotidien | SO |

---

## 8. Journalisation — règle ANSSI R29

Back-office → **Administration** → **Journal d'activité**.

> **Version requise.** Cette section porte sur la journalisation des **événements
> d'authentification** et sur l'**adresse IP**, livrées le 21/10/2026. Elles sont à jouer **après la
> mise en production de cette livraison** ; sur une version antérieure, les tests J-01 à J-07
> échouent légitimement (le journal n'y contient que les actions de gestion réussies, sans adresse
> IP). Les sections 4 à 7, 9 et 10 sont, elles, en production depuis le 20 et le 21/10/2026.

⚠️ Les tests J-02 à J-06 doivent être joués sur un **compte de test**, jamais sur son propre compte
administrateur : 5 échecs consécutifs **verrouillent** le compte. Le déverrouillage se fait dans
**Utilisateurs** (le compte verrouillé porte un badge rouge « Verrouillé », avec un bouton de
déverrouillage).

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| J-01 | Connexion réussie tracée | Se connecter normalement, puis ouvrir le journal | Une ligne **« connexion réussie (code reçu par e-mail) »** apparaît, avec l'adresse de courriel du compte et l'heure (voir la réserve ci-dessus sur l'adresse IP) | |
| J-02 | Mot de passe erroné tracé | Se déconnecter, tenter une connexion du compte de test avec un mauvais mot de passe, se reconnecter en administrateur, ouvrir le journal | Une ligne rouge **401** porte le libellé « mot de passe incorrect (1/5) » | |
| J-03 | Identifiant inconnu tracé | Tenter une connexion avec une adresse qui n'existe pas | Une ligne rouge **401** porte le libellé **« identifiant inconnu »** et l'adresse de courriel tentée. *(C'est la trace d'une tentative d'énumération de comptes.)* | |
| J-04 ⚠️ | Verrouillage tracé | Enchaîner **5** mauvais mots de passe sur le compte de test | La 5ᵉ tentative est refusée avec un message de verrouillage, et le journal porte une ligne **423 « compte verrouillé après 5 échecs »**. **Déverrouiller ensuite le compte** depuis *Utilisateurs* | |
| J-05 | Tentative sur compte verrouillé tracée | Avant de déverrouiller, retenter une connexion (même avec le **bon** mot de passe) | Une ligne **423 « tentative sur un compte verrouillé »** apparaît | |
| J-06 | Code de vérification erroné tracé | Se connecter avec le bon mot de passe, puis saisir un code à 6 chiffres faux | Une ligne **401 « code de vérification incorrect (1/5) »** apparaît | |
| J-07 | Écritures de gestion tracées avec l'IP | Faire une modification quelconque (par ex. enregistrer un réglage), puis ouvrir le journal | La ligne de l'action porte une colonne d'adresse, renseignée (même réserve sur sa valeur) | |
| J-08 | Lecture du journal restreinte | Se connecter avec le compte éditeur | Le menu **« Journal d'activité »** n'est pas proposé | |

> **Ce que ces lignes permettent de détecter.** Avant cette livraison, aucun échec n'était
> enregistré : seules les actions réussies et authentifiées apparaissaient au journal. Une série
> d'échecs suivie d'une connexion réussie se lit désormais directement.
>
> ⚠️ **Réserve sur la colonne « adresse IP », relevée le 21/10/2026.** La chaîne d'exposition compte
> plusieurs relais (Vercel, tunnel, proxy inverse) alors que l'application n'en déclare qu'un :
> l'adresse affichée est donc celle du **dernier relais interne**, identique pour tous les visiteurs,
> et non celle du visiteur. Les tests J-01 à J-07 doivent donc être évalués sur **la présence de
> l'événement et de son libellé**, et la colonne d'adresse notée **KO** jusqu'au correctif. Les deux
> voies de correction sont décrites dans `DCP_ANSSI.md` § 3.2.

---

## 9. Cloisonnement des accès

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| H-01 | Menu masqué pour un éditeur | Se connecter avec le compte éditeur | **« Droits des personnes »** n'apparaît pas dans le menu | |
| H-02 | Refus côté serveur | Toujours en éditeur, saisir directement l'adresse `…/admin/dcp` | L'écran s'ouvre mais **aucune donnée personnelle n'est servie** : l'API refuse. *(Le contrôle est au serveur, pas seulement dans le menu.)* | |
| H-03 | Éditeur gestionnaire des demandes | Donner à l'éditeur la permission de gestion des demandes (écran *Utilisateurs*), puis rejouer H-02 | Le refus **persiste** : gérer les demandes ne donne pas le droit d'effacer des données personnelles | |
| H-04 | Pièces justificatives non devinables | Ouvrir une pièce justificative depuis le back-office, copier son adresse, **en retirer la partie après `?`**, puis ouvrir cette adresse tronquée | Le téléchargement est **refusé** (« Lien expiré ou invalide ») : les pièces ne sont accessibles que par un lien signé et temporaire | |

---

## 10. Cookies et traduction — DEV-04

À faire dans une **fenêtre de navigation privée** (sinon d'anciens cookies faussent le test).
Outils de développement : **F12** → onglet *Application* (Chrome/Edge) ou *Stockage* (Firefox) →
*Cookies*.

| ID | Objet | Mode opératoire | Résultat attendu | OK/KO |
|---|---|---|---|---|
| K-01 | Aucun cookie en navigation normale | Ouvrir l'accueil, naviguer sur 3 ou 4 pages **sans changer de langue**, consulter les cookies | **Aucun cookie** n'est déposé | |
| K-02 | Le seul cookie possible | Choisir une langue (EN / ES / AR), reconsulter les cookies | **Un seul** cookie apparaît, nommé `googtrans` : il porte le code de la langue choisie, est déposé **par le site lui-même** et disparaît à la fermeture du navigateur | |
| K-03 | Aucun traceur | F12 → onglet *Réseau*, recharger l'accueil, filtrer sur `matomo` puis sur `analytics` | **Aucune requête** vers un service de mesure d'audience | |
| K-04 | Back-office non traduit | Choisir une langue étrangère sur le site public, puis ouvrir le back-office | Les écrans d'administration **restent en français** : les données personnelles affichées (noms, adresses, demandes) ne sont pas envoyées au service de traduction | |

> Le détail, les mesures et les captures justificatives figurent dans le livrable **`DCP_COOKIES.md`**.

---

## 11. Contrôles techniques 🔧

Facultatifs pour la recette fonctionnelle ; ils donnent une preuve indépendante du navigateur.
Les résultats attendus ci-dessous ont été **relevés sur la production le 21/10/2026**.

```bash
# T-01 — l'API répond
curl -s -o /dev/null -w "%{http_code}\n" https://ma2e-connect.vercel.app/api/health
# attendu : 200

# T-02 à T-04 — les mécanismes DCP sont fermés sans authentification
curl -s -o /dev/null -w "%{http_code}\n" "https://ma2e-connect.vercel.app/api/dcp/subject?q=test"
curl -s -o /dev/null -w "%{http_code}\n" "https://ma2e-connect.vercel.app/api/dcp/retention"
curl -s -o /dev/null -w "%{http_code}\n" -X POST "https://ma2e-connect.vercel.app/api/dcp/purge"
# attendu : 401 pour les trois

# T-05 — le consentement est exigé par le SERVEUR, pas seulement par le navigateur
curl -s -X POST https://ma2e-connect.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  --data '{"name":"Recette DCP","email":"recette-dcp@example.org","message":"Essai sans consentement"}'
# attendu : {"error":"Le consentement au traitement des données est requis"} — et rien n'est enregistré
```

**T-06 — état réel en base** (nécessite l'accès au serveur). Ouvrir une session, puis exécuter les
trois requêtes — elles sont en **lecture seule** :

```bash
ssh -i ~/.ssh/ma2e_deploy ebenyx@100.89.199.57
```

```bash
# Durée de conservation enregistrée — attendu tant que R07 n'est pas reçu : aucune ligne
docker exec ma2e-connect-db-1 psql -U ma2e_admin -d ma2edb -t   -c "select value from \"Setting\" where key = 'dcpRetention';"

# Nombre d'opérations au registre DCP — doit correspondre à ce qu'affiche l'écran
docker exec ma2e-connect-db-1 psql -U ma2e_admin -d ma2edb -t   -c "select count(*) from \"DcpAction\";"

# Nombre de demandes anonymisées — attendu avant tout effacement : 0
docker exec ma2e-connect-db-1 psql -U ma2e_admin -d ma2edb -t   -c "select count(*) from \"Application\" where \"anonymizedAt\" is not null;"
```

---

## 12. Tests automatisés

Le dépôt contient une suite de tests d'intégration rejouée à chaque livraison. Elle exerce les
mêmes mécanismes que ce cahier, mais sur des données fictives et sans intervention humaine.

```bash
cd backend && npx tsc --noEmit && npx vitest run      # 76 tests, tous verts
cd ..      && npx tsc --noEmit -p tsconfig.json && npx vite build
```

| Test automatisé | Correspond à |
|---|---|
| `POST /api/applications sans consentement → 400` · `POST /api/contact sans consentement → 400` | C-03, C-04, T-05 |
| `preuve de lecture des TCU horodatée` · `consentement DCP horodaté` | C-05 à C-08 |
| `droit d'accès : le dossier regroupe les demandes et les messages` | D-02, D-03 |
| `droit à la portabilité : export CSV réutilisable` | D-04 |
| `droit de rectification : la correction est appliquée` · `une donnée invalide est refusée → 400` | D-06, D-07 |
| `l'effacement exige une sélection explicite → 400` | D-08 |
| `droit à l'effacement : identité et pièce justificative effacées, message supprimé` | D-09, D-10 |
| `chaque opération est consignée au registre DCP` | D-11 |
| `purge : refusée tant qu'aucune durée n'est définie → 409` | P-02 |
| `purge : anonymise et supprime les enregistrements en fin de conservation` | P-04, P-07 |
| `un éditeur, même gestionnaire des demandes, ne peut pas accéder → 403` · `inaccessibles sans authentification → 401` | H-02, H-03, T-02 |
| `une connexion réussie est journalisée` | J-01 |
| `un mot de passe erroné est journalisé, avec son adresse IP` | J-02 |
| `une tentative sur un identifiant inconnu est journalisée` | J-03 |
| `le verrouillage du compte et les tentatives suivantes sont journalisés` | J-04, J-05 |
| `un code de vérification erroné est journalisé` | J-06 |
| `une écriture ordinaire enregistre désormais l'adresse IP de son auteur` | J-07 |
| `le journal reste réservé aux comptes habilités → 401` | J-08 |

> La purge est testée sur des enregistrements **antidatés à 1950** avec une durée de **50 ans** :
> aucune donnée réelle ne peut entrer dans la fenêtre de purge pendant les tests.

---

## 13. Hors périmètre de cette recette

| Point | Pourquoi il n'est pas testable | Ce qui le débloque |
|---|---|---|
| **DEV-02** — texte des mentions légales | le texte n'a pas été fourni | demande **R02** |
| **DEV-11** — formulaire d'exercice des droits en ligne | option non arbitrée (les droits s'exercent aujourd'hui par courriel auprès du DPO, et sont traités au back-office — § 6) | demande **R06** |
| **DEV-12** — autorisation d'utilisation de l'image | le formulaire n'a pas été fourni | demande **R04** |
| **Activation** de la purge (DEV-09) | le mécanisme est livré et vérifiable (P-01 à P-06), mais il reste volontairement inerte | demande **R07** — durées de conservation |
| **R5 ANSSI** — accès à l'administration restreint aux postes autorisés | suppose un choix d'organisation de MA2E | les postes d'administration ont-ils des adresses IP fixes ? |
| **Externalisation des journaux** (R29) | les journaux résident sur le serveur qu'ils tracent | arbitrage d'hébergement et de coût |
| **Hébergement hors CEDEAO / déclaration ARTCI** | relève de MA2E, non du site | item 05 de la check-list, à ce jour non renseigné |

---

## 14. Fiche de résultats

| Section | Tests | OK | KO | SO | Observations |
|---|---|---|---|---|---|
| § 4 — Mentions et formulaires (DEV-03/05/06/08) | F-01 → F-09 | | | | |
| § 5 — Consentement et preuve (DEV-07/01) | C-01 → C-08 | | | | |
| § 6 — Droits des personnes (DEV-10) | D-01 → D-11 | | | | |
| § 7 — Conservation et purge (DEV-09) | P-01 → P-07 | | | | |
| § 8 — Journalisation (R29) | J-01 → J-08 | | | | |
| § 9 — Cloisonnement des accès | H-01 → H-04 | | | | |
| § 10 — Cookies et traduction (DEV-04) | K-01 → K-04 | | | | |
| § 11 — Contrôles techniques | T-01 → T-06 | | | | |

**Recette effectuée par :** ……………………………………  **Date :** ………………

**Visa MA2E :** ……………………………………  **Date :** ………………

---

### Documents liés

| Document | Objet |
|---|---|
| `DCP_COOKIES.md` | livrable DEV-04 — absence de cookies de suivi, mesures et preuves |
| `DCP_ANSSI.md` | livrable DEV-13 — les 29 règles ANSSI, matrice des flux (R11), politique de journalisation (R29) |
