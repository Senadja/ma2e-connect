# Audit de sécurité — OWASP Top 10 · MA2E

**Date :** 10 juin 2026 · **Périmètre :** API backend Node/Express + front React.
**Légende :** ✅ couvert · 🟡 partiel / à finaliser avant prod · ⬜ à faire (dépend MA2E / infra).

---

| # | Risque OWASP 2021 | État | Détail |
|---|-------------------|------|--------|
| A01 | **Broken Access Control** | ✅ | Middleware `requireAuth` (JWT) + `requireRole('admin','editor')` sur **toutes** les routes d'écriture. Lecture publique limitée aux articles *publiés* / produits *actifs*. Testé (401/403). |
| A02 | **Cryptographic Failures** | ✅ / 🟡 | Mots de passe hachés **bcrypt** (coût 10). JWT signé HS256. 🟡 **HTTPS/TLS à activer en prod** (certificat MA2E) — aujourd'hui en clair en local. |
| A03 | **Injection** | ✅ | Accès BDD via **Prisma** (requêtes paramétrées, pas de SQL brut). Validation systématique des entrées avec **Zod** sur chaque route. `helmet` pose des en-têtes anti-injection. |
| A04 | **Insecure Design** | ✅ / 🟡 | Séparation rôles (USER/EDITOR/ADMIN), demandes publiques en écriture seule (pas de lecture), réf. lisibles `MA2E-AAAA-NNNN`. 🟡 Pas encore de double validation métier sur les demandes sensibles. |
| A05 | **Security Misconfiguration** | ✅ / 🟡 | `helmet`, CORS restreint à une liste d'origines, `.env` hors Git, en-têtes nginx (X-Frame-Options, nosniff, Referrer-Policy). 🟡 **Changer `JWT_SECRET` et le mot de passe DB en prod** (valeurs par défaut à remplacer). |
| A06 | **Vulnerable & Outdated Components** | 🟡 | Dépendances récentes (Express 5, Prisma 5.22, React 18). `npm audit` à exécuter dans un environnement avec accès réseau (bloqué dans l'environnement de dev actuel). Mettre en place un suivi (Dependabot / `npm audit` CI). |
| A07 | **Identification & Auth Failures** | ✅ / 🟡 | bcrypt + JWT (exp. 8h) + **rate-limiting** sur `/auth/login` (10 essais / 15 min). Message d'erreur générique (pas d'énumération d'utilisateurs). **MFA : code à 6 chiffres envoyé par e-mail, obligatoire à chaque connexion** (5 min, usage unique, 5 tentatives, stocké haché) + 8 codes de secours à usage unique. 🟡 Pas de politique de complexité de mot de passe (back-office interne, faible exposition). |
| A08 | **Software & Data Integrity** | ✅ / 🟡 | Uploads médias limités (taille 15 Mo), noms de fichiers assainis. 🟡 Pas de contrôle de type MIME strict / antivirus sur les uploads (à ajouter si exposition publique des uploads). |
| A09 | **Logging & Monitoring Failures** | 🟡 | Erreurs serveur loguées (handler centralisé). 🟡 Pas de journalisation structurée ni d'alerting — à compléter (ex. pino + agrégateur) ; **Matomo** couvre l'audience, pas la sécurité. |
| A10 | **Server-Side Request Forgery (SSRF)** | ✅ | L'API n'effectue aucune requête sortante vers des URL fournies par l'utilisateur. |

---

## Mesures déjà en place (récapitulatif)

- **Authentification** : bcrypt + JWT signé, expiration configurable.
- **Autorisation** : RBAC sur toutes les écritures (admin/éditeur).
- **Validation** : Zod côté serveur sur chaque endpoint.
- **Anti-bruteforce** : `express-rate-limit` sur le login.
- **En-têtes** : `helmet` (API) + en-têtes nginx (front).
- **CORS** : liste blanche d'origines configurable (`CORS_ORIGIN`).
- **Secrets** : hors du dépôt (`.env` gitignored, `.env.example` fourni).
- **ORM** : Prisma (pas d'injection SQL).

## À finaliser avant la mise en production (checklist)

- [ ] **HTTPS/TLS** : certificat + redirection 80→443 (dépend du domaine/SSL fournis par MA2E).
- [ ] **Secrets de prod** : générer un `JWT_SECRET` long et aléatoire, changer le mot de passe PostgreSQL (ne pas garder les valeurs par défaut du compose).
- [ ] **`npm audit`** dans un environnement connecté + correction des vulnérabilités éventuelles ; mettre en place Dependabot.
- [ ] **Validation MIME/taille** renforcée sur les uploads + éventuel scan antivirus.
- [ ] **Journalisation structurée** + supervision (logs applicatifs, alertes).
- [ ] **Sauvegardes** automatiques de la base PostgreSQL.
- [ ] Revue des **en-têtes CSP** (Content-Security-Policy) à affiner selon les domaines tiers (Matomo, polices).

---

*Audit indicatif réalisé sur la base du code au 10/06/2026. À recompléter après configuration de l'infrastructure de production.*
