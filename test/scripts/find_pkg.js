'use strict';

const should = require('chai').should();
const fs = require('hexo-fs');
const pathFn = require('path');

describe('Find package', () => {
  const findPkg = require('../../lib/find_pkg');
  const baseDir = pathFn.join(__dirname, 'find_pkg_test');

  after(() => fs.rmdir(baseDir));

  it('not found', () => findPkg(baseDir, {}).then(path => {
    should.not.exist(path);
  }));

  it('found', () => {
    const pkgPath = pathFn.join(baseDir, 'package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(() => findPkg(baseDir, {})).then(path => {
      path.should.eql(baseDir);
      return fs.unlink(pkgPath);
    });
  });

  it('found in parent directory', () => {
    const pkgPath = pathFn.join(baseDir, '../package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(() => findPkg(baseDir, {})).then(path => {
      path.should.eql(pathFn.dirname(pkgPath));
      return fs.unlink(pkgPath);
    });
  });

  it('found but don\'t have hexo data', () => {
    const pkgPath = pathFn.join(baseDir, 'package.json');

    return fs.writeFile(pkgPath, '{"name": "hexo"}').then(() => findPkg(baseDir, {})).then(path => {
      should.not.exist(path);
      return fs.unlink(pkgPath);
    });
  });

  it('relative cwd', () => {
    const pkgPath = pathFn.join(baseDir, 'test', 'package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(() => findPkg(baseDir, {cwd: 'test'})).then(path => {
      path.should.eql(pathFn.dirname(pkgPath));
      return fs.unlink(pkgPath);
    });
  });

  it('specify cwd but don\'t have hexo data', () => findPkg(baseDir, {cwd: 'test'}).then(path => {
    should.not.exist(path);
  }));

  it('absolute cwd', () => {
    const pkgPath = pathFn.join(baseDir, 'test', 'package.json');
    const cwd = pathFn.dirname(pkgPath);

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(() => findPkg(baseDir, {cwd})).then(path => {
      path.should.eql(cwd);
      return fs.unlink(pkgPath);
    });
  });
});
