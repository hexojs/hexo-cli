'use strict';

var pathFn = require('path');
var Promise = require('bluebird');
var fs = require('hexo-fs');

module.exports = function(cwd, args){
  if (args.cwd) return Promise.resolve(pathFn.resolve(cwd, args.cwd));

  return findPkg(cwd);
};

function findPkg(path){
  var pkgPath = pathFn.join(path, 'package.json');

  return fs.exists(pkgPath).then(function(exist){
    return exist ? checkPkg(pkgPath) : false;
  }).then(function(exist){
    if (exist) return path;

    var parent = pathFn.dirname(path);
    if (parent === path) return;

    return findPkg(parent);
  });
}

function checkPkg(path){
  return fs.readFile(path).then(function(content){
    var json = JSON.parse(content);
    return typeof json.hexo === 'object';
  });
}