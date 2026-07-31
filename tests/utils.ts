import path from 'node:path';
import { fileURLToPath } from 'node:url';
import prettier from 'prettier';
import * as tailwindPlugin from 'prettier-plugin-tailwindcss';
import tailwindVariants, { standalonePlugin } from '../src/index.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const stylesheet = path.resolve(__dirname, 'fixtures/stylesheet.css');

const projectConfigPath = path.resolve(__dirname, '../prettier.config.js');

const basePrettierOptions = async () => {
  const resolved = await prettier.resolveConfig(projectConfigPath);
  return {
    ...resolved,
    parser: 'typescript' as const
  };
};

export const formatWithTv = async (
  code: string,
  extra: Record<string, unknown> = {}
): Promise<string> => {
  return prettier.format(code, {
    ...(await basePrettierOptions()),
    plugins: [tailwindVariants(tailwindPlugin)],
    tailwindFunctions: ['tv'],
    tailwindStylesheet: stylesheet,
    tvFunctions: ['tv'],
    tvUnwrapSingleClassArrays: true,
    ...extra
  });
};

export const formatStandalone = async (
  code: string,
  extra: Record<string, unknown> = {}
): Promise<string> => {
  return prettier.format(code, {
    ...(await basePrettierOptions()),
    plugins: [standalonePlugin],
    tvFunctions: ['tv'],
    tvUnwrapSingleClassArrays: true,
    ...extra
  });
};
