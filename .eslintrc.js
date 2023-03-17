module.exports = {
    extends: ['expensify', 'plugin:@typescript-eslint/recommended'],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint'],
    rules: {
        // Overwriting this for now because web-e will conflict with this
        'react/jsx-filename-extension': [1, {extensions: ['.js', '.tsx']}],
        'es/no-optional-chaining': 'off',
        'import/extensions': ['error', 'always', {
            js: 'never',
            jsx: 'never',
            ts: 'never',
            tsx: 'never',
        }],
    },
    env: {
        jest: true,
    },
    settings: {

        'import/resolver': {
            node: {
                extensions: ['.js', '.native.js', '.web.js', '.ts', '.tsx', '.web.ts', '.web.tsx', '.native.ts', '.native.tsx'],
            },
        },
    },
    ignorePatterns: 'dist',
};
