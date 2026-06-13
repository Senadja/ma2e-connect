# MA2E — Architecture & diagrammes du projet

> Vue structurée du projet (diagrammes Mermaid, rendus automatiquement sur GitHub).
> Sommaire : 1) Architecture · 2) Cas d'usage · 3) Modèle de données · 4) Workflow d'adhésion ·
> 5) Plan de navigation · 6) Rôles & permissions.

---

## 1. Architecture technique

```mermaid
flowchart LR
  U(["Visiteur / Admin<br/>(FR · EN)"])

  subgraph Vercel["Vercel — Frontend"]
    FE["SPA React + Vite<br/>React Router · i18n · React Query"]
    RW[["vercel.json — rewrites<br/>/api · /documents/uploads"]]
  end

  subgraph OVH["Serveur OVH — Docker (derrière NAT)"]
    CAD["Caddy<br/>reverse proxy + HTTPS auto"]
    BE["Backend Node/Express + Prisma<br/>JWT · RBAC · uploads"]
    DB[("PostgreSQL")]
    VOL[("Volume<br/>fichiers uploadés")]
  end

  MAT(["Matomo<br/>analytics"])
  SMTP[("Serveur SMTP")]

  U --> FE
  FE -->|appels relatifs| RW
  RW -->|HTTPS · sslip.io| CAD
  CAD --> BE
  BE --> DB
  BE --> VOL
  BE -. notifications e-mail .-> SMTP
  FE -. tracking .-> MAT
```

---

## 2. Cas d'usage (acteurs → fonctionnalités)

```mermaid
flowchart LR
  V(("Visiteur")):::actor
  A(("Admin / Staff")):::actor

  subgraph Public["Espace public"]
    UC1(["Consulter site & actualités"])
    UC2(["Demander une adhésion + pièces justificatives"])
    UC3(["Demander un produit (épargne · crédit · immobilier)"])
    UC4(["Envoyer un message de contact"])
    UC5(["Télécharger des documents"])
    UC6(["Basculer la langue FR / EN"])
  end

  subgraph Backoffice["Back-office"]
    AC1(["Se connecter"])
    AC2(["Traiter les demandes : valider / refuser motivé"])
    AC3(["Gérer les actualités"])
    AC4(["Gérer les produits & offres"])
    AC5(["Gérer FAQ & médiathèque"])
    AC6(["Gérer partenaires & équipe"])
    AC7(["Lire les messages de contact"])
    AC8(["Configurer le site & le SMTP"])
    AC9(["Gérer utilisateurs & rôles"])
    AC10(["Consulter le journal d'audit"])
  end

  V --> UC1 & UC2 & UC3 & UC4 & UC5 & UC6
  A --> AC1 & AC2 & AC3 & AC4 & AC5 & AC6 & AC7 & AC8 & AC9 & AC10

  classDef actor fill:#1A6147,color:#fff,font-weight:bold;
```

---

## 3. Modèle de données (entités principales)

> Tables CMS volontairement plates (pas de clés étrangères Prisma). Les liens ci-dessous sont **logiques**
> (par e-mail) : le journal d'audit et les décisions de demandes référencent l'utilisateur.

```mermaid
erDiagram
  USER {
    string id PK
    string email UK
    enum role "USER · EDITOR · ADMIN"
    string permissions "liste de droits fins"
  }
  APPLICATION {
    string appId UK "MA2E-AAAA-NNNN"
    string category "adhésion · épargne · crédit · immobilier"
    string type
    enum status "PENDING · REVIEWING · APPROVED · REJECTED"
    json data "champs + documents joints"
    string decisionReason
    string decidedBy
  }
  ARTICLE {
    string slug UK
    string title
    string category
    json content
    string image
    string status "draft · published"
  }
  PRODUCT {
    string type "epargne · credit · immobilier"
    string slug
    string name
    string features
    json meta "taux · durée · montant…"
    bool active
  }
  MEDIAFILE {
    string id PK
    string title
    string category
    string path
  }
  FAQITEM {
    string id PK
    string category
    string question
    string answer
  }
  SETTING {
    string key PK
    json value
  }
  PARTNER {
    string id PK
    string name
    string type
    string logo
  }
  TEAMMEMBER {
    string id PK
    string name
    string role
    string category
  }
  CONTACTMESSAGE {
    string id PK
    string name
    string subject
    bool read
  }
  AUDITLOG {
    string id PK
    string userEmail
    string method
    string path
    int status
  }

  USER ||..o{ AUDITLOG : "trace (email)"
  USER ||..o{ APPLICATION : "décide (email)"
```

---

## 4. Workflow « demande d'adhésion → décision »

```mermaid
sequenceDiagram
  actor V as Visiteur
  participant FE as Front (Vercel)
  participant API as Backend API
  participant DB as PostgreSQL
  participant ML as Mailer (SMTP)
  actor AD as Admin

  V->>FE: Remplit /adhesion + téléverse les pièces
  FE->>API: POST /applications/documents (par pièce)
  API-->>FE: chemin du fichier
  FE->>API: POST /applications (infos + documents)
  API->>DB: crée la demande (statut PENDING)
  API-->>ML: notifie la mutuelle

  Note over AD,DB: Plus tard, dans le back-office
  AD->>API: GET /applications (authentifié)
  AD->>API: consulte les pièces jointes
  alt Pièces conformes
    AD->>API: PATCH statut = APPROVED
    API->>DB: trace la décision (decidedBy / decidedAt)
    API-->>ML: e-mail de validation au demandeur
  else Pièces incomplètes
    AD->>API: PATCH statut = REJECTED + motif
    API->>DB: enregistre le refus motivé
    API-->>ML: e-mail du motif au demandeur
  end
```

---

## 5. Plan de navigation

```mermaid
flowchart TD
  subgraph PUB["Site public"]
    H["/"]
    H --> AP["/a-propos"]
    H --> P["/produits"]
    P --> PE["/produits/epargne"]
    P --> PC["/produits/credits"]
    P --> PI["/produits/immobilier"]
    H --> AC["/actualites"]
    AC --> ACD["/actualites/:slug"]
    H --> AD["/adhesion"]
    H --> CO["/contact"]
    H --> FQ["/faq"]
    H --> ME["/mediatheque"]
    H --> PA["/partenaires"]
    H --> EM["/espace-ema2e"]
    H --> LG["/mentions-legales · /cgu · /politique-dcp"]
  end

  subgraph ADM["Back-office /admin"]
    D[dashboard] --- N[news] --- PR[products] --- AppM[applications]
    Co[contact] --- Md[media] --- Fq[faq] --- Pt[partners]
    Tm[team] --- Us[users] --- Au[audit] --- St[settings]
  end
```

---

## 6. Rôles & permissions (profils prédéfinis)

```mermaid
flowchart LR
  ADMIN[["ADMIN<br/>toutes permissions<br/>+ users:manage · settings:write"]]:::adm
  RED["Rédacteur"]
  COM["Communication"]
  PROD["Gestionnaire produits"]
  DEM["Gestionnaire demandes"]
  MEDP["Gestionnaire médiathèque"]

  RED -->|news:write · faq:write| MNews["Actualités + FAQ"]
  COM -->|news · faq · media · partners · team · contact| MCom["Actu · FAQ · Médiathèque<br/>Partenaires · Équipe · Messages"]
  PROD -->|products:write| MProd["Produits & offres"]
  DEM -->|applications:manage · contact:manage| MDem["Demandes + Messages"]
  MEDP -->|media:write| MMed["Médiathèque"]
  ADMIN -->|*| MAll["Tous les modules"]

  classDef adm fill:#1A6147,color:#fff,font-weight:bold;
```

> ADMIN possède toutes les permissions implicitement. Le menu du back-office est **adaptatif** :
> chaque profil ne voit que les modules qu'il a le droit de gérer.
