module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleDirectories: ["node_modules", "<rootDir>/src"],
  modulePaths: ["<rootDir>"],
  clearMocks: true,
  collectCoverage: true,
  setupFiles: ["dotenv/config"],
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/mocks/**",
    "!src/models/**",
    "!src/types/**",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  transform: {
    "^.+\\.(js|jsx|ts|tsx)$": "<rootDir>/node_modules/babel-jest",
  },
  transformIgnorePatterns: ["node_modules/(?!ethereum-cryptography).*"],
};
