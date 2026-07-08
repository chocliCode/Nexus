import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

export default async function globalSetup() {
  dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
  
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL?.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  try {
    // Run all migrations
    const migrationsDir = path.join(__dirname, '../src/db/migrations');
    const files = fs.readdirSync(migrationsDir).sort();
    
    // We should clear everything first by dropping the schema
    await pool.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    for (const file of files) {
      if (file.endsWith('.sql')) {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        await pool.query(sql);
      }
    }

    // Run seeds
    const seedsDir = path.join(__dirname, '../src/db/seeds');
    if (fs.existsSync(seedsDir)) {
      const seedFiles = fs.readdirSync(seedsDir).sort();
      for (const file of seedFiles) {
        if (file.endsWith('.sql')) {
          const filePath = path.join(seedsDir, file);
          const sql = fs.readFileSync(filePath, 'utf8');
          await pool.query(sql);
        }
      }
    }
    
    // Register the e2etest@e2etest.com user for E2E testing
    const e2eEmail = 'e2etest@e2etest.com';
    const e2ePass = 'E2eTestPass123!';
    const hash = bcrypt.hashSync(e2ePass, 12); // match seed rounds just in case, or 10

    await pool.query(`
      INSERT INTO usuario (nombres, apellidos, email, contrasena_hash, rol)
      VALUES ('E2E', 'Test User', $1, $2, 'Padawan')
      ON CONFLICT (email) DO NOTHING;
    `, [e2eEmail, hash]);
  } catch (err) {
    console.error('Error in globalSetup:', err);
    throw err;
  } finally {
    await pool.end();
  }
}
