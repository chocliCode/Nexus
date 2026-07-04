import pool from '../src/db/pool';

/**
 * Runs after all test suites within the same worker process.
 * Closes the shared PostgreSQL connection pool to prevent
 * "open handles" warnings from Jest.
 */
afterAll(async () => {
  await pool.end();
});
