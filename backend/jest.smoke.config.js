/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/smoke'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,

  // Smoke tests use supertest against Express app — no DB connection needed
  // No globalSetup/globalTeardown required

  testTimeout: 10000,
  maxWorkers: 1,
};
