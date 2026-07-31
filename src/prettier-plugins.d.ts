declare module 'prettier/plugins/typescript.mjs' {
  import type { Plugin } from 'prettier';
  const plugin: Plugin;
  export default plugin;
}

declare module 'prettier/plugins/babel.mjs' {
  import type { Plugin } from 'prettier';
  const plugin: Plugin;
  export default plugin;
}

declare module 'prettier-plugin-astro' {
  import type { Plugin } from 'prettier';
  const plugin: Plugin;
  export default plugin;
  export const parsers: NonNullable<Plugin['parsers']>;
  export const printers: NonNullable<Plugin['printers']>;
  export const languages: NonNullable<Plugin['languages']>;
  export const options: NonNullable<Plugin['options']>;
  export const defaultOptions: NonNullable<Plugin['defaultOptions']>;
}

declare module 'prettier-plugin-tailwindcss/sorter' {
  export interface SorterOptions {
    base?: string;
    filepath?: string;
    configPath?: string;
    stylesheetPath?: string;
    preserveWhitespace?: boolean;
    preserveDuplicates?: boolean;
  }

  export interface Sorter {
    sortClassAttributes(classes: string[]): string[];
    sortClassLists(classes: string[][]): string[][];
  }

  export function createSorter(opts: SorterOptions): Promise<Sorter>;
}
