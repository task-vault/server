import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/drizzle/drizzle.schema.ts',
  out: './migrations',
  dialect: 'postgresql',
  strict: true,
  verbose: true,
  dbCredentials: {
    user: process.env.DB_USER!,
    password: process.env.DB_PASSWORD!,
    host: process.env.DB_HOST!,
    port: Number(process.env.DB_PORT!),
    database: process.env.DB_NAME!,
    ssl: {
      rejectUnauthorized: true,
      ca: process.env.DB_CERT!,
    },
  },
});
