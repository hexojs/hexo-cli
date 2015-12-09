'use strict';

var pathFn = require('path');
var chalk = require('chalk');
var fs = require('hexo-fs');
var tildify = require('tildify');
var spawn = require('hexo-util').spawn;
var assetDir = pathFn.join(__dirname, '../../assets');

var GIT_REPO_URL = 'https://github.com/hexojs/hexo-starter.git';

module.exports = function(args) {
  var baseDir = this.base_dir;
  var target = args._[0] ? pathFn.resolve(baseDir, args._[0]) : baseDir;
  var log = this.log;

  log.info('Cloning hexo-starter to', chalk.magenta(tildify(target)));

  return spawn('git', ['clone', '--recursive', GIT_REPO_URL, target], {
    verbose: true
  }).catch(function() {
    log.info('git clone failed. Copying data instead.');

    return fs.copyDir(assetDir, target, {
      ignoreHidden: false
    });
  }).then(function() {
    log.info('Install dependencies.');

    return spawn('npm', ['install'], {
      cwd: target,
      verbose: true
    });
  }).catch(function() {
    log.info('Install dependencies failed. Please run \'npm install\' manually.');
  }).then(function() {
    log.info('Start blogging with Hexo!');
  });
};
