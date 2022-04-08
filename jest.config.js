module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: ["./packages/*/src/**"],
  coverageDirectory: './coverage/',
  coverageThreshold: {
    global: {
      lines: 75
    }
  },
  coveragePathIgnorePatterns: [
    "node_modules",
    "index.ts",
    "types.ts"
  ],
}