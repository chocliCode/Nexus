import dotenv from 'dotenv';
import path from 'path';

// Load .env.test before any test suite runs so that all modules
// (pool, auth middleware, etc.) pick up the correct environment.
dotenv.config({ path: path.resolve(__dirname, '../.env.test') });
