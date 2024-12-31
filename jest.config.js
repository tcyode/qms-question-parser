/**
 * @fileoverview Jest configuration for QMS Question Parser
 * @author [Your Name]
 * @version 1.0.0
 */

// 🗑️ REMOVED: Don't require modules here
const createMockGoogleServices = () => ({
    SpreadsheetApp: {
        getActiveSpreadsheet: () => ({
            getSheetByName: () => ({
                getRange: () => ({
                    getValues: () => ([]),
                    setValues: () => {},
                    setValue: () => {},
                }),
                appendRow: () => {},
                getLastRow: () => 0,
                getLastColumn: () => 0,
                clear: () => {},
                deleteRow: () => {},
                getDataRange: () => ({
                    getValues: () => ([])
                })
            })
        })
    },
    Logger: {
        log: () => {}
    }
});

module.exports = {
    // Basic Configuration
    verbose: true,
    testEnvironment: 'node',
    
    // 📝 MODIFIED: Module Resolution Settings
    moduleDirectories: ['node_modules', 'src'],
    roots: ['<rootDir>'],
    modulePaths: ['<rootDir>'],
    moduleFileExtensions: ['js', 'json'],

    // File Patterns
    testMatch: [
        '<rootDir>/src/tests/**/*.test.js',
        '<rootDir>/src/tests/**/*.spec.js'
    ],

    // Transform Configuration
    transform: {
        '^.+\\.js$': ['babel-jest', { configFile: './babel.config.js' }]
    },

    // Coverage Configuration
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov'],
    coveragePathIgnorePatterns: [
        '/node_modules/',
        '/coverage/'
    ],

    // Setup Files
    setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],

    // 📝 MODIFIED: Module Name Mapper
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },

    // Test Environment Settings
    testEnvironmentOptions: {
        url: 'http://localhost'
    },

    // Mock Settings
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,

    // Error Handling
    bail: 0,
    
    // Timeout Configuration
    testTimeout: 5000,

    // Reporter Configuration
    reporters: [
        'default',
        ['jest-junit', {
            outputDirectory: 'reports',
            outputName: 'jest-junit.xml',
            classNameTemplate: '{classname}',
            titleTemplate: '{title}',
            ancestorSeparator: ' › ',
            usePathForSuiteName: true
        }]
    ],

    // Global Setup
    globals: createMockGoogleServices(),

    // Transform Ignore Patterns
    transformIgnorePatterns: [
        'node_modules/(?!(module-that-needs-transpiling)/)'
    ],

    // Watch Options
    watchPathIgnorePatterns: [
        '<rootDir>/node_modules/',
        '<rootDir>/dist/',
        '<rootDir>/coverage/'
    ]
};