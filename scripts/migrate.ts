import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless';
import { drizzle as neonDrizzle } from 'drizzle-orm/neon-serverless';
import { migrate as neonMigrate } from 'drizzle-orm/neon-serverless/migrator';
import { drizzle as pgDrizzle } from 'drizzle-orm/node-postgres';
import { migrate as pgMigrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
const { Pool } = pkg;
import ws from 'ws';

async function runMigrations() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }

  const isUsingNeon = databaseUrl.includes('neon.tech');

  console.log('🔄 Running database migrations...');
  console.log(`📦 Database type: ${isUsingNeon ? 'Neon Serverless' : 'PostgreSQL'}`);

  try {
    if (isUsingNeon) {
      // Configure for Neon serverless
      neonConfig.webSocketConstructor = ws;
      neonConfig.useSecureWebSocket = true;
      neonConfig.pipelineConnect = false;

      const pool = new NeonPool({
        connectionString: databaseUrl,
      });

      const db = neonDrizzle({ client: pool });

      await neonMigrate(db, {
        migrationsFolder: './migrations'
      });

      await pool.end();
    } else {
      // Configure for standard PostgreSQL
      const pool = new Pool({
        connectionString: databaseUrl,
        max: 1,
      });

      const db = pgDrizzle({ client: pool });

      await pgMigrate(db, {
        migrationsFolder: './migrations'
      });

      await pool.end();
    }

    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.error('Error details:', error);
    process.exit(1);
  }
}

runMigrations();
