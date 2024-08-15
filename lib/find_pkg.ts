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
  // prefers package.json over package.yaml
  const pkgJsonPath = join(path, 'package.json');
  const pkgYamlPath = join(path, 'package.yaml');

  return readFile(pkgJsonPath)
    // if package.json exists, read it
    .then(content => JSON.parse(content))
    .catch(err => {
      if (err.code === 'ENOENT') {
        // package.json not exist, try package.yaml
        return readFile(pkgYamlPath)
          // if package.yaml exists, read it
          .then(content => require('js-yaml').load(content))
          .catch(err => {
            if (err.code === 'ENOENT') {
              // neither package file exists, search in parent dir
              const parent = dirname(path);
              if (parent === path) return;
              return checkPkg(parent);
            }
            throw err;
          });
      }
      throw err;
    })
    // successfully read in package config
    .then(config => {
      return config?.hexo ? path : null;
    });
}

export = findPkg;
