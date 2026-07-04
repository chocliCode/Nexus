/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests/unit'],
  testMatch: ['**/*.unit.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts', '!src/db/pool.ts'],
  coverageDirectory: 'coverage-unit',
  verbose: true,

  // Unit tests don't need DB setup -- they use mocks
  // No setupFiles needed (no .env.test required)

  // Unit tests are fast -- no need for long timeout
  testTimeout: 5000,
};
