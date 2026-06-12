import nodemailer from 'nodemailer';
import { env } from './env';
import { prisma } from './prisma';

interface ApplicationMail {
  appId: string;
  category: string;
  type: string;
  name: string;
  matricule: string;
  email: string;
  phone: string;
  data: Record<string, unknown>;
}

interface SmtpConfig {
  host: string;
  port: number;
  user?: string;
  pass?: string;
  secure: boolean;
  from: string;
  to: string;
}

// Résout la config SMTP : priorité au réglage défini dans le back-office (clé "smtp"),
// sinon repli sur les variables d'environnement. Retourne null si rien n'est configuré.
async function resolveSmtp(): Promise<SmtpConfig | null> {
  try {
    const row = await prisma.setting.findUnique({ where: { key: 'smtp' } });
    const s = (row?.value as Record<string, any>) || {};
    if (s.enabled && s.host) {
      const port = Number(s.port) || 587;
      return {
        host: s.host,
        port,
        user: s.user || undefined,
        pass: s.pass || undefined,
        secure: s.secure ?? port === 465,
        from: s.from || env.smtp.from,
        to: s.to || env.smtp.toApplications,
      };
    }
  } catch {
    /* base indisponible → on tente l'env */
  }
  if (env.smtp.host) {
    return {
      host: env.smtp.host,
      port: env.smtp.port,
      user: env.smtp.user || undefined,
      pass: env.smtp.pass || undefined,
      secure: env.smtp.port === 465,
      from: env.smtp.from,
      to: env.smtp.toApplications,
    };
  }
  return null;
}

export async function sendApplicationNotification(app: ApplicationMail): Promise<void> {
  const subject = `Nouvelle demande ${app.category} — ${app.appId}`;
  const lines = [
    `Référence : ${app.appId}`,
    `Catégorie : ${app.category}`,
    `Produit / Type : ${app.type}`,
    `Nom : ${app.name}`,
    `Matricule : ${app.matricule}`,
    `Téléphone : ${app.phone}`,
    `Email : ${app.email || '—'}`,
    '',
    'Détails :',
    ...Object.entries(app.data || {}).map(([k, v]) => `  - ${k} : ${String(v)}`),
  ];
  const text = lines.join('\n');

  const cfg = await resolveSmtp();
  if (!cfg) {
    console.log(`📧 [mailer désactivé] ${subject}\n${text}\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    });
    await transporter.sendMail({
      from: cfg.from,
      to: cfg.to,
      replyTo: app.email || undefined,
      subject,
      text,
    });
  } catch (err) {
    // Ne jamais faire échouer la création de la demande à cause de l'e-mail.
    console.error('Échec envoi e-mail notification:', (err as Error).message);
  }
}

interface DecisionMail {
  appId: string;
  category: string;
  type: string;
  name: string;
  email: string;
  status: 'APPROVED' | 'REJECTED';
  reason?: string;
}

// Notifie le demandeur de la décision (validation ou refus motivé).
// Envoyé à l'adresse e-mail du demandeur, pas à la boîte interne.
export async function sendApplicationDecision(d: DecisionMail): Promise<void> {
  if (!d.email) {
    console.log(`📧 [décision] Pas d'e-mail pour ${d.appId} — notification au demandeur ignorée.`);
    return;
  }

  const approved = d.status === 'APPROVED';
  const subject = approved
    ? `Votre demande ${d.appId} a été acceptée — MA2E`
    : `Votre demande ${d.appId} n'a pas pu être acceptée — MA2E`;

  const lines = approved
    ? [
        `Bonjour ${d.name},`,
        '',
        `Votre demande « ${d.type} » (référence ${d.appId}) a été acceptée.`,
        d.reason ? `\nNote de la MA2E : ${d.reason}` : '',
        '',
        'Nos services reviendront vers vous pour la suite du dossier.',
        '',
        'La Mutuelle des Agents de l\'Eau et de l\'Électricité (MA2E)',
      ]
    : [
        `Bonjour ${d.name},`,
        '',
        `Après examen, votre demande « ${d.type} » (référence ${d.appId}) n'a pas pu être acceptée.`,
        '',
        `Motif : ${d.reason || 'non précisé'}`,
        '',
        'Vous pouvez régulariser votre dossier et soumettre une nouvelle demande, ou nous contacter pour plus de précisions.',
        '',
        'La Mutuelle des Agents de l\'Eau et de l\'Électricité (MA2E)',
      ];
  const text = lines.filter((l) => l !== undefined).join('\n');

  const cfg = await resolveSmtp();
  if (!cfg) {
    console.log(`📧 [mailer désactivé] ${subject}\n${text}\n`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    });
    await transporter.sendMail({
      from: cfg.from,
      to: d.email,
      replyTo: cfg.to || undefined,
      subject,
      text,
    });
  } catch (err) {
    console.error('Échec envoi e-mail décision:', (err as Error).message);
  }
}
