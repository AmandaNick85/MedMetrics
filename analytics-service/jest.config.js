/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js'],
  testMatch: ['**/src/tests/**/*.test.js', '**/src/tests/**/*.steps.js'],
  testPathIgnorePatterns: ['/node_modules/'],
};
