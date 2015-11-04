'use strict';

var should = require('chai').should();
var fs = require('hexo-fs');
var pathFn = require('path');

describe('Find package', function() {
  var findPkg = require('../../lib/find_pkg');
  var baseDir = pathFn.join(__dirname, 'find_pkg_test');

  after(function() {
    return fs.rmdir(baseDir);
  });

  it('not found', function() {
    return findPkg(baseDir, {}).then(function(path) {
      should.not.exist(path);
    });
  });

  it('found', function() {
    var pkgPath = pathFn.join(baseDir, 'package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {});
    }).then(function(path) {
      path.should.eql(baseDir);
      return fs.unlink(pkgPath);
    });
  });

  it('found in parent directory', function() {
    var pkgPath = pathFn.join(baseDir, '../package.json');

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {});
    }).then(function(path) {
      path.should.eql(pathFn.dirname(pkgPath));
      return fs.unlink(pkgPath);
    });
  });

  it('found but don\'t have hexo data', function() {
    var pkgPath = pathFn.join(baseDir, 'package.json');

    return fs.writeFile(pkgPath, '{"name": "hexo"}').then(function() {
      return findPkg(baseDir, {});
    }).then(function(path) {
      should.not.exist(path);
      return fs.unlink(pkgPath);
    });
  });

  it('relative cwd', function() {
    var pkgPath = pathFn.join(baseDir, 'test', 'package.json');

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
    var pkgPath = pathFn.join(baseDir, 'test', 'package.json');
    var cwd = pathFn.dirname(pkgPath);

    return fs.writeFile(pkgPath, '{"hexo": {}}').then(function() {
      return findPkg(baseDir, {cwd: cwd});
    }).then(function(path) {
      path.should.eql(cwd);
      return fs.unlink(pkgPath);
    });
  });
});
