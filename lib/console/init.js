'use strict';

var pathFn = require('path');
var chalk = require('chalk');
var fs = require('hexo-fs');
var tildify = require('tildify');
var assetDir = pathFn.join(__dirname, '../../assets');

module.exports = function(args){
  var baseDir = process.cwd();
  var target = args._[0] ? pathFn.resolve(baseDir, args._[0]) : baseDir;

  console.log('Copying data to %s', chalk.magenta(tildify(target)));

  return fs.copyDir(assetDir, target).then(function(){
    return fs.rename(
      pathFn.join(target, 'gitignore'),
      pathFn.join(target, '.gitignore'));
  }).then(function(){
    console.log('You are almost done! Don\'t forget to run \'npm install\' before you start blogging with Hexo!');
  });
};