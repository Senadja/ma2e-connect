import { defineConfig } from '@prisma/config'

export default defineConfig({
  earlyAccess: true,
  studio: {
    // You can configure Prisma Studio here
  },
  migrate: {
    schemaPath: './prisma/schema.prisma',
    databaseUrl: 'file:./dev.db',
  },
})
