/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/security'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,

  // Security tests use supertest against Express app — no DB connection needed
  // No globalSetup/globalTeardown required

  testTimeout: 10000,
  maxWorkers: 1,
};
