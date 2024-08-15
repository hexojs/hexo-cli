import { resolve, join, dirname } from 'path';
import { readFileSync, existsSync } from 'fs';
import { load } from 'js-yaml';

interface findPkgArgs {
  cwd?: string;
}

function findPkg(cwd: string, args: findPkgArgs = {}) {
  if (args.cwd) {
    cwd = resolve(cwd, args.cwd);
  }

  return checkPkg(cwd);
}

async function checkPkg(path: string): Promise<string | null> {
  // if a pkg file exists, and the hexo key in it is non-empty
  if (readPkg(join(path, 'package.json'), JSON.parse)
   || readPkg(join(path, 'package.yaml'), load)) { return path; }
  // otherwise, search in parent dir, terminate at root
  const parent = dirname(path);
  return parent === path ? null : checkPkg(parent);
}

/** If pkg file exists, read it, parse it, and access the hexo object in it */
function readPkg(pkgPath: string, parser: CallableFunction): object | null {
  return existsSync(pkgPath) ? parser(readFileSync(pkgPath))?.hexo : null;
}

export = findPkg;
