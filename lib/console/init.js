'use strict';

const Promise = require('bluebird');
const { join, resolve } = require('path');
const chalk = require('chalk');
const { existsSync, readdirSync, rmdir, unlink, copyDir, readdir, stat } = require('hexo-fs');
const tildify = require('tildify');
const { spawn } = require('hexo-util');
const commandExistsSync = require('command-exists').sync;

const ASSET_DIR = join(__dirname, '../../assets');
const GIT_REPO_URL = 'https://github.com/hexojs/hexo-starter.git';

function initConsole(args) {
  args = Object.assign({ install: true, clone: true }, args);

  const baseDir = this.base_dir;
  const target = args._[0] ? resolve(baseDir, args._[0]) : baseDir;
  const { log } = this;

  if (existsSync(target) && readdirSync(target).length !== 0) {
    log.fatal(`${chalk.magenta(tildify(target))} not empty, please run \`hexo init\` on an empty folder and then copy your files into it`);
    return Promise.reject(new Error('target not empty'));
  }

  log.info('Cloning hexo-starter', GIT_REPO_URL);

  let promise;

  if (args.clone) {
    promise = spawn('git', ['clone', '--recurse-submodules', '--depth=1', '--quiet', GIT_REPO_URL, target], {
      stdio: 'inherit'
    });
  } else {
    promise = copyAsset(target);
  }

  return promise.catch(() => {
    log.warn('git clone failed. Copying data instead');

    return copyAsset(target);
  }).then(() => Promise.all([
    removeGitDir(target),
    removeGitModules(target)
  ])).then(() => {
    if (!args.install) return;

    log.info('Install dependencies');

    const npmCommand = commandExistsSync('yarn') ? 'yarn' : 'npm';

    if (npmCommand === 'yarn') {
      return spawn(npmCommand, ['install', '--production', '--ignore-optional', '--silent'], {
        cwd: target,
        stdio: 'inherit'
      });
    }
    return spawn(npmCommand, ['install', '--only=production', '--optional=false', '--silent'], {
      cwd: target,
      stdio: 'inherit'
    });
  }).then(() => {
    log.info('Start blogging with Hexo!');
  }).catch(() => {
    log.warn('Failed to install dependencies. Please run \'npm install\' manually!');
  });
}

function copyAsset(target) {
  return copyDir(ASSET_DIR, target, { ignoreHidden: false });
}

function removeGitDir(target) {
  const gitDir = join(target, '.git');

  return stat(gitDir).catch(err => {
    if (err && err.code === 'ENOENT') return;
    throw err;
  }).then(stats => {
    if (stats) {
      return stats.isDirectory() ? rmdir(gitDir) : unlink(gitDir);
    }
  }).then(() => readdir(target)).map(path => join(target, path)).filter(path => stat(path).then(stats => stats.isDirectory())).each(removeGitDir);
}

function removeGitModules(target) {
  return unlink(join(target, '.gitmodules')).catch(err => {
    if (err && err.code === 'ENOENT') return;
    throw err;
  });
}

module.exports = initConsole;
