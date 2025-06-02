# @hyperse/unplugin-swc

<p align="left">
  <a aria-label="Build" href="https://github.com/hyperse-io/unplugin-swc/actions?query=workflow%3ACI">
    <img alt="build" src="https://img.shields.io/github/actions/workflow/status/hyperse-io/unplugin-swc/ci-integrity.yml?branch=main&label=ci&logo=github&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="stable version" href="https://www.npmjs.com/package/@hyperse/unplugin-swc">
    <img alt="stable version" src="https://img.shields.io/npm/v/%40hyperse%2Funplugin-swc?branch=main&label=version&logo=npm&style=flat-quare&labelColor=000000" />
  </a>
  <a aria-label="Top language" href="https://github.com/hyperse-io/unplugin-swc/search?l=typescript">
    <img alt="GitHub top language" src="https://img.shields.io/github/languages/top/hyperse-io/unplugin-swc?style=flat-square&labelColor=000&color=blue">
  </a>
  <a aria-label="Licence" href="https://github.com/hyperse-io/unplugin-swc/blob/main/LICENSE">
    <img alt="Licence" src="https://img.shields.io/github/license/hyperse-io/unplugin-swc?style=flat-quare&labelColor=000000" />
  </a>
</p>

> A high-performance [SWC](https://swc.rs/) plugin for Vite and Rollup that provides fast TypeScript/JavaScript compilation and transformation.

## Features

- 🚀 Lightning fast compilation with SWC
- 🔄 Seamless integration with Vite and Rollup
- ⚙️ Full TypeScript support with decorator transformations
- 🛠 Configurable through tsconfig.json or .swcrc
- 📦 Minification support for Rollup builds

## Usage

Vite or Rollup:

```ts
import { unpluginSwc } from '@hyperse/unplugin-swc';

export default {
  plugins: [
    unpluginSwc.vite({
      jsc: {
        target: 'es2022', // Does not accept `esnext`	}
      },
    }),
  ],
};
```

### `tsconfig.json`

Following SWC options are inferred from `tsconfig.json`:

- `jsc.parser.syntax`: based on file extension
- `jsc.parser.jsx`, `parser.tsx`: `compilerOptions.jsx`
- `jsc.parser.decorators`: `compilerOptions.experimentalDecorators`
- `jsc.transform.react.pragma`: `compilerOptions.jsxFactory`
- `jsc.transform.react.pragmaFrag`: `compilerOptions.jsxFragmentFactory`
- `jsc.transform.react.importSource`: `compilerOptions.jsxImportSource`
- `jsc.transform.legacyDecorator`: `compilerOptions.experimentalDecorators`
- `jsc.transform.decoratorMetadata`: `compilerOptions.emitDecoratorMetadata`
- `jsc.keepClassNames`: when decorator is enabled, because original class name is required by libs like `type-graphql` to generate correct graphql type

If you wish to disable this behavior and use `.swcrc` to control above `jsc` options, you can use `tsconfigFile` option:

```ts
// Or swc.rollup
unpluginSwc.vite({
  tsconfigFile: false,
});

// It's also possible to use a custom tsconfig file instead of tsconfig.json
unpluginSwc.vite({
  tsconfigFile: './tsconfig.build.json',
});
```

If you are using TypeORM with Vitest and need support for decorators, you can switch from `esbuild` to `SWC` by configuring Vitest as follows:

```ts
import tsconfigPaths from 'vite-tsconfig-paths';
import { configDefaults, defineConfig } from 'vitest/config';
import { unpluginSwc } from '@hyperse/unplugin-swc';

export default defineConfig({
  plugins: [tsconfigPaths(), unpluginSwc.vite({})],
  test: {
    globals: true,
    exclude: [...configDefaults.exclude],
    include: ['**/?(*.){test,spec}.?(c|m)[jt]s?(x)'],
  },
});
```

### Minification

Use the `minify: true` option, it only works for Rollup as Vite uses esbuild to minify the code and cannot be changed.

To have advanced control over the minification process, [use `jsc.minify` option in `.swcrc`](https://swc.rs/docs/configuration/minification).

### Vite

`esbuild` will be automatically disabled if you use this plugin.

## Options

This plugin accepts all `@swc/core` options, except for `jsc` which should be configured in `.swcrc` instead, and some extra options that are specific to this plugin:

### `options.tsconfigFile`

- Type: `boolean`, `string`
- Default: `tsconfig.json`

Disable the use of tsconfig file or specify a custom one.

### `options.include`

- Type: `RegExp`
- Default: `/\.[jt]sx?$/`

Files to include in the transpilation process.

### `options.exclude`

- Type: `RegExp`
- Default: `/node_modules/`

Files to exclude in the transpilation process.

### `options.jsc`

- Type: `object`

Custom [jsc](https://swc.rs/docs/configuration/compilation) options to merge with the default one.
