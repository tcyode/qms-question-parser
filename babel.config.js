/**
 * @fileoverview Babel configuration for QMS Question Parser
 * @author [Your Name]
 * @version 1.0.0
 */

module.exports = {
    presets: [
        ['@babel/preset-env', {
            targets: {
                node: 'current'
            },
            // 🆕 NEW: Added specific configuration options
            modules: 'commonjs',
            debug: false,
            useBuiltIns: 'usage',
            corejs: 3
        }],
    ],
    // 🆕 NEW: Added environment-specific settings
    env: {
        test: {
            // Test-specific transformations
            plugins: [
                '@babel/plugin-transform-modules-commonjs',
                '@babel/plugin-transform-runtime'
            ]
        }
    },
    // 🆕 NEW: Added plugins for better support
    plugins: [
        '@babel/plugin-proposal-class-properties',
        '@babel/plugin-transform-runtime'
    ],
    // 🆕 NEW: Added specific ignore patterns
    ignore: [
        'node_modules',
        'coverage',
        'dist'
    ]
};