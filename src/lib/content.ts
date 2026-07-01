// Couche de données publique : lit le contenu depuis l'API backend,
// avec repli (fallback) automatique sur les données statiques si l'API
// est indisponible — le site public ne casse jamais.
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { NEWS, SAVINGS, CREDITS, TEAM, type NewsArticle } from "@/data/site";
import { MEDIA, FAQS, PARTNERS } from "@/data/institutional";

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

/* ---------------- Articles ---------------- */
export interface PublicArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content: NewsArticle["content"];
  image?: string;
  author?: string;
  readTime?: string;
  date?: string;
  tags?: string[];
}

const fallbackArticles: PublicArticle[] = NEWS.map((n) => ({
  slug: slugify(n.title),
  title: n.title,
  excerpt: n.excerpt,
  category: n.category,
  content: n.content,
  author: n.author,
  readTime: n.readTime,
  date: n.date,
  tags: n.tags,
}));

export function useArticles() {
  return useQuery({
    queryKey: ["public", "articles"],
    queryFn: async () => {
      try {
        return await api<PublicArticle[]>("/articles");
      } catch {
        return fallbackArticles;
      }
    },
    initialData: fallbackArticles,
  });
}

export function useArticle(slug?: string) {
  return useQuery({
    queryKey: ["public", "article", slug],
    enabled: !!slug,
    queryFn: async () => {
      try {
        return await api<PublicArticle>(`/articles/${slug}`);
      } catch {
        return fallbackArticles.find((a) => a.slug === slug) ?? null;
      }
    },
  });
}

/* ---------------- Produits ---------------- */
interface ApiProduct {
  slug: string;
  type: string;
  name: string;
  description: string;
  features: string[];
  meta?: { taux?: string; duree?: string; montant?: string; conditions?: string };
  image?: string;
  form?: string;
}

export function useProducts(type: "epargne" | "credit" | "immobilier") {
  const fallback =
    type === "epargne"
      ? SAVINGS.map((s) => ({ ...s }))
      : type === "credit"
      ? CREDITS.map((c) => ({ ...c }))
      : ([] as any[]);

  return useQuery({
    queryKey: ["public", "products", type],
    queryFn: async () => {
        const rows = await api<ApiProduct[]>(`/products?type=${type}`);
        if (type === "epargne") {
          return rows.map((p) => ({
            id: p.slug,
            name: p.name,
            desc: p.description,
            features: p.features || [],
            image: p.image,
            form: p.form,
          }));
        }
        if (type === "immobilier") {
          return rows.map((p) => ({
            id: p.slug,
            name: p.name,
            desc: p.description,
            categorie: (p.meta as any)?.type ?? "",
            pieces: (p.meta as any)?.pieces ?? "",
            image: p.image,
            form: p.form,
          }));
        }
        return rows.map((p) => ({
          id: p.slug,
          name: p.name,
          taux: p.meta?.taux ?? "",
          duree: p.meta?.duree ?? "",
          montant: p.meta?.montant ?? "",
          conditions: p.meta?.conditions ?? p.description,
          image: p.image,
          form: p.form,
        }));
    },
    initialData: fallback as any[],
  });
}

/* ---------------- Partenaires & Équipe ---------------- */
export function usePartners() {
  return useQuery({
    queryKey: ["public", "partners"],
    queryFn: async () => {
      try {
        return await api<Array<{ name: string; type: string; desc: string; logo?: string; url?: string }>>("/partners");
      } catch {
        return PARTNERS as Array<{ name: string; type: string; desc: string; logo?: string; url?: string }>;
      }
    },
    initialData: PARTNERS as Array<{ name: string; type: string; desc: string; logo?: string; url?: string }>,
  });
}

export interface PublicTeamMember { name: string; role: string; initials: string; photo?: string; category?: string }

export function useTeam() {
  return useQuery({
    queryKey: ["public", "team"],
    queryFn: async (): Promise<PublicTeamMember[]> => {
      try {
        return await api<PublicTeamMember[]>("/team");
      } catch {
        return TEAM as PublicTeamMember[];
      }
    },
    initialData: TEAM as PublicTeamMember[],
  });
}

/* ---------------- Réglages du site ---------------- */
export interface OrgChart {
  level1Name: string;
  level2Name: string;
  departments: string[];
}

export interface OrgUnit {
  name: string;
  note?: string;
  members?: { name: string; role: string; company?: string }[];
}

// Organes de gouvernance (composition officielle MEMBRES DES ORGANES 2026) — repli ; éditable au CMS.
export const DEFAULT_ORG_UNITS: OrgUnit[] = [
  { name: "Conseil d'Administration", note: "16 membres", members: [
    { name: "Jean Christian TURKSON", role: "Président", company: "CIE" },
    { name: "DEGNY Guy Florent", role: "1er Vice-Président", company: "SODECI" },
    { name: "SOUMAHORO Namory Hamed", role: "2ème Vice-Président", company: "CIE" },
    { name: "DODO Olivier", role: "Administrateur", company: "GS2E" },
    { name: "N'DRI Léandre", role: "Administrateur", company: "CIE" },
    { name: "BITTY AYE Marie", role: "Administrateur", company: "CIE" },
    { name: "OUATTARA Mamadou", role: "Administrateur", company: "CIE" },
    { name: "KONATE Kadidia", role: "Administrateur", company: "SODECI" },
    { name: "COULIBALY Damasse", role: "Administrateur", company: "SODECI" },
    { name: "DJIBENOU Antoine", role: "Administrateur", company: "GS2E" },
    { name: "COULIBALY épse DIOP Aminata", role: "Administrateur", company: "CIPREL" },
    { name: "OURAGA Maxime", role: "Administrateur", company: "CIE - Fraternité" },
    { name: "KOUADIO Koffi N'Da", role: "Administrateur", company: "CIE - SYNACIE" },
    { name: "BAKO Solange épse OUATTARA", role: "Administrateur", company: "CIE - AXE" },
    { name: "KOUAO Marc Russel", role: "Administrateur", company: "SODECI - SYNASOD" },
    { name: "NIOULE épse NAHOUNOU A. C. Désirée", role: "Administrateur", company: "SODECI - SYNATRASE" },
  ] },
  { name: "Comité de Crédit", note: "13 membres", members: [
    { name: "TRA BI Boris", role: "Président", company: "CIE" },
    { name: "KOUASSI Prisca épse KOUGNON", role: "Vice-Président", company: "SODECI" },
    { name: "OBLE KOIZAN Roseline", role: "Secrétaire", company: "CIE" },
    { name: "DOUKPA Viviane épse GBAGBO", role: "Membre", company: "GS2E" },
    { name: "DOBO Ange", role: "Membre", company: "CIE" },
    { name: "SIDIBE Salimatou", role: "Membre", company: "CIE" },
    { name: "BALLO Podo Noël", role: "Membre", company: "GS2E" },
    { name: "BAKAYOKO Awa", role: "Membre", company: "CIE" },
    { name: "ZABRE Léocadie Laure", role: "Membre", company: "CIE" },
    { name: "ADINGRA Adeline Antoinette épse AMIA", role: "Membre", company: "SODECI" },
    { name: "KOFFI N'GUESSAN Nadège épse ADINGRA", role: "Membre", company: "SODECI" },
    { name: "BILE épse BOKO Euphrasie", role: "Membre", company: "SODECI" },
    { name: "YORO Romain", role: "Membre", company: "CIPREL" },
  ] },
  { name: "Conseil de Surveillance", note: "9 membres", members: [
    { name: "REGNIER-ONDOMAT Stéphane Antoine", role: "Président", company: "GS2E" },
    { name: "SOGAN Prudencio", role: "Vice-Président", company: "CIPREL" },
    { name: "ZAMA Johan", role: "Secrétaire", company: "SODECI" },
    { name: "COULIBALY Kalwahanan", role: "Membre", company: "CIE" },
    { name: "DJELOU Djelou Fabrice", role: "Membre", company: "CIE" },
    { name: "TOURE Asseta épse ASSIFFOUA", role: "Membre", company: "SODECI" },
    { name: "DOUA Gisèle épse KEBE", role: "Membre", company: "SODECI" },
    { name: "BOHIAN BAMBA Mah", role: "Membre", company: "CIE" },
    { name: "BOUYS Alexandre", role: "Membre", company: "CIE" },
  ] },
  { name: "Comité d'Éthique et de Déontologie", note: "3 membres", members: [
    { name: "LATTA Hervé", role: "Président", company: "GS2E" },
    { name: "FOFANA Daouda", role: "Membre", company: "SODECI" },
    { name: "ANOUGBA Simplice", role: "Membre", company: "CIE" },
  ] },
];

// Nœud d'organigramme (récursif) — chaque poste/organe peut avoir des sous-éléments.
export interface OrgNode {
  name: string;
  role?: string;          // sous-titre facultatif (ex. intitulé du poste)
  children?: OrgNode[];
}

// Organigramme par défaut — reproduit l'organigramme officiel MA2E (MAJ 22/05/2026),
// y compris les postes opérationnels. Modifiable au CMS (Paramètres › Accueil › Organigramme).
export const DEFAULT_ORG_TREE: OrgNode = {
  name: "Assemblée Générale",
  children: [
    { name: "Comité d'Éthique et de Déontologie" },
    {
      name: "Conseil d'Administration",
      children: [
        {
          name: "Directeur Général",
          role: "GOUEDAN Franck Olivier",
          children: [
            { name: "Staff DG (2)" },
            { name: "Responsable Audit Interne et QSE", role: "KOISSI Aya Philomène" },
            { name: "Responsable des Systèmes d'Information", role: "TOURE Adama" },
            { name: "Contrôleur Interne", role: "DJEDJERO Natacha" },
            {
              name: "Directeur Administration Gestion Finance",
              role: "KONE Madoussou Yari épse Sombo",
              children: [
                { name: "Chauffeur", role: "KONAN François Léopold" },
                {
                  name: "Responsable Exploitation",
                  role: "AKPOUE Affouet Rosabelle",
                  children: [{ name: "Gestionnaires de Crédits (4)" }],
                },
                {
                  name: "Responsable Financier",
                  role: "TRAORE Ismaël",
                  children: [
                    {
                      name: "Comptable",
                      role: "GOUA Jean Moïse",
                      children: [{ name: "Caissière", role: "BONOUMAN Effossy Marie Esther" }],
                    },
                  ],
                },
                {
                  name: "Responsable Administratif",
                  role: "N'ZI Obodji Micheline",
                  children: [{ name: "Chauffeur-coursier", role: "KONE Siriki" }],
                },
              ],
            },
          ],
        },
      ],
    },
    { name: "Comité de Crédit" },
    { name: "Conseil de Surveillance" },
  ],
};

// Personnel de la MA2E (annuaire officiel) — repli ; éditable au CMS. Photos : DG, DAGF, RSI.
export const DEFAULT_PERSONNEL: { name: string; role: string; photo?: string; pos?: string }[] = [
  { name: "GOUEDAN Franck Olivier", role: "Directeur Général", photo: "/images/team/dg.jpg", pos: "50% 18%" },
  { name: "KONE Madoussou Yari épse Sombo", role: "Directrice Administration Gestion Finance", photo: "/images/team/dagf.jpg", pos: "50% 16%" },
  { name: "TOURE Adama", role: "Responsable des Systèmes d'Information", photo: "/images/team/rsi.jpg", pos: "50% 30%" },
  { name: "KOISSI Aya Philomène épse Kouamé", role: "Responsable Audit Interne et QSE" },
  { name: "DJEDJERO Natacha", role: "Contrôleur Interne" },
  { name: "AKPOUE Affouet Rosabelle", role: "Responsable Exploitation" },
  { name: "TRAORE Ismaël", role: "Responsable Financier" },
  { name: "N'ZI Obodji Micheline", role: "Responsable Administratif" },
  { name: "ASSI Amon Anna Patricia", role: "Gestionnaire de Portefeuille" },
  { name: "KOUASSI Affoua Elisabeth", role: "Gestionnaire de Portefeuille" },
  { name: "M'BEDJI Guie Banou Tresore", role: "Gestionnaire de Portefeuille" },
  { name: "ZEZE Amenan Marie Sophie Ange", role: "Gestionnaire de Portefeuille" },
  { name: "GOUA Jean Moïse", role: "Comptable" },
  { name: "BONOUMAN Effossy Marie Esther", role: "Caissière" },
  { name: "DEGNI Achiket Patricia Laure", role: "Secrétaire de Direction" },
  { name: "KONE Siriki", role: "Chauffeur-Coursier" },
  { name: "OKAIGNE Achi Abel", role: "Chauffeur DG" },
  { name: "KONAN François Léopold", role: "Chauffeur DAGF" },
];

export interface SiteSettings {
  flashBanner?: { enabled: boolean; text: string; link?: string };
  flashInfos?: { enabled: boolean; speed?: number; items: { text: string; url?: string }[] };
  contact?: { address: string; phone: string; email: string; hours?: string; dcpEmail?: string };
  social?: { facebook: string; linkedin: string; twitter: string };
  orgChart?: OrgChart;
  orgTree?: OrgNode;
  orgImage?: string; // image d'organigramme téléversée au CMS (remplace le schéma SVG par défaut si présente)
  orgUnits?: OrgUnit[];
  personnel?: { name: string; role: string; photo?: string; pos?: string }[];
  splash?: { enabled: boolean; image: string; link?: string };
  whatsapp?: { enabled: boolean; phone: string; message?: string };
  chatbot?: { enabled: boolean; url: string };
  whyUs?: {
    kicker?: string; titleStart?: string; titleEm?: string; lead?: string;
    feat1Title?: string; feat1Desc?: string; feat2Title?: string; feat2Desc?: string;
    stat1Value?: string; stat1Label?: string; stat2Value?: string; stat2Label?: string;
    growthLabel?: string; growthValue?: string;
  };
  presidentQuote?: { quote?: string; name?: string; role?: string; bgImage?: string; bgColor?: string };
  homeHero?: { badge?: string; title1?: string; title2?: string; leadPre?: string; leadMembers?: string; leadPost?: string; ctaProducts?: string; ctaJoin?: string };
  aboutContent?: { founderVision?: string; founderQuote?: string; founderName?: string; founderRole?: string; founderPhoto?: string; founderPhotoPos?: string; mission1Title?: string; mission1Desc?: string; mission2Title?: string; mission2Desc?: string; mission3Title?: string; mission3Desc?: string };
  milestones?: { year: string; title: string; desc: string }[];
  languages?: { code: string; label: string }[];
  branding?: { primary?: string };
}

const fallbackSettings: SiteSettings = {
  flashBanner: {
    enabled: true,
    text: "Depuis le 01/12/2022, ouverture officielle de la plateforme E-MA2E. Coût du service : 500 F/mois.",
    link: "",
  },
};

export function useSettings() {
  return useQuery({
    queryKey: ["public", "settings"],
    // Pas de catch → repli : en cas d'échec réseau ponctuel, React Query conserve la
    // dernière valeur valide (sinon chatbot/pop-up disparaissent par intermittence).
    // Le repli reste assuré au 1er rendu par `initialData`.
    queryFn: () => api<SiteSettings>("/settings"),
    initialData: fallbackSettings,
  });
}

/* ---------------- FAQ ---------------- */
export interface PublicFaq {
  category: string;
  q: string;
  a: string;
}

const fallbackFaq: PublicFaq[] = FAQS.map((f) => ({ category: f.category, q: f.q, a: f.a }));

export function useFaq() {
  return useQuery({
    queryKey: ["public", "faq"],
    queryFn: async () => {
      try {
        const rows = await api<Array<{ category: string; question: string; answer: string }>>("/faq");
        return rows.map((r) => ({ category: r.category, q: r.question, a: r.answer }));
      } catch {
        return fallbackFaq;
      }
    },
    initialData: fallbackFaq,
  });
}

/* ---------------- Médiathèque ---------------- */
export interface PublicMedia {
  category: string;
  title: string;
  desc: string;
  size?: string;
  year?: string;
  href?: string;
}

const fallbackMedia: PublicMedia[] = MEDIA.map((m) => ({ ...m }));

export function useMedia() {
  return useQuery({
    queryKey: ["public", "media"],
    queryFn: async () => {
      try {
        const rows = await api<Array<{ title: string; desc?: string; category: string; path?: string; size?: string; year?: string }>>(
          "/media"
        );
        return rows.map((m) => ({
          category: m.category,
          title: m.title,
          desc: m.desc ?? "",
          size: m.size,
          year: m.year,
          href: m.path || undefined,
        }));
      } catch {
        return fallbackMedia;
      }
    },
    initialData: fallbackMedia,
  });
}
