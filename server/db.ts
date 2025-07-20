import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure for Neon serverless (works for both Replit and local with Neon)
neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?\n" +
    "For local development:\n" +
    "1. Copy .env.example to .env\n" +
    "2. Update DATABASE_URL with your PostgreSQL connection string\n" +
    "3. Or use a Neon database for easy setup"
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle({ client: pool, schema });
