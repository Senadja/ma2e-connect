import { defineConfig } from 'vitest/config';

// Config vitest isolée du frontend (sinon vitest remonte au vite.config.ts racine).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    setupFiles: [],
    globals: false,
    testTimeout: 15000,
  },
});
