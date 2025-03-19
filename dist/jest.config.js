"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    collectCoverage: false,
    coverageDirectory: 'coverage',
    coverageProvider: 'v8',
    globalSetup: '<rootDir>/src/__tests__/config/setup.ts',
    globalTeardown: '<rootDir>/src/__tests__/config/teardown.ts',
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/__tests__/**/*.[jt]s?(x)', '**/?(*.)+(spec|test).[tj]s?(x)'],
    testPathIgnorePatterns: [
        '/node_modules/',
        '/dist/',
        '/build/',
        '/config/',
        '/__tests__/helpers/',
    ],
    transform: {
        '^.+.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json' }],
    },
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
    },
};
exports.default = config;
//# sourceMappingURL=jest.config.js.map