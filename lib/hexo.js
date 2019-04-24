'use strict';

const chalk = require('chalk');
const tildify = require('tildify');
const Promise = require('bluebird');
const Context = require('./context');
const findPkg = require('./find_pkg');
const goodbye = require('./goodbye');
const minimist = require('minimist');
const resolve = require('resolve');
const camelCaseKeys = require('hexo-util/lib/camel_case_keys');

class HexoNotFoundError extends Error {}

function entry(cwd, args) {
  cwd = cwd || process.cwd();
  args = camelCaseKeys(args || minimist(process.argv.slice(2)));

  let hexo = new Context(cwd, args);
  let log = hexo.log;

  // Change the title in console
  process.title = 'hexo';

  function handleError(err) {
    if (err && !(err instanceof HexoNotFoundError)) {
      log.fatal(err);
    }

    process.exitCode = 2;
  }

  return findPkg(cwd, args).then(function(path) {
    if (!path) return;

    hexo.base_dir = path;

    return loadModule(path, args).catch(function() {
      log.error('Local hexo not found in %s', chalk.magenta(tildify(path)));
      log.error('Try running: \'npm install hexo --save\'');
      throw new HexoNotFoundError();
    });
  }).then(function(mod) {
    if (mod) hexo = mod;
    log = hexo.log;

    require('./console')(hexo);

    return hexo.init();
  }).then(function() {
    let cmd = '';

    if (!args.h && !args.help) {
      cmd = args._.shift();

      if (cmd) {
        const c = hexo.extend.console.get(cmd);
        if (!c) cmd = 'help';
      } else {
        cmd = 'help';
      }
    } else {
      cmd = 'help';
    }

    watchSignal(hexo);

    return hexo.call(cmd, args).then(function() {
      return hexo.exit();
    }).catch(function(err) {
      return hexo.exit(err).then(function() {
        // `hexo.exit()` already dumped `err`
        handleError(null);
      });
    });
  }).catch(handleError);
}

entry.console = {
  init: require('./console/init'),
  help: require('./console/help'),
  version: require('./console/version')
};

entry.version = require('../package.json').version;

function loadModule(path, args) {
  return Promise.try(function() {
    const modulePath = resolve.sync('hexo', { basedir: path });
    const Hexo = require(modulePath);

    return new Hexo(path, args);
  });
}

function watchSignal(hexo) {
  process.on('SIGINT', function() {
    hexo.log.info(goodbye());
    hexo.unwatch();

    hexo.exit().then(function() {
      // eslint-disable-next-line no-process-exit
      process.exit();
    });
  });
}

module.exports = entry;
