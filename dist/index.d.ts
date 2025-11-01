import * as unplugin from 'unplugin';
import { FilterPattern } from '@rollup/pluginutils';
import { Options as Options$1 } from '@swc/core';

type Options = Options$1 & {
    include?: FilterPattern;
    exclude?: FilterPattern;
    tsconfigFile?: string | boolean;
};

declare const unpluginSwc: unplugin.UnpluginInstance<Options, boolean>;

export { unpluginSwc };
