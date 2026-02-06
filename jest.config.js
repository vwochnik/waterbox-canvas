export default {
  setupFiles: ["./test/setup.ts"],
  transform: {
    ".(ts|tsx)": "ts-jest"
  },
  testEnvironment: "jsdom",
  testRegex: "(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$",
  moduleFileExtensions: [
    "ts",
    "tsx",
    "js"
  ]
};
