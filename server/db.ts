import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import ws from "ws";
import * as schema from "@shared/schema";

const isUsingNeon = process.env.DATABASE_URL?.includes('neon.tech');

let db: ReturnType<typeof neonDrizzle | typeof pgDrizzle>;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?\n" +
    "For local development:\n" +
    "1. Copy .env.example to .env\n" +
    "2. Update DATABASE_URL with your PostgreSQL connection string\n" +
    "3. Or use a Neon database for easy setup"
  );
}

if (isUsingNeon) {
  // Configure for Neon serverless (works for both Replit and local with Neon)
  neonConfig.webSocketConstructor = ws;

  const pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = neonDrizzle({ client: pool, schema });
} else {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  db = pgDrizzle({ client: pool, schema });
}

export { db };
