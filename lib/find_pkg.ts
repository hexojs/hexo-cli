import { resolve, join, dirname } from 'path';
import { readFile } from 'hexo-fs';

interface findPkgArgs {
  cwd?: string;
}

function findPkg(cwd: string, args: findPkgArgs = {}) {
  if (args.cwd) {
    cwd = resolve(cwd, args.cwd);
  }

  return checkPkg(cwd);
}

function checkPkg(path: string) {
  const pkgPath = join(path, 'package.json');

  return readFile(pkgPath).then(content => {
    const json = JSON.parse(content as string);
    if (typeof json.hexo === 'object') return path;
  }).catch(err => {
    if (err && err.code === 'ENOENT') {
      const parent = dirname(path);

      if (parent === path) return;
      return checkPkg(parent);
    }

    throw err;
  });
}

export = findPkg;
