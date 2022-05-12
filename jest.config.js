module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ["./packages/*/src/**"],
  coverageDirectory: './coverage/',
  coverageThreshold: {
    global: {
      lines: 75
    }
  },
  testPathIgnorePatterns: [
    '__mocks__'
  ],
  coveragePathIgnorePatterns: [
    "test-app",
    "node_modules",
    "index.ts",
    "types.ts"
  ],
}