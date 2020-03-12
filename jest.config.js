module.exports = {
  preset: 'ts-jest',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  testPathIgnorePatterns: ['node_modules', 'dist'],
  setupFiles: ['<rootDir>/test/jestSetup.ts'],
};
