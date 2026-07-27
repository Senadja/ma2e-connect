import { app } from './app';
import { env } from './lib/env';
import { ensureAppRefSequence } from './lib/appRef';

async function main() {
  // Prépare la séquence des références de demandes avant d'accepter du trafic.
  await ensureAppRefSequence();
  app.listen(env.port, () => {
    console.log(`🚀 MA2E API en écoute sur http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Échec du démarrage du serveur :', err);
  process.exit(1);
});
