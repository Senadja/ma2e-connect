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

// Envoi du code de connexion à double facteur.
//
// ⚠ Contrairement aux deux fonctions ci-dessus, celle-ci NE CAPTURE PAS les erreurs et
// les laisse remonter volontairement. Une notification de demande perdue est un incident
// mineur ; un code de connexion perdu bloque l'accès au back-office. L'appelant doit donc
// pouvoir répondre « l'envoi a échoué » plutôt que d'afficher « code envoyé » à tort.
export async function sendLoginCode(to: string, name: string, code: string): Promise<void> {
  const cfg = await resolveSmtp();
  if (!cfg) {
    // Aucun SMTP configuré. En développement, on journalise le code — même « mode log »
    // que les autres envois de ce fichier. Sans cela, un poste de dev sans serveur e-mail
    // ne pourrait plus jamais accéder au back-office.
    // En PRODUCTION on refuse au contraire d'écrire un code de connexion dans les journaux :
    // mieux vaut un échec franc, que les codes de secours savent rattraper.
    if (env.nodeEnv !== 'production') {
      console.log(`📧 [mailer désactivé] Code de connexion pour ${to} : ${code}`);
      return;
    }
    throw new Error("Aucun serveur e-mail n'est configuré : impossible d'envoyer le code de connexion.");
  }

  const text = [
    `Bonjour ${name},`,
    '',
    'Voici votre code de connexion au back-office MA2E :',
    '',
    `    ${code}`,
    '',
    'Ce code est valable 5 minutes et ne peut servir qu\'une seule fois.',
    '',
    "Si vous n'êtes pas à l'origine de cette connexion, ignorez ce message et changez",
    'votre mot de passe : quelqu\'un connaît vos identifiants.',
    '',
    'La Mutuelle des Agents de l\'Eau et de l\'Électricité (MA2E)',
  ].join('\n');

  // Délais courts : la réponse HTTP de /auth/login attend cet envoi, on ne peut pas
  // laisser l'utilisateur devant un écran figé si le serveur SMTP ne répond pas.
  const transporter = nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    connectionTimeout: 10_000,
    greetingTimeout: 10_000,
    socketTimeout: 15_000,
  });
  await transporter.sendMail({
    from: cfg.from,
    to,
    subject: 'Votre code de connexion — back-office MA2E',
    text,
  });
}

// Bienvenue d'un membre du personnel créé par un administrateur.
// Comme les notifications de demandes, les erreurs sont AVALÉES : un e-mail de bienvenue
// perdu ne doit jamais faire échouer la création du compte (contrairement au code de
// connexion, dont l'échec doit remonter). Le membre reçoit son rôle et le rappel que la
// connexion enverra un code à 6 chiffres sur cette même adresse.
export async function sendStaffWelcome(to: string, name: string, roleLabel: string): Promise<void> {
  const loginUrl = `${env.publicUrl}/admin/login`;
  const subject = 'Votre accès au back-office MA2E';
  const text = [
    `Bonjour ${name},`,
    '',
    `Vous avez été ajouté(e) en tant que personnel de la MA2E, avec le rôle « ${roleLabel} ».`,
    '',
    'Vous pouvez accéder au back-office à cette adresse :',
    `    ${loginUrl}`,
    '',
    `Votre identifiant de connexion est votre adresse e-mail : ${to}`,
    'Votre mot de passe vous est communiqué directement par votre administrateur.',
    '',
    'À chaque connexion, un code à 6 chiffres vous sera envoyé sur cette adresse e-mail :',
    'il complète votre mot de passe et empêche que quiconque se connecte à votre place.',
    '',
    "La Mutuelle des Agents de l'Eau et de l'Électricité (MA2E)",
  ].join('\n');

  const cfg = await resolveSmtp();
  if (!cfg) {
    console.log(`📧 [mailer désactivé] ${subject} → ${to} (rôle : ${roleLabel})`);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      auth: cfg.user ? { user: cfg.user, pass: cfg.pass } : undefined,
    });
    await transporter.sendMail({ from: cfg.from, to, subject, text });
  } catch (err) {
    console.error('Échec envoi e-mail de bienvenue:', (err as Error).message);
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
