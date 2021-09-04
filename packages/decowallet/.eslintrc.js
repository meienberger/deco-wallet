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
};
