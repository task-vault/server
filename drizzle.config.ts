import { defineConfig } from 'drizzle-kit';
export default defineConfig({
  schema: './src/drizzle/drizzle.schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL || '',
  },
});
