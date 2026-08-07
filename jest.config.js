module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  setupFiles: ['<rootDir>/src/test/setupEnv.ts'],
  modulePathIgnorePatterns: ["<rootDir>/dist/"]
};
