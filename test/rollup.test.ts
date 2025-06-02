import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { rollup } from 'rollup';
import { unpluginSwc } from '../dist/index.js';

const getDirname = (url: string, ...paths: string[]) => {
  return join(dirname(fileURLToPath(url)), ...paths);
};

const fixture = (...args: string[]) => {
  return getDirname(import.meta.url, 'fixtures', ...args);
};

describe('rollup', () => {
  it('should compile basic typescript', async () => {
    const bundle = await rollup({
      input: fixture('rollup/index.ts'),
      plugins: [
        unpluginSwc.rollup({
          tsconfigFile: false,
        }),
      ],
    });

    const { output } = await bundle.generate({
      format: 'cjs',
      dir: fixture('rollup/dist'),
    });
    expect(output[0].code).toMatchInlineSnapshot(`
  "'use strict';

  var foo = "foo";

  exports.foo = foo;
  "
  `);
  });

  it('should read and apply tsconfig options', async () => {
    const bundle = await rollup({
      input: fixture('read-tsconfig/index.tsx'),
      plugins: [unpluginSwc.rollup({})],
    });

    const { output } = await bundle.generate({
      format: 'cjs',
      dir: fixture('read-tsconfig/dist'),
    });

    const code = output[0].code;
    expect(code).toMatch('customJsxFactory');

    // Should throw when experimentalDecorators is disabled
    await expect(
      rollup({
        input: fixture('read-tsconfig/index.tsx'),
        plugins: [unpluginSwc.rollup({ tsconfigFile: 'tsconfig.base.json' })],
      })
    ).rejects.toThrow('Syntax Error');
  });

  it('should respect custom swcrc configuration', async () => {
    const bundle = await rollup({
      input: fixture('custom-swcrc/index.tsx'),
      plugins: [
        unpluginSwc.rollup({
          tsconfigFile: false,
        }),
      ],
    });

    const { output } = await bundle.generate({
      format: 'cjs',
      dir: fixture('custom-swcrc/dist'),
    });

    const code = output[0].code;
    expect(code).toMatch('customPragma');
  });

  it('should minify output when enabled', async () => {
    const bundle = await rollup({
      input: fixture('minify/index.ts'),
      plugins: [
        unpluginSwc.rollup({
          minify: true,
        }),
      ],
    });

    const { output } = await bundle.generate({
      format: 'cjs',
      dir: fixture('minify/dist'),
    });

    const code = output[0].code;
    expect(code).toMatchInlineSnapshot(`
    ""use strict";function _class_call_check(instance,Constructor){if(!(instance instanceof Constructor)){throw new TypeError("Cannot call a class as a function")}}var Foo=function Foo(){_class_call_check(this,Foo);this.a=1};exports.Foo=Foo;
    "
    `);
  });
});
