import fs from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { pathExists } from 'path-exists';

const RESOLVE_EXTENSIONS = [
  '.tsx',
  '.ts',
  '.mts',
  '.cts',
  '.jsx',
  '.js',
  '.mjs',
  '.cjs',
];

const resolveFile = async (resolved: string, index = false) => {
  resolved = resolved.replace(/\.(js|jsx|cjs|mjs|ts|tsx|mts|cts)$/gi, '');

  for (const ext of RESOLVE_EXTENSIONS) {
    const file = index ? join(resolved, `index${ext}`) : `${resolved}${ext}`;
    if (await pathExists(file)) {
      return file;
    }
  }
  return undefined;
};

export const resolveId = async (importee: string, importer?: string) => {
  if (importer && importee[0] === '.') {
    const absolutePath = resolve(
      importer ? dirname(importer) : process.cwd(),
      importee
    );

    let resolved = await resolveFile(absolutePath);

    if (
      !resolved &&
      (await pathExists(absolutePath)) &&
      (await fs.promises.stat(absolutePath).then((stat) => stat.isDirectory()))
    ) {
      resolved = await resolveFile(absolutePath, true);
    }

    return resolved;
  }
  return undefined;
};
