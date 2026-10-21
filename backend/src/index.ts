import { app } from './app';
import { env } from './lib/env';
import { ensureAppRefSequence } from './lib/appRef';
import { scheduleRetentionPurge } from './lib/dcp';

async function main() {
  // Prépare la séquence des références de demandes avant d'accepter du trafic.
  await ensureAppRefSequence();
  // Purge de fin de conservation (DEV-09) : passe quotidienne, inerte tant que les durées
  // ne sont pas renseignées ET que l'automatisme n'est pas activé au back-office.
  scheduleRetentionPurge();
  app.listen(env.port, () => {
    console.log(`🚀 MA2E API en écoute sur http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Échec du démarrage du serveur :', err);
  process.exit(1);
});
