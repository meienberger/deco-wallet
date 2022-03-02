const esModules = ['@react-native', 'react-native'].join('|');

module.exports = {
  preset: 'react-native',
  setupFiles: ['./src/jest/setup.ts'],
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect'],
  transformIgnorePatterns: [`node_modules/(?!(${esModules})/)`],
  modulePathIgnorePatterns: ['<rootDir>/build'],
  collectCoverageFrom: ['**/src/**/*.{js,jsx,ts,tsx}', '!**/node_modules/**', '!**/ios/**', '!**/android/**'],
};
