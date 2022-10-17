const baseConfig = require('../../jest.config');

module.exports =
{
  ...baseConfig,
  collectCoverageFrom: ["./src/**"],
  coverageThreshold: {
    global: {
      lines: 90
    }
  },
  moduleNameMapper: {
    '^@equinor/fusion\\-observable(.*)$': '<rootDir>/src$1', 
  },
}