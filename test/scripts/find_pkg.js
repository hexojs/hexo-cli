'use strict';

const should = require('chai').should(); // eslint-disable-line
const fs = require('hexo-fs');
const pathFn = require('path');

describe('Find package', function() {
  const findPkg = require('../../lib/find_pkg');
  const baseDir = pathFn.join(__dirname, 'find_pkg_test');

  after(function() {
    return fs.rmdir(baseDir);
  });

  it('not found', function() {
    return findPkg(baseDir, {}).then(function(path) {
      should.not.exist(path);
    });
  });

  it('found', function() {
    const pkgPath = pathFn.join(baseDir, 'package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {});
    }).then(function(path) {
      path.should.eql(baseDir);
      return fs.unlink(pkgPath);
    });
  });

  it('found in parent directory', function() {
    const pkgPath = pathFn.join(baseDir, '../package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {});
    }).then(function(path) {
      path.should.eql(pathFn.dirname(pkgPath));
      return fs.unlink(pkgPath);
    });
  });

  it('found but don\'t have hexo data', function() {
    const pkgPath = pathFn.join(baseDir, 'package.json');

    return fs.writeFile(pkgPath, '{"name": "hexo"}').then(function() {
      return findPkg(baseDir, {});
    }).then(function(path) {
      should.not.exist(path);
      return fs.unlink(pkgPath);
    });
  });

  it('relative cwd', function() {
    const pkgPath = pathFn.join(baseDir, 'test', 'package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {cwd: 'test'});
    }).then(function(path) {
      path.should.eql(pathFn.dirname(pkgPath));
      return fs.unlink(pkgPath);
    });
  });

  it('specify cwd but don\'t have hexo data', function() {
    return findPkg(baseDir, {cwd: 'test'}).then(function(path) {
      should.not.exist(path);
    });
  });

  it('absolute cwd', function() {
    const pkgPath = pathFn.join(baseDir, 'test', 'package.json');
    const cwd = pathFn.dirname(pkgPath);

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {cwd: cwd});
    }).then(function(path) {
      path.should.eql(cwd);
      return fs.unlink(pkgPath);
    });
  });
});
