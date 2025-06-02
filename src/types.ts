import { type FilterPattern } from '@rollup/pluginutils';
import { type JscConfig, type Options as SwcOptions } from '@swc/core';
export type Options = SwcOptions & {
  include?: FilterPattern;
  exclude?: FilterPattern;
  tsconfigFile?: string | boolean;
};

export type WithRequiredProperty<Type, Key extends keyof Type> = Type & {
  [Property in Key]-?: Type[Property];
};

export type SWCOptions = WithRequiredProperty<
  JscConfig,
  'parser' | 'transform'
>;
