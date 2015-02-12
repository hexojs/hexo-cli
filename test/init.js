'use strict';

var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var Logger = require('../lib/logger');
var assetDir = pathFn.join(__dirname, '../assets');

describe('init', function(){
  var baseDir = pathFn.join(__dirname, 'init_test');
  var init = require('../lib/console/init').bind({
    base_dir: baseDir,
    log: new Logger({silent: true})
  });
  var assets = [];

  function check(baseDir){
    return Promise.map(assets, function(item){
      return Promise.all([
        fs.readFile(pathFn.join(assetDir, item)),
        fs.readFile(pathFn.join(baseDir, item === 'gitignore' ? '.' + item : item))
      ]).spread(function(asset, target){
        target.should.eql(asset);
      });
    }).then(function(){
      return fs.rmdir(baseDir);
    });
  }

  before(function(){
    return fs.listDir(assetDir).then(function(files){
      assets = files;
    });
  });

  after(function(){
    return fs.exists(baseDir).then(function(exist){
      if (exist) return fs.rmdir(baseDir);
    });
  });

  it('current path', function(){
    return init({_: []}).then(function(){
      return check(baseDir);
    });
  });

  it('relative path', function(){
    return init({_: ['test']}).then(function(){
      return check(pathFn.join(baseDir, 'test'));
    });
  });

  it('absolute path', function(){
    var path = pathFn.join(baseDir, 'test');

    return init({_: [path]}).then(function(){
      return check(path);
    });
  });
});