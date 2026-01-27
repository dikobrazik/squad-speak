const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "jsdom",
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
    "^shared/(.*)$": "<rootDir>/../shared/$1",
    ".*/(.*).(s)?css$": "<rootDir>/config/tests/styles-mock.ts",
  },
  roots: ["<rootDir>/src", "<rootDir>/../shared"],
};
