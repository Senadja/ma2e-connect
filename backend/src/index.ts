import { app } from './app';
import { env } from './lib/env';

app.listen(env.port, () => {
  console.log(`🚀 MA2E API en écoute sur http://localhost:${env.port}`);
});
