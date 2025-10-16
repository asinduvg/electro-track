import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from '@shared/schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL must be set. Did you forget to set up the database?\n' +
      'For local development:\n' +
      '1. Copy .env.example to .env\n' +
      '2. Start Docker PostgreSQL: cd docker && docker-compose up -d\n' +
      '3. DATABASE_URL should be: postgresql://myuser:mypassword@localhost:5433/electrotrack'
  );
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

export const db = drizzle({ client: pool, schema });
