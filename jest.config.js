/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: "node",
  testMatch: [
    "<rootDir>/rules/tests/**/*.test.ts",
    "<rootDir>/server/tests/**/*.test.ts",
    "<rootDir>/client/tests/**/*.test.ts",
  ],
  moduleNameMapper: {
    "^rules$": "<rootDir>/rules/src/index.ts",
  },
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        tsconfig: "<rootDir>/tsconfig.jest.json",
      },
    ],
  },
};
