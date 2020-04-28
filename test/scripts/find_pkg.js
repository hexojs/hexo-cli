'use strict';

const should = require('chai').should();
const fs = require('hexo-fs');
const pathFn = require('path');

describe('Find package', () => {
  const findPkg = require('../../lib/find_pkg');
  const baseDir = pathFn.join(__dirname, 'find_pkg_test');

  after(() => fs.rmdir(baseDir));

  it('not found', async () => {
    const path = await findPkg(baseDir, {});
    should.not.exist(path);
  });

  it('found', async () => {
    const pkgPath = pathFn.join(baseDir, 'package.json');

    await fs.writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, {});
    path.should.eql(baseDir);

    await fs.unlink(pkgPath);
  });

  it('found in parent directory', async () => {
    const pkgPath = pathFn.join(baseDir, '../package.json');

    await fs.writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, {});
    path.should.eql(pathFn.dirname(pkgPath));

    await fs.unlink(pkgPath);
  });

  it('found but don\'t have hexo data', async () => {
    const pkgPath = pathFn.join(baseDir, 'package.json');

    await fs.writeFile(pkgPath, '{"name": "hexo"}');
    const path = await findPkg(baseDir, {});
    should.not.exist(path);

    await fs.unlink(pkgPath);
  });

  it('relative cwd', async () => {
    const pkgPath = pathFn.join(baseDir, 'test', 'package.json');

    await fs.writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, { cwd: 'test' });
    path.should.eql(pathFn.dirname(pkgPath));

    await fs.unlink(pkgPath);
  });

  it('specify cwd but don\'t have hexo data', async () => {
    const path = await findPkg(baseDir, {cwd: 'test'});
    should.not.exist(path);
  });

  it('absolute cwd', async () => {
    const pkgPath = pathFn.join(baseDir, 'test', 'package.json');
    const cwd = pathFn.dirname(pkgPath);

    await fs.writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, { cwd });
    path.should.eql(cwd);

    await fs.unlink(pkgPath);
  });
});
