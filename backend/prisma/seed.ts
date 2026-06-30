import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
// Données d'amorçage (le front est en ESM, le backend en CommonJS :
// on utilise une copie locale CommonJS pour initialiser la base).
import { NEWS, SAVINGS, CREDITS, MEDIA, FAQS, SETTINGS_DEFAULTS, PARTNERS, TEAM } from './seed-data';

const prisma = new PrismaClient();

const ALL_PERMISSIONS = [
  'news:write',
  'products:write',
  'faq:write',
  'media:write',
  'applications:manage',
  'settings:write',
  'users:manage',
  'partners:write',
  'team:write',
  'contact:manage',
];

const IMMOBILIER = [
  { id: 'duplex-4', name: 'Duplex 4 pièces', desc: 'Duplex moderne 4 pièces, finitions de qualité.', meta: { type: 'Duplex', pieces: '4' } },
  { id: 'duplex-5', name: 'Duplex 5 pièces', desc: 'Duplex spacieux 5 pièces pour grandes familles.', meta: { type: 'Duplex', pieces: '5' } },
  { id: 'villa-3', name: 'Villa 3 pièces', desc: 'Villa individuelle 3 pièces, idéale primo-accédants.', meta: { type: 'Villa', pieces: '3' } },
  { id: 'villa-4', name: 'Villa 4 pièces', desc: 'Villa individuelle 4 pièces avec cour.', meta: { type: 'Villa', pieces: '4' } },
  { id: 'villa-5', name: 'Villa 5 pièces', desc: 'Villa familiale 5 pièces haut standing.', meta: { type: 'Villa', pieces: '5' } },
];

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
    .slice(0, 80);
}

async function seedUsers() {
  const users = [
    { email: 'admin@ma2e.ci', password: 'admin123', name: 'Administrateur MA2E', role: 'ADMIN' as const, permissions: ALL_PERMISSIONS },
    { email: 'editor@ma2e.ci', password: 'editor123', name: 'Éditeur Com', role: 'EDITOR' as const, permissions: ['news:write', 'faq:write'] },
  ];
  for (const u of users) {
    const password = await bcrypt.hash(u.password, 10);
    await prisma.user.upsert({
      where: { email: u.email },
      // On NE réinitialise PAS le mot de passe d'un compte existant (sinon le mot de passe
      // changé au back-office serait écrasé à chaque redémarrage). Le mot de passe par défaut
      // n'est posé qu'à la création initiale du compte.
      update: { name: u.name, role: u.role, permissions: u.permissions },
      create: { email: u.email, password, name: u.name, role: u.role, permissions: u.permissions },
    });
    console.log(`✓ user ${u.email} (${u.role})`);
  }
}

async function seedFaq() {
  const count = await prisma.faqItem.count();
  if (count > 0) {
    console.log(`✓ FAQ déjà présente (${count})`);
    return;
  }
  let order = 0;
  for (const f of FAQS) {
    await prisma.faqItem.create({
      data: { category: f.category, question: f.question, answer: f.answer, order: order++ },
    });
  }
  console.log(`✓ ${FAQS.length} questions FAQ`);
}

async function seedSettings() {
  for (const [key, value] of Object.entries(SETTINGS_DEFAULTS)) {
    await prisma.setting.upsert({
      where: { key },
      update: {},
      create: { key, value: value as object },
    });
  }
  console.log(`✓ ${Object.keys(SETTINGS_DEFAULTS).length} réglages`);
}

async function seedArticles() {
  for (const n of NEWS) {
    const slug = slugify(n.title);
    await prisma.article.upsert({
      where: { slug },
      update: {},
      create: {
        slug,
        title: n.title,
        excerpt: n.excerpt,
        category: n.category,
        content: n.content as object,
        author: n.author ?? null,
        readTime: n.readTime ?? null,
        date: n.date ?? null,
        tags: n.tags ?? [],
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }
  console.log(`✓ ${NEWS.length} articles`);
}

async function seedProducts() {
  let order = 0;
  for (const s of SAVINGS) {
    await prisma.product.upsert({
      where: { type_slug: { type: 'epargne', slug: s.id } },
      update: {},
      create: {
        slug: s.id,
        type: 'epargne',
        name: s.name,
        description: s.desc,
        features: s.features ?? [],
        image: s.image ?? null,
        form: s.form ?? null,
        order: order++,
      },
    });
  }
  order = 0;
  for (const c of CREDITS) {
    await prisma.product.upsert({
      where: { type_slug: { type: 'credit', slug: c.id } },
      update: {},
      create: {
        slug: c.id,
        type: 'credit',
        name: c.name,
        description: c.conditions,
        features: [],
        meta: { duree: c.duree, taux: c.taux, montant: c.montant, conditions: c.conditions },
        image: c.image ?? null,
        form: c.form ?? null,
        order: order++,
      },
    });
  }
  order = 0;
  for (const m of IMMOBILIER) {
    await prisma.product.upsert({
      where: { type_slug: { type: 'immobilier', slug: m.id } },
      update: {},
      create: {
        slug: m.id,
        type: 'immobilier',
        name: m.name,
        description: m.desc,
        features: [],
        meta: m.meta,
        order: order++,
      },
    });
  }
  console.log(`✓ ${SAVINGS.length + CREDITS.length + IMMOBILIER.length} produits`);
}

async function seedPartners() {
  const count = await prisma.partner.count();
  if (count > 0) { console.log(`✓ partenaires déjà présents (${count})`); return; }
  let order = 0;
  for (const p of PARTNERS) {
    await prisma.partner.create({ data: { ...p, order: order++ } });
  }
  console.log(`✓ ${PARTNERS.length} partenaires`);
}

async function seedTeam() {
  const count = await prisma.teamMember.count();
  if (count > 0) { console.log(`✓ équipe déjà présente (${count})`); return; }
  let order = 0;
  for (const t of TEAM) {
    await prisma.teamMember.create({ data: { ...t, order: order++ } });
  }
  console.log(`✓ ${TEAM.length} membres / organes`);
}

async function seedMedia() {
  for (const m of MEDIA) {
    // évite les doublons sur title+category
    const exists = await prisma.mediaFile.findFirst({
      where: { title: m.title, category: m.category },
    });
    if (exists) continue;
    await prisma.mediaFile.create({
      data: {
        title: m.title,
        desc: m.desc,
        category: m.category,
        path: m.href ?? '',
        size: m.size,
        year: m.year,
      },
    });
  }
  console.log(`✓ ${MEDIA.length} documents médiathèque`);
}

async function main() {
  await seedUsers();
  await seedArticles();
  await seedProducts();
  await seedMedia();
  await seedFaq();
  await seedSettings();
  await seedPartners();
  await seedTeam();
  console.log('🌱 Seed terminé.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
