/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: 'node',
    roots: [
        '<rootDir>/backend/tests',
        '<rootDir>/js/tests'
    ],
    testMatch: ['**/*.test.js'],
    collectCoverage: true,
    coverageDirectory: '<rootDir>/coverage',
    collectCoverageFrom: [
        'backend/services/**/*.js',
        'backend/utils/**/*.js',
        'backend/config/dbConfig.js',
        'js/utils/**/*.js'
    ],
    coverageReporters: ['text', 'text-summary', 'lcov', 'html'],
    coverageThreshold: {
        global: {
            branches: 75,
            functions: 90,
            lines: 80,
            statements: 80
        }
    },
    clearMocks: true,
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js']
};
