'use strict';

var should = require('chai').should();
var pathFn = require('path');
var fs = require('hexo-fs');
var Promise = require('bluebird');
var Logger = require('../lib/logger');
var assetDir = pathFn.join(__dirname, '../assets');
var testUtil = require('./util');
var ShasumStream = testUtil.ShasumStream;

describe('init', function(){
  var baseDir = pathFn.join(__dirname, 'init_test');
  var init = require('../lib/console/init').bind({
    base_dir: baseDir,
    log: new Logger({silent: true})
  });
  var assets = [];

  function check(baseDir){
    return Promise.map(assets, function(item){
      return compareFiles(
        pathFn.join(assetDir, item),
        pathFn.join(baseDir, item === 'gitignore' ? '.' + item : item)
      ).then(function(result){
        result.should.be.true;
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

function pipeStream(rs, ws){
  return new Promise(function(resolve, reject){
    rs.pipe(ws)
      .on('error', reject)
      .on('finish', resolve);
  });
}

function getShasum(path){
  var stream = new ShasumStream();
  var src = fs.createReadStream(path);

  return pipeStream(src, stream).then(function(){
    return stream.getShasum();
  });
}

function compareFiles(){
  var len = arguments.length;
  var tasks = new Array(len);

  for (var i = 0; i < len; i++){
    tasks[i] = getShasum(arguments[i]);
  }

  return Promise.all(tasks).then(function(result){
    var first = result.shift();

    for (var i = 0, len = result.length; i < len; i++){
      if (result[i] !== first) return false;
    }

    return true;
  });
}