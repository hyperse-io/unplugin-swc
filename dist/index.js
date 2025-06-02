// src/index.ts
import { defu } from "defu";
import { getTsconfig } from "get-tsconfig";
import path from "path";
import { createUnplugin } from "unplugin";
import { createFilter } from "@rollup/pluginutils";
import { transform } from "@swc/core";

// src/resolve.ts
import fs from "fs";
import { dirname, join, resolve } from "path";
import { pathExists } from "path-exists";
var RESOLVE_EXTENSIONS = [
  ".tsx",
  ".ts",
  ".mts",
  ".jsx",
  ".js",
  ".mjs",
  ".cjs"
];
var resolveFile = async (resolved, index = false) => {
  resolved = resolved.replace(/\.(js|jsx|cjs|mjs|ts|tsx|mts|cts)$/gi, "");
  console.log("resolved", resolved, index);
  for (const ext of RESOLVE_EXTENSIONS) {
    const file = index ? join(resolved, `index${ext}`) : `${resolved}${ext}`;
    if (await pathExists(file)) {
      return file;
    }
  }
  return void 0;
};
var resolveId = async (importee, importer) => {
  if (importer && importee[0] === ".") {
    const absolutePath = resolve(
      importer ? dirname(importer) : process.cwd(),
      importee
    );
    let resolved = await resolveFile(absolutePath);
    if (!resolved && await pathExists(absolutePath) && await fs.promises.stat(absolutePath).then((stat) => stat.isDirectory())) {
      resolved = await resolveFile(absolutePath, true);
    }
    return resolved;
  }
  return void 0;
};

// src/index.ts
var unpluginSwc = createUnplugin((swcOptions = {}) => {
  const { tsconfigFile, minify, include, exclude, ...options } = swcOptions;
  const filter = createFilter(
    include || /\.m?[jt]sx?$/,
    exclude || /node_modules/
  );
  return {
    name: "unplugin-swc",
    resolveId,
    async transform(code, id) {
      if (!filter(id)) {
        return null;
      }
      const compilerOptions = tsconfigFile === false ? {} : getTsconfig(
        path.dirname(id),
        tsconfigFile === true ? void 0 : tsconfigFile
      )?.config?.compilerOptions || {};
      const isTs = /\.m?tsx?$/.test(id);
      let jsc = {
        parser: {
          syntax: isTs ? "typescript" : "ecmascript"
        },
        transform: {}
      };
      if (compilerOptions.jsx) {
        Object.assign(jsc.parser || {}, {
          [isTs ? "tsx" : "jsx"]: true
        });
        Object.assign(jsc.transform || {}, {
          react: {
            pragma: compilerOptions.jsxFactory,
            pragmaFrag: compilerOptions.jsxFragmentFactory,
            importSource: compilerOptions.jsxImportSource
          }
        });
      }
      Object.assign(jsc.transform || {}, {
        // https://www.typescriptlang.org/tsconfig#useDefineForClassFields
        useDefineForClassFields: compilerOptions.useDefineForClassFields || false
      });
      if (compilerOptions.experimentalDecorators) {
        jsc.keepClassNames = true;
        Object.assign(jsc.parser || {}, {
          decorators: true
        });
        Object.assign(jsc.transform || {}, {
          legacyDecorator: true,
          decoratorMetadata: compilerOptions.emitDecoratorMetadata
        });
      }
      if (compilerOptions.target) {
        jsc.target = compilerOptions.target.toLowerCase();
      }
      if (options.jsc) {
        jsc = defu(options.jsc, jsc);
      }
      const result = await transform(code, {
        filename: id,
        sourceMaps: true,
        ...options,
        jsc
      });
      return {
        code: result.code,
        map: result.map && JSON.parse(result.map)
      };
    },
    vite: {
      config() {
        return {
          esbuild: false
        };
      }
    },
    rollup: {
      async renderChunk(code, chunk) {
        if (minify) {
          const result = await transform(code, {
            minify: true,
            sourceMaps: true,
            filename: chunk.fileName
          });
          return {
            code: result.code,
            map: result.map
          };
        }
        return null;
      }
    }
  };
});
export {
  unpluginSwc
};
//# sourceMappingURL=index.js.map