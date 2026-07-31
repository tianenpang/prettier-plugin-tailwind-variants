export interface EstreeNode {
  type: string;
  [key: string]: unknown;
}

export type EstreeLiteral = EstreeNode & {
  type: 'Literal' | 'StringLiteral';
  value: string;
  raw?: string;
  regex?: unknown;
};

export type EstreeIdentifier = EstreeNode & {
  type: 'Identifier';
  name: string;
};

export type EstreeProperty = EstreeNode & {
  type: 'Property' | 'ObjectProperty';
  key: EstreeNode;
  value: EstreeNode;
  computed?: boolean;
};

export type EstreeObjectExpression = EstreeNode & {
  type: 'ObjectExpression';
  properties: EstreeNode[];
};

export type EstreeArrayExpression = EstreeNode & {
  type: 'ArrayExpression';
  elements: Array<EstreeNode | null>;
};

export type EstreeCallExpression = EstreeNode & {
  type: 'CallExpression';
  callee: EstreeNode;
  arguments: EstreeNode[];
};

export type LocatedNode = EstreeNode & {
  start?: number;
  end?: number;
  range?: [number, number];
};

export interface TextEdit {
  start: number;
  end: number;
  replacement: string;
}

export interface ClassValueVisitors {
  onArray: (node: EstreeArrayExpression & LocatedNode) => void;
  onBlankString: (node: LocatedNode) => void;
}

export interface PluginOptions {
  tvFunctions?: string[];
  tvUnwrapSingleClassArrays?: boolean;
  tailwindStylesheet?: string;
  tailwindConfig?: string;
  /** Absolute or cwd-relative path of the file being formatted (from Prettier). */
  filepath?: string;
  originalText?: string;
  [key: string]: unknown;
}

export interface Mobile {
  type: 'mobile';
  token: string;
}
export interface FixedString {
  type: 'fixed-string';
  tokens: string[];
}
export interface FixedArray {
  type: 'fixed-array';
  children: ClassArrayNode[];
}
export interface Drop {
  type: 'drop';
}
export type ClassArrayNode = Mobile | FixedString | FixedArray | Drop;

export interface ClassifyOptions {
  unwrapSingleClassArrays?: boolean;
}
