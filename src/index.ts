import { defu } from 'defu';
import { getTsconfig } from 'get-tsconfig';
import path from 'node:path';
import { createUnplugin } from 'unplugin';
import { createFilter } from '@rollup/pluginutils';
import { type JscTarget, transform, type TransformConfig } from '@swc/core';
import { resolveId } from './resolve.js';
import type { Options, SWCOptions } from './types.js';

export const unpluginSwc = createUnplugin((swcOptions: Options = {}) => {
  const { tsconfigFile, minify, include, exclude, ...options } = swcOptions;

  const filter = createFilter(
    include || /\.m?[jt]sx?$/,
    exclude || /node_modules/
  );

  return {
    name: 'unplugin-swc',

    resolveId,

    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }

      const compilerOptions =
        tsconfigFile === false
          ? {}
          : getTsconfig(
              path.dirname(id),
              tsconfigFile === true ? undefined : tsconfigFile
            )?.config?.compilerOptions || {};

      const isTs = /\.m?tsx?$/.test(id);

      let jsc: SWCOptions = {
        parser: {
          syntax: isTs ? 'typescript' : 'ecmascript',
        },
        transform: {},
      };

      if (compilerOptions.jsx) {
        Object.assign(jsc.parser || {}, {
          [isTs ? 'tsx' : 'jsx']: true,
        });
        Object.assign<TransformConfig, TransformConfig>(jsc.transform || {}, {
          react: {
            pragma: compilerOptions.jsxFactory,
            pragmaFrag: compilerOptions.jsxFragmentFactory,
            importSource: compilerOptions.jsxImportSource,
          },
        });
      }

      // https://github.com/vendure-ecommerce/vendure/issues/2099
      // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-7.html#the-usedefineforclassfields-flag-and-the-declare-property-modifier
      Object.assign(jsc.transform || {}, {
        // https://www.typescriptlang.org/tsconfig#useDefineForClassFields
        useDefineForClassFields:
          compilerOptions.useDefineForClassFields || false,
      });

      if (compilerOptions.experimentalDecorators) {
        // class name is required by type-graphql to generate correct graphql type
        jsc.keepClassNames = true;
        Object.assign(jsc.parser || {}, {
          decorators: true,
        });
        Object.assign<TransformConfig, TransformConfig>(jsc.transform || {}, {
          legacyDecorator: true,
          decoratorMetadata: compilerOptions.emitDecoratorMetadata,
        });
      }

      if (compilerOptions.target) {
        // jsc target is lowercase.
        jsc.target = compilerOptions.target.toLowerCase() as JscTarget;
      }

      if (options.jsc) {
        jsc = defu<SWCOptions, SWCOptions[]>(options.jsc, jsc);
      }

      const result = await transform(code, {
        filename: id,
        sourceMaps: true,
        ...options,
        jsc,
      });

      return {
        code: result.code,
        map: result.map && JSON.parse(result.map),
      };
    },
    vite: {
      config() {
        return {
          esbuild: false,
        };
      },
    },
    rollup: {
      async renderChunk(code, chunk) {
        if (minify) {
          const result = await transform(code, {
            minify: true,
            sourceMaps: true,
            filename: chunk.fileName,
          });
          return {
            code: result.code,
            map: result.map,
          };
        }
        return null;
      },
    },
  };
});
