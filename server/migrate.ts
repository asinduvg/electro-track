import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { migrate as pgMigrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import ws from 'ws';

/**
 * Run database migrations
 * This function applies all pending migrations from the migrations folder
 * Automatically detects whether to use Neon Serverless or standard PostgreSQL
 */
export async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL must be set to run migrations');
  }

  const isUsingNeon = process.env.DATABASE_URL.includes('neon.tech');

  console.log('🔄 Running database migrations...');
  console.log(`📦 Database type: ${isUsingNeon ? 'Neon Serverless' : 'PostgreSQL'}`);

  try {
    if (isUsingNeon) {
      // Configure for Neon serverless
      neonConfig.webSocketConstructor = ws;
      neonConfig.useSecureWebSocket = true;
      neonConfig.pipelineConnect = false;

      const pool = new NeonPool({
        connectionString: process.env.DATABASE_URL,
      });

      const db = neonDrizzle({ client: pool });

      await neonMigrate(db, { migrationsFolder: './migrations' });

      await pool.end();
    } else {
      // Configure for standard PostgreSQL
      const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
      });

      const db = pgDrizzle({ client: pool });

      await pgMigrate(db, { migrationsFolder: './migrations' });

      await pool.end();
    }

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  }
}
