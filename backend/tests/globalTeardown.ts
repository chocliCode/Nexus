import pool from '../src/db/pool';

/**
 * Global Jest teardown.
 * Closes the shared PostgreSQL pool after ALL test suites have finished.
 * This prevents the "Cannot use a pool after calling end" error that occurs
 * when each test file tries to close the pool independently.
 */
export default async function globalTeardown(): Promise<void> {
  await pool.end();
}
