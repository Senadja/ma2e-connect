# Guide de déploiement — MA2E

Stack : **PostgreSQL** + **API Node/Express** + **Front React (nginx)**, orchestrés par Docker Compose.

---

## 1. Lancement local (développement)

Deux serveurs, sans Docker :

```bash
# 1) Base PostgreSQL locale requise (ou via Docker : voir §2 pour le seul service db)
# 2) Backend
cd backend
npm install
npm run seed        # crée admin@ma2e.ci / admin123 + editor@ma2e.ci / editor123 + contenu
npm run dev         # http://localhost:3000

# 3) Front (autre terminal)
cd ..
npm install
npm run dev         # http://localhost:5174
```

## 2. Déploiement complet avec Docker

Pré-requis : **Docker Desktop démarré**.

```bash
# À la racine du projet
docker compose up --build
```

- Front : **http://localhost:8080**
- API (proxyfiée) : **http://localhost:8080/api** (et exposée en direct sur `:3000` pour debug)
- Au premier démarrage, le backend synchronise le schéma (`prisma db push`) puis exécute le seed
  (désactivable avec `SEED_ON_START=false`).

Arrêt : `docker compose down` (les données persistent dans les volumes `ma2e_pgdata` et `ma2e_uploads`).
Réinitialisation complète : `docker compose down -v`.

### Variables d'environnement (production)

Créer un fichier `.env` à la racine (lu par `docker compose`) :

```env
DB_PASSWORD=<mot_de_passe_postgres_fort>
JWT_SECRET=<chaîne_longue_aléatoire>
CORS_ORIGIN=https://www.ma2e.ci
SEED_ON_START=false           # après le premier déploiement
# SMTP (notifications e-mail des demandes)
SMTP_HOST=smtp.ma2e.ci
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_TO_APPLICATIONS=contact@ma2e.ci
```

> ⚠️ **Ne jamais** conserver les valeurs par défaut (`JWT_SECRET`, mot de passe DB) en production.

## 3. Tests

```bash
cd backend
npm test            # 11 tests d'intégration (auth, RBAC, lecture publique, validation)
```
Pré-requis : PostgreSQL démarré + seed exécuté.

## 4. Mise en production (VPS) — étapes restantes

1. **Domaine + certificat SSL** (à fournir par MA2E) → ajouter un reverse-proxy TLS (Traefik/Caddy) ou Certbot devant nginx, redirection 80→443.
2. Renseigner les **secrets de prod** (cf. ci-dessus).
3. Configurer les **sauvegardes** PostgreSQL (ex. `pg_dump` planifié).
4. (Optionnel) **Matomo** : renseigner `VITE_MATOMO_URL` et `VITE_MATOMO_SITE_ID` au build du front.
5. Vérifier la **checklist OWASP** (`SECURITE_OWASP.md`).

## 5. Architecture

```
Navigateur ──▶ nginx (web:80) ──┬─▶ fichiers statiques (SPA React)
                                └─▶ /api ──▶ backend:3000 ──▶ PostgreSQL (db:5432)
                                                   │
                                             volume uploads (médiathèque)
```
