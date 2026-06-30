/**
 * Import ponctuel des actualités « galerie » (événements MA2E).
 * Crée 3 articles EN BROUILLON (status: draft) — l'admin relit puis publie.
 * Idempotent : si le slug existe déjà, l'article est ignoré.
 *
 * Lancer depuis le dossier backend :
 *   npx ts-node --transpile-only prisma/import-actualites.ts
 *
 * Pré-requis : les photos doivent être déployées sur le front (Vercel) sous
 * public/images/actualites/<slug>/NN.jpg (chemins référencés ci-dessous).
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// slug URL-safe (identique à src/lib/slug.ts), inliné pour rendre le script autonome.
const slugify = (input: string): string =>
  input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);

// Génère la liste des chemins d'une galerie : 01.jpg … NN.jpg
const gal = (slug: string, n: number) =>
  Array.from({ length: n }, (_, i) => `/images/actualites/${slug}/${String(i + 1).padStart(2, '0')}.jpg`);

type Block = { type: 'p' | 'h2' | 'quote' | 'list' | 'gallery'; text?: string; items?: string[] };
interface ArticleInput {
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  tags: string[];
  content: Block[];
}

const ARTICLES: ArticleInput[] = [
  {
    title: 'Fête du Travail : la MA2E à l’honneur de ses équipes',
    excerpt:
      "À l'occasion de la Fête du Travail, la MA2E a célébré l'engagement et le dévouement de l'ensemble de son personnel.",
    category: 'Événements',
    image: '/images/actualites/fete-du-travail/01.jpg',
    date: '1er mai 2026', // À CONFIRMER
    tags: ['Fête du travail', 'Personnel', 'Vie de la mutuelle'],
    content: [
      {
        type: 'p',
        text: "À l'occasion de la Fête du Travail, la MA2E a tenu à honorer celles et ceux qui font vivre la mutuelle au quotidien. Un moment convivial a réuni les équipes autour d'un geste symbolique de reconnaissance.",
      },
      { type: 'p', text: 'Retour en images sur cette célébration placée sous le signe de la cohésion et de la reconnaissance.' },
      { type: 'gallery', items: gal('fete-du-travail', 7) },
    ],
  },
  {
    title: 'Octobre Rose 2025 : la MA2E engagée pour la sensibilisation',
    excerpt: "La MA2E s'est mobilisée pour Octobre Rose, mois de sensibilisation au dépistage du cancer du sein.",
    category: 'Événements',
    image: '/images/actualites/octobre-rose-2025/09.jpg',
    date: 'Octobre 2025',
    tags: ['Octobre Rose', 'Santé', 'Sensibilisation'],
    content: [
      {
        type: 'p',
        text: "Dans le cadre d'Octobre Rose, mois international de sensibilisation au dépistage du cancer du sein, la MA2E s'est mobilisée aux côtés de son personnel et de ses sociétaires. Le rose s'est invité dans nos locaux pour rappeler l'importance de la prévention et du dépistage précoce.",
      },
      { type: 'p', text: 'Un engagement qui illustre l’attention portée par la mutuelle à la santé et au bien-être de sa communauté.' },
      { type: 'gallery', items: gal('octobre-rose-2025', 13) },
    ],
  },
  {
    title: 'Remise de matériel au personnel de la MA2E',
    excerpt: "La MA2E a procédé à une remise de matériel à son personnel afin de renforcer les conditions de travail des équipes.",
    category: 'Événements',
    image: '/images/actualites/remise-de-materiel/07.jpg',
    date: '2026', // À CONFIRMER
    tags: ['Personnel', 'Vie de la mutuelle'],
    content: [
      {
        type: 'p',
        text: "La MA2E a organisé une remise de matériel à l'attention de son personnel. Cette initiative vise à améliorer les conditions de travail et à accompagner les équipes dans leurs missions au service des sociétaires.",
      },
      { type: 'p', text: 'Retour en images sur cette remise.' },
      { type: 'gallery', items: gal('remise-de-materiel', 8) },
    ],
  },
];

async function main() {
  for (const a of ARTICLES) {
    const slug = slugify(a.title);
    const existing = await prisma.article.findUnique({ where: { slug } });
    if (existing) {
      console.log(`= déjà présent, ignoré : ${slug}`);
      continue;
    }
    await prisma.article.create({
      data: {
        title: a.title,
        excerpt: a.excerpt,
        category: a.category,
        content: a.content as any,
        image: a.image,
        date: a.date,
        tags: a.tags,
        status: 'draft',
        publishedAt: null,
        slug,
      },
    });
    console.log(`+ créé (brouillon) : ${slug}`);
  }
  console.log('\nTerminé. Articles créés en BROUILLON — à relire et publier dans le back-office.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    return prisma.$disconnect().finally(() => process.exit(1));
  });
