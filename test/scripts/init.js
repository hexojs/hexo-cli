'use strict';

var should = require('chai').should(); // eslint-disable-line
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var util = require('hexo-util');
var rewire = require('rewire');
var Context = require('../../lib/context');
var assetDir = pathFn.join(__dirname, '../../assets');

describe('init', function() {
  var baseDir = pathFn.join(__dirname, 'init_test');
  var initModule = rewire('../../lib/console/init');
  var hexo = new Context(baseDir, { silent: true });
  var init = initModule.bind(hexo);
  var assets = [];

  function rmdir(path) {
    return fs.rmdir(path).catch(function(err) {
      if (err.cause && err.cause.code === 'ENOENT') return;
      throw err;
    });
  }

  function pipeStream(rs, ws) {
    return new Promise(function(resolve, reject) {
      rs.pipe(ws)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  function compareFile(a, b) {
    var streamA = new util.HashStream();
    var streamB = new util.HashStream();

    return Promise.all([
      pipeStream(fs.createReadStream(a), streamA),
      pipeStream(fs.createReadStream(b), streamB)
    ]).then(function() {
      return streamA.read().equals(streamB.read());
    });
  }

  function check(path) {
    return Promise.each(assets, function(item) {
      return compareFile(
        pathFn.join(assetDir, item),
        pathFn.join(path, item)
      ).should.eventually.be.true;
    }).finally(function() {
      return rmdir(path);
    });
  }

  function withoutSpawn(fn) {
    return initModule.__with__('spawn', function() {
      return Promise.reject(new Error('spawn is not available'));
    })(fn);
  }

  before(function() {
    return fs.listDir(assetDir).then(function(files) {
      assets = files;
    });
  });

  after(function() {
    return rmdir(baseDir);
  });

  it('current path', function() {
    return withoutSpawn(function() {
      return init({_: []}).then(function() {
        return check(baseDir);
      });
    });
  });

  it('relative path', function() {
    return withoutSpawn(function() {
      return init({_: ['test']}).then(function() {
        return check(pathFn.join(baseDir, 'test'));
      });
    });
  });

  it('absolute path', function() {
    var path = pathFn.join(baseDir, 'test');

    return withoutSpawn(function() {
      return init({_: [path]}).then(function() {
        return check(path);
      });
    });
  });

  it('git clone');

  it('npm install');
});
