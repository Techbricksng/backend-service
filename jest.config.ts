import type { Config } from '@jest/types';

const config: Config.InitialOptions = {
    preset: 'ts-jest', // Use ts-jest for TypeScript
    testEnvironment: 'node', // Use Node.js environment
    testMatch: ['**/tests/**/*.test.ts'], // Look for test files in the `tests` folder
    moduleFileExtensions: ['ts', 'js', 'json'], // Support TypeScript and JavaScript files
    transform: {
        '^.+\\.ts$': 'ts-jest', // Transform TypeScript files using ts-jest
    },
    collectCoverage: true, // Enable coverage reporting
    coverageDirectory: 'coverage', // Output coverage reports to the `coverage` folder
    coverageReporters: ['text', 'lcov'], // Generate text and lcov coverage reports
};

export default config;