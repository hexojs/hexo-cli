'use strict';

var pathFn = require('path');
var chalk = require('chalk');
var fs = require('hexo-fs');
var tildify = require('tildify');
var assetDir = pathFn.join(__dirname, '../../assets');

module.exports = function(args){
  var baseDir = this.base_dir;
  var target = args._[0] ? pathFn.resolve(baseDir, args._[0]) : baseDir;
  var log = this.log;

  log.info('Copying data to', chalk.magenta(tildify(target)));

  return fs.listDir(assetDir).map(function(item){
    var src = pathFn.join(assetDir, item);
    var destPath = item === 'gitignore' ? '.' + item : item;
    var dest = pathFn.join(target, destPath);

    return fs.copyFile(src, dest).then(function(){
      log.debug('Copied', chalk.magenta(destPath));
    });
  }).then(function(){
    log.info('You are almost done! Don\'t forget to run \'npm install\' before you start blogging with Hexo!');
  });
};