/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: ['src/**/*.ts', '!src/server.ts'],
  coverageDirectory: 'coverage',
  verbose: true,

  // Load .env.test before each test suite
  setupFiles: ['<rootDir>/tests/setup.ts'],

  // Close the DB pool once after ALL suites finish
  globalTeardown: '<rootDir>/tests/globalTeardown.ts',

  // Run test files serially to avoid pool contention across files
  maxWorkers: 1,

  // Integration tests hit the DB; give them time to respond
  testTimeout: 15000,
};
