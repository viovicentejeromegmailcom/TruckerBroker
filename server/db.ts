import pg from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from "@shared/schema";
import dotenv from 'dotenv';

// Load environment variables from .env file for local development
dotenv.config();

const { Pool } = pg;

// // Check if running in Replit (will have a REPL_ID environment variable)
// // For local testing, we'll force local mode with an environment variable
// const isReplit = !!process.env.REPL_ID;
// const forceLocalMode = process.env.FORCE_LOCAL_MODE === 'true';

// // If we're forcing local mode for testing, override the Replit detection
// const useReplitConfig = isReplit && !forceLocalMode;

let poolConfig: pg.PoolConfig;

// if (useReplitConfig) {
//   // Replit environment - use DATABASE_URL
//   if (!process.env.REACT_APP_DATABASE_URL) {
//     throw new Error("REACT_APP_DATABASE_URL must be set when running in Replit environment");
//   }
//
//   poolConfig = { connectionString: process.env.REACT_APP_DATABASE_URL };
//   console.log("Connecting to Replit database...");
// } else {

  // Local environment - can use either connection string or individual parameters
  if (process.env.REACT_APP_DATABASE_URL) {
    // If DATABASE_URL is provided in .env file, use it
    poolConfig = { connectionString: process.env.REACT_APP_DATABASE_URL };
    console.log("Connecting to database using connection string...");
  } else {
    // Otherwise, try to use individual connection parameters
    poolConfig = {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432'),
      database: process.env.PGDATABASE || 'postgres',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '', // Empty string if not set
    };
    console.log("Connecting to database using individual parameters...");
  }
// }

// Create the pool connection
export const pool = new Pool(poolConfig);

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err.message);
    console.error('Please check your database connection settings in your .env file');

    // For debugging connection issues
    console.log('Connection config:', {
      // isReplit,
      // forceLocalMode,
      // useReplitConfig,
      host: poolConfig.host || 'using connection string',
      database: poolConfig.database || 'using connection string',
      user: poolConfig.user || 'using connection string'
    });

    // Don't throw error here to allow application to start even with DB issues
    // This allows for easier debugging
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

export const db = drizzle(pool, { schema });
