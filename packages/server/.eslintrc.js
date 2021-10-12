module.exports = {
  root: true,
  extends: ['meienberger'],
  plugins: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: ['./tsconfig.json', './tsconfig.eslint.json'],
    tsconfigRootDir: __dirname,
  },
  globals: {
    JSX: true,
  },
  rules: {
    'no-magic-numbers': 0,
    'unicorn/prefer-type-error': 0,
    'unicorn/no-array-method-this-argument': 0,
  },
};
