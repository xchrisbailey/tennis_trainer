import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config({
  path: ['.env.local', '.env'],
});

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/lib/db/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
