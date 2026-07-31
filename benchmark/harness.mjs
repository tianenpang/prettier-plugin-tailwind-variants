import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';
import tailwindVariants from '../dist/index.mjs';
import { stylesheet } from './workloads.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectConfigPath = path.resolve(__dirname, '../prettier.config.js');

let retained = 0;

export const hasRetainedResult = () => retained > 0;

export const resetRetained = () => {
  retained = 0;
};

const retain = (value) => {
  retained += typeof value === 'string' ? value.length : 1;
  return value;
};

export const loadImplementations = async () => {
  const resolved = await prettier.resolveConfig(projectConfigPath);
  const plugin = tailwindVariants(tailwindPlugin);

  return [
    {
      id: 'plugin',
      label: 'plugin',
      version: 'current',
      createFormat:
        (parser = 'typescript') =>
        async (code) =>
          retain(
            await prettier.format(code, {
              ...resolved,
              parser,
              plugins: [plugin],
              tailwindFunctions: ['tv'],
              tailwindStylesheet: stylesheet,
              tvFunctions: ['tv'],
              tvUnwrapSingleClassArrays: true,
              filepath: path.join(__dirname, `bench.${parser === 'vue' ? 'vue' : 'ts'}`)
            })
          )
    },
    {
      id: 'tw-only',
      label: 'tw-only',
      version: tailwindPlugin.default?.version ?? '0.8',
      createFormat:
        (parser = 'typescript') =>
        async (code) =>
          retain(
            await prettier.format(code, {
              ...resolved,
              parser,
              plugins: [tailwindPlugin],
              tailwindFunctions: ['tv'],
              tailwindStylesheet: stylesheet,
              filepath: path.join(__dirname, `bench.${parser === 'vue' ? 'vue' : 'ts'}`)
            })
          )
    }
  ];
};
