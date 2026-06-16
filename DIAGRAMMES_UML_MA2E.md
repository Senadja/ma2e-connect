# MA2E — Diagrammes UML

> Diagrammes Mermaid (rendus automatiquement sur GitHub / VS Code avec l'extension Mermaid).
> Ancrés sur le code réel : `backend/prisma/schema.prisma`, `backend/src/lib/permissions.ts`,
> `backend/src/routes/*`, `backend/src/middleware/auth.ts`.
> Vues complémentaires (architecture, navigation, rôles) : voir [`DIAGRAMMES_MA2E.md`](./DIAGRAMMES_MA2E.md).

Sommaire : **1) Diagramme de classes · 2) Diagramme de cas d'utilisation · 3) Diagrammes de séquence**

---

## 1. Diagramme de classes

> Modèle du domaine (entités Prisma + énumérations). Les tables CMS sont volontairement **plates**
> (pas de clés étrangères) ; les associations ci-dessous sont **logiques** : une demande et une entrée
> d'audit référencent l'utilisateur par son **e-mail** (`decidedBy`, `userEmail`), pas par une FK.

```mermaid
classDiagram
  direction LR

  class User {
    +string id
    +string email
    +string password
    +string name
    +Role role
    +string[] permissions
    +datetime createdAt
    +datetime updatedAt
  }

  class Application {
    +string id
    +string appId
    +string category
    +string type
    +string name
    +string matricule
    +string email
    +string phone
    +AppStatus status
    +Priority priority
    +json data
    +string decisionReason
    +datetime decidedAt
    +string decidedBy
    +datetime createdAt
  }

  class Article {
    +string id
    +string slug
    +string title
    +string excerpt
    +string category
    +json content
    +string image
    +string status
    +datetime publishedAt
  }

  class Product {
    +string id
    +string slug
    +string type
    +string name
    +string description
    +string[] features
    +json meta
    +string form
    +bool active
    +int order
  }

  class MediaFile {
    +string id
    +string title
    +string desc
    +string category
    +string path
    +string size
    +string year
    +bool published
  }

  class FaqItem {
    +string id
    +string category
    +string question
    +string answer
    +int order
  }

  class Setting {
    +string key
    +json value
    +datetime updatedAt
  }

  class Partner {
    +string id
    +string name
    +string type
    +string desc
    +string logo
    +string url
    +int order
  }

  class TeamMember {
    +string id
    +string name
    +string role
    +string initials
    +string photo
    +string category
    +int order
  }

  class ContactMessage {
    +string id
    +string name
    +string email
    +string phone
    +string subject
    +string message
    +bool read
  }

  class AuditLog {
    +string id
    +string userEmail
    +string userName
    +string method
    +string path
    +int status
    +datetime createdAt
  }

  class Role {
    <<enumeration>>
    USER
    EDITOR
    ADMIN
  }
  class AppStatus {
    <<enumeration>>
    PENDING
    REVIEWING
    APPROVED
    REJECTED
  }
  class Priority {
    <<enumeration>>
    LOW
    MEDIUM
    HIGH
  }

  User ..> Role : role
  Application ..> AppStatus : status
  Application ..> Priority : priority
  User "1" --> "0..*" Application : décide (decidedBy)
  User "1" --> "0..*" AuditLog : génère (userEmail)
```

---

## 2. Diagramme de cas d'utilisation

> Deux acteurs : le **Visiteur** (public, non authentifié) et l'**Administrateur / Staff**
> (back-office, authentifié — le périmètre exact dépend des permissions fines, cf. diagramme de classes
> et `PROFILES`). « include » = relation d'inclusion UML.

```mermaid
flowchart LR
  visiteur(("👤 Visiteur")):::actor
  admin(("🛠️ Administrateur<br/>/ Staff")):::actor

  subgraph SYS["Système — Site & back-office MA2E"]
    direction TB
    subgraph PUB["Espace public"]
      u1(["Consulter pages & actualités"])
      u2(["Soumettre une demande d'adhésion"])
      u3(["Soumettre une demande de produit<br/>(épargne · crédit · immobilier)"])
      u4(["Téléverser les pièces justificatives"])
      u5(["Envoyer un message de contact"])
      u6(["Télécharger des documents (médiathèque)"])
      u7(["Changer la langue FR / EN"])
    end
    subgraph ADM["Back-office (authentifié + RBAC)"]
      a0(["S'authentifier (JWT)"])
      a1(["Traiter les demandes :<br/>valider / refuser (motivé)"])
      a2(["Gérer actualités · produits · FAQ"])
      a3(["Gérer médiathèque · partenaires · équipe"])
      a4(["Éditer le contenu du site (CMS / Settings)"])
      a5(["Lire les messages de contact"])
      a6(["Gérer utilisateurs & permissions"])
      a7(["Consulter le journal d'audit"])
    end
  end

  visiteur --> u1 & u2 & u3 & u5 & u6 & u7
  u2 & u3 -.->|«include»| u4

  admin --> a1 & a2 & a3 & a4 & a5 & a6 & a7
  a1 & a2 & a3 & a4 & a5 & a6 & a7 -.->|«include»| a0

  classDef actor fill:#1A6147,color:#fff,font-weight:bold;
```

---

## 3. Diagrammes de séquence

### 3.a — Demande (adhésion / produit) → décision

```mermaid
sequenceDiagram
  autonumber
  actor V as Visiteur
  participant FE as Front (Vercel SPA)
  participant API as API (Express)
  participant DB as PostgreSQL
  participant ML as Mailer (SMTP)
  actor AD as Administrateur

  V->>FE: Remplit /adhesion + sélectionne les pièces
  loop pour chaque pièce
    FE->>API: POST /api/applications/documents (fichier)
    API-->>FE: { path, name }
  end
  FE->>API: POST /api/applications (infos + pièces)
  API->>DB: create Application (status = PENDING, appId = MA2E-AAAA-NNNN)
  API--)ML: sendApplicationNotification (mutuelle)
  API-->>FE: 201 { appId }
  FE-->>V: Confirmation + référence

  Note over AD,DB: Plus tard — back-office (auth + permission applications:manage)
  AD->>API: GET /api/applications?status=PENDING
  API->>DB: findMany
  API-->>AD: Liste des demandes
  alt Pièces conformes
    AD->>API: PATCH /api/applications/:id { status: APPROVED }
    API->>DB: update (decidedBy, decidedAt)
    API--)ML: sendApplicationDecision (validation)
  else Pièces incomplètes
    AD->>API: PATCH /api/applications/:id { status: REJECTED, reason }
    Note right of API: motif obligatoire → 400 sinon
    API->>DB: update (refus motivé)
    API--)ML: sendApplicationDecision (motif au demandeur)
  end
  API-->>AD: 200 demande mise à jour
```

### 3.b — Connexion admin & édition de contenu (CMS) avec audit

```mermaid
sequenceDiagram
  autonumber
  actor AD as Administrateur
  participant FE as Back-office (SPA)
  participant API as API (Express)
  participant MW as Middlewares (auth · RBAC)
  participant DB as PostgreSQL

  AD->>FE: Saisit ses identifiants
  FE->>API: POST /api/auth/login (rate-limited)
  API->>DB: findUnique(user) + bcrypt.compare
  API-->>FE: { token JWT, user }
  Note over FE: token conservé, envoyé en en-tête Bearer

  AD->>FE: Modifie un contenu (ex. lien WhatsApp, chiffres clés)
  FE->>API: PUT /api/settings/:key (Authorization: Bearer)
  API->>MW: requireAuth + requirePermission(settings:write)
  alt Autorisé (ADMIN implicite ou permission présente)
    MW-->>API: OK
    API->>DB: upsert Setting (key, value)
    API->>DB: create AuditLog (écriture authentifiée réussie)
    API-->>FE: 200 contenu mis à jour
  else Refusé
    MW-->>API: 401 (non connecté) / 403 (permission manquante)
    API-->>FE: Erreur
  end
```

---

> **Note de fidélité au code.** Diagrammes générés à partir de : entités & énums de `schema.prisma` ;
> permissions de `permissions.ts` ; flux de `routes/applications.ts`, `routes/auth.ts`, `routes/settings.ts` ;
> JWT/RBAC de `middleware/auth.ts` ; journalisation de `lib/audit.ts` (toute écriture authentifiée et réussie).
