import { defineConfig } from 'tsup';

export default defineConfig({
  format: ['esm'],
  entry: ['src/index.ts'],
  tsconfig: 'tsconfig.build.json',
  splitting: false,
  sourcemap: true,
  clean: true,
  dts: {
    resolve: true,
  },
});
