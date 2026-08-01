import {
  findProperty,
  getTvFunctionNames,
  isObjectProperty,
  propertyKeyName,
  staticStringValue,
  walkNode
} from './ast-utils.js';
import { isBlankClassString } from './array-structure.js';
import type {
  ClassValueVisitors,
  EstreeArrayExpression,
  EstreeCallExpression,
  EstreeNode,
  LocatedNode,
  PluginOptions
} from './types.js';

const visitClassValues = (
  valueNode: EstreeNode | null | undefined,
  visitors: ClassValueVisitors
) => {
  if (!valueNode) {
    return;
  }

  if (valueNode.type === 'ArrayExpression') {
    visitors.onArray(valueNode as EstreeArrayExpression & LocatedNode);
    return;
  }

  const str = staticStringValue(valueNode);

  if (str !== null) {
    if (isBlankClassString(str)) {
      visitors.onBlankString(valueNode);
    } else {
      visitors.onStaticString?.(valueNode, str);
    }
    return;
  }

  if (valueNode.type === 'ObjectExpression') {
    for (const prop of (valueNode.properties as EstreeNode[]) ?? []) {
      if (isObjectProperty(prop)) {
        visitClassValues(prop.value, visitors);
      }
    }
  }
};

export const visitTvCallClassValues = (
  call: EstreeCallExpression,
  functionNames: Set<string>,
  visitors: ClassValueVisitors
): void => {
  const { callee, arguments: args } = call;

  if (
    !callee ||
    callee.type !== 'Identifier' ||
    !functionNames.has(callee.name as string) ||
    !args.length
  ) {
    return;
  }

  const arg0 = args[0];

  if (!arg0 || arg0.type !== 'ObjectExpression') {
    return;
  }

  const baseProp = findProperty(arg0, 'base');

  if (baseProp) {
    visitClassValues(baseProp.value, visitors);
  }

  const slotsProp = findProperty(arg0, 'slots');

  if (slotsProp?.value?.type === 'ObjectExpression') {
    for (const prop of (slotsProp.value.properties as EstreeNode[]) ?? []) {
      if (isObjectProperty(prop)) {
        visitClassValues(prop.value, visitors);
      }
    }
  }

  const variantsProp = findProperty(arg0, 'variants');

  if (variantsProp?.value?.type === 'ObjectExpression') {
    for (const variantProp of (variantsProp.value.properties as EstreeNode[]) ?? []) {
      if (!isObjectProperty(variantProp)) {
        continue;
      }

      const values = variantProp.value;

      if (!values || values.type !== 'ObjectExpression') {
        continue;
      }

      for (const valueProp of (values.properties as EstreeNode[]) ?? []) {
        if (isObjectProperty(valueProp)) {
          visitClassValues(valueProp.value, visitors);
        }
      }
    }
  }

  for (const key of ['compoundVariants', 'compoundSlots'] as const) {
    const prop = findProperty(arg0, key);

    if (!prop || prop.value?.type !== 'ArrayExpression') {
      continue;
    }

    for (const el of (prop.value.elements as Array<EstreeNode | null>) ?? []) {
      if (!el || el.type !== 'ObjectExpression') {
        continue;
      }

      for (const inner of (el.properties as EstreeNode[]) ?? []) {
        const name = propertyKeyName(inner);

        if (name === 'class' || name === 'className') {
          if (isObjectProperty(inner)) {
            visitClassValues(inner.value, visitors);
          }
        }
      }
    }
  }
};

export const collectTvClassTargets = (
  ast: EstreeNode,
  options: PluginOptions
): {
  arrayNodes: Array<EstreeArrayExpression & LocatedNode>;
  blankStringNodes: LocatedNode[];
  staticStringNodes: Array<{ node: LocatedNode; value: string }>;
} => {
  const root = ast.type === 'File' ? (ast.program as EstreeNode) : ast;

  if (!root || root.type !== 'Program') {
    return { arrayNodes: [], blankStringNodes: [], staticStringNodes: [] };
  }

  const functionNames = getTvFunctionNames(options);

  if (functionNames.size === 0) {
    return { arrayNodes: [], blankStringNodes: [], staticStringNodes: [] };
  }

  const arrayNodes: Array<EstreeArrayExpression & LocatedNode> = [];
  const blankStringNodes: LocatedNode[] = [];
  const staticStringNodes: Array<{ node: LocatedNode; value: string }> = [];

  walkNode(root, (node) => {
    if (node.type === 'CallExpression') {
      visitTvCallClassValues(node as EstreeCallExpression, functionNames, {
        onArray: (arrayNode) => {
          arrayNodes.push(arrayNode);
        },
        onBlankString: (stringNode) => {
          blankStringNodes.push(stringNode);
        },
        onStaticString: (stringNode, value) => {
          staticStringNodes.push({ node: stringNode, value });
        }
      });
    }
  });

  return { arrayNodes, blankStringNodes, staticStringNodes };
};
