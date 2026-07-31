/** @type {import('lint-staged').Configuration} */
export default {
  '*.{ts,mts,cts,js,mjs,cjs}': ['eslint --fix --max-warnings 0'],
  '*.{json,jsonc,md,yml,yaml,css}': ['prettier --write']
};
