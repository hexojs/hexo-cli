'use strict';

var pathFn = require('path');
var chalk = require('chalk');
var fs = require('hexo-fs');
var tildify = require('tildify');
var spawn = require('child_process').spawn;
var assetDir = pathFn.join(__dirname, '../../assets');

var GIT_REPO_URL = 'https://github.com/hexojs/hexo-starter.git';

module.exports = function(args) {
  var baseDir = this.base_dir;
  var target = args._[0] ? pathFn.resolve(baseDir, args._[0]) : baseDir;
  var log = this.log;

  log.info('Cloning hexo-starter to', chalk.magenta(tildify(target)));

  return inheritSpawn('git', ['clone', '--recursive', GIT_REPO_URL, target]).catch(function() {
    log.warn('git clone failed. Copying data instead');

    return fs.copyDir(assetDir, target, {
      ignoreHidden: false
    });
  }).then(function() {
    return Promise.all([
      removeGitDir(target),
      removeGitModules(target)
    ]);
  }).then(function() {
    log.info('Install dependencies');

    return inheritSpawn('npm', ['install', '--production'], {
      cwd: target
    });
  }).then(function() {
    log.info('Start blogging with Hexo!');
  }).catch(function() {
    log.warn('Failed to install dependencies. Please run \'npm install\' manually!');
  });
};

function inheritSpawn(cmd, args, options) {
  options = options || {};
  options.stdio = 'inherit';

  return new Promise(function(resolve, reject) {
    var task = spawn(cmd, args, options);

    task.on('exit', resolve);
    task.on('error', reject);
  });
}

function removeGitDir(target) {
  var gitDir = pathFn.join(target, '.git');

  return fs.stat(gitDir).catch(function(err) {
    if (err.cause && err.cause.code === 'ENOENT') return;
    throw err;
  }).then(function(stats) {
    if (stats) {
      if (stats.isDirectory()) return fs.rmdir(gitDir);
      return fs.unlink(gitDir);
    }
  }).then(function() {
    return fs.readdir(target);
  }).map(function(path) {
    return pathFn.join(target, path);
  }).filter(function(path) {
    return fs.stat(path).then(function(stats) {
      return stats.isDirectory();
    });
  }).each(removeGitDir);
}

function removeGitModules(target) {
  return fs.unlink(pathFn.join(target, '.gitmodules')).catch(function(err) {
    if (err.cause && err.cause.code === 'ENOENT') return;
    throw err;
  });
}
