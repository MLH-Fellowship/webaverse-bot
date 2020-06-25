module.exports = {
  env: {
    commonjs: true,
    es2020: true,
    node: true,
  },
  extends: 'semistandard',
  parserOptions: {
    ecmaVersion: 11,
  },
  rules: {
    'comma-dangle': ['error', 'always-multiline'],
    'object-curly-spacing': ['error', 'never'],
    'linebreak-style': ['error', 'unix'],
    'space-before-function-paren': ['error', {
      anonymous: 'never',
      named: 'never',
      asyncArrow: 'always',
    }],
  },
};
