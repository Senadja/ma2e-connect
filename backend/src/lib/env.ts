import dotenv from 'dotenv';

dotenv.config();

function required(name: string, fallback?: string): string {
  const v = process.env[name] ?? fallback;
  if (v === undefined) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return v;
}

export const env = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  jwtSecret: required('JWT_SECRET', 'dev-ma2e-secret-change-me'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '8h',
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:8080,http://localhost:5173')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
  smtp: {
    host: process.env.SMTP_HOST ?? '',
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER ?? '',
    pass: process.env.SMTP_PASS ?? '',
    from: process.env.MAIL_FROM ?? 'MA2E <no-reply@ma2e.ci>',
    toApplications: process.env.MAIL_TO_APPLICATIONS ?? 'contact@ma2e.ci',
  },
};
