import {
  flatArray,
  multiTv,
  nestedArray,
  noTv,
  realCard,
  stringOnly,
  vueScript
} from './workloads.mjs';

/**
 * Scenario metadata + task factories.
 * Both implementations (`plugin`, `tw-only`) run every scenario.
 */
export const scenarios = [
  {
    id: 'gate/no-tv',
    category: 'gate',
    name: 'no tv() call',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('typescript');
      return async () => {
        await format(noTv);
      };
    }
  },
  {
    id: 'format/string-only',
    category: 'format',
    name: 'string-only tv()',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('typescript');
      return async () => {
        await format(stringOnly);
      };
    }
  },
  {
    id: 'format/flat-array',
    category: 'format',
    name: 'flat class arrays',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('typescript');
      return async () => {
        await format(flatArray);
      };
    }
  },
  {
    id: 'format/nested-array',
    category: 'format',
    name: 'nested arrays + compounds',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('typescript');
      return async () => {
        await format(nestedArray);
      };
    }
  },
  {
    id: 'format/multi-tv',
    category: 'format',
    name: 'multiple tv() calls',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('typescript');
      return async () => {
        await format(multiTv);
      };
    }
  },
  {
    id: 'format/real-card',
    category: 'format',
    name: 'real-card sized tv()',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('typescript');
      return async () => {
        await format(realCard);
      };
    }
  },
  {
    id: 'framework/vue',
    category: 'framework',
    name: 'Vue <script setup>',
    implementations: ['plugin', 'tw-only'],
    createTask: (adapter) => {
      const format = adapter.createFormat('vue');
      return async () => {
        await format(vueScript);
      };
    }
  }
];
