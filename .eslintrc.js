module.exports = {
  root: true,
  extends: '@dooboo/eslint-config',
  plugins: ['react-hooks'],
  rules: {
    'react-hooks/rules-of-hooks': 'error', // Checks rules of Hooks
    'react-hooks/exhaustive-deps': 'warn', // Checks effect dependencies
    'max-len': [
      'error',
      {
        code: 120,
        ignoreRegExpLiterals: true,
        ignoreComments: true,
        ignoreUrls: true,
        ignoreStrings: true,
      },
    ],
    '@typescript-eslint/no-empty-function': 0,
    'no-extra-parens': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
