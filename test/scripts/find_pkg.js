'use strict';

const should = require('chai').should();
const { rmdir, writeFile, unlink } = require('hexo-fs');
const { dirname, join } = require('path');

describe('Find package', () => {
  const findPkg = require('../../dist/find_pkg');
  const baseDir = join(__dirname, 'find_pkg_test');

  after(async () => await rmdir(baseDir));

  it('not found', async () => {
    const path = await findPkg(baseDir, {});
    should.not.exist(path);
  });

  it('found', async () => {
    const pkgPath = join(baseDir, 'package.json');

    await writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, {});
    path.should.eql(baseDir);

    await unlink(pkgPath);
  });

  it('found in parent directory', async () => {
    const pkgPath = join(baseDir, '../package.json');

    await writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, {});
    path.should.eql(dirname(pkgPath));

    await unlink(pkgPath);
  });

  it('found but don\'t have hexo data', async () => {
    const pkgPath = join(baseDir, 'package.json');

    await writeFile(pkgPath, '{"name": "hexo"}');
    const path = await findPkg(baseDir, {});
    should.not.exist(path);

    await unlink(pkgPath);
  });

  it('relative cwd', async () => {
    const pkgPath = join(baseDir, 'test', 'package.json');

    await writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, { cwd: 'test' });
    path.should.eql(dirname(pkgPath));

    await unlink(pkgPath);
  });

  it('specify cwd but don\'t have hexo data', async () => {
    const path = await findPkg(baseDir, {cwd: 'test'});
    should.not.exist(path);
  });

  it('absolute cwd', async () => {
    const pkgPath = join(baseDir, 'test', 'package.json');
    const cwd = dirname(pkgPath);

    await writeFile(pkgPath, '{"hexo": {}}');
    const path = await findPkg(baseDir, { cwd });
    path.should.eql(cwd);

    await unlink(pkgPath);
  });
});
