'use strict';

var minimist = require('minimist');
var abbrev = require('abbrev');
var pathFn = require('path');
var fs = require('hexo-fs');
var tildify = require('tildify');
var chalk = require('chalk');
var findPkg = require('./find_pkg');
var pkg = require('../package.json');
var args = minimist(process.argv.slice(2));
var Logger = require('./logger');
var log = new Logger(args);
var goodbye = require('./goodbye');
var commands = require('./console');
var alias = abbrev(Object.keys(commands));
var cwd = process.cwd();

// Change the title in console
process.title = 'hexo';

exports = module.exports = function() {
  var hexo;

  function exit(err) {
    if (hexo) {
      return hexo.exit(err);
    } else if (err) {
      log.error(err.stack || err.message || err);
    }
  }

  function runHexoCommand() {
    var cmd = args._.shift();

    if (cmd) {
      var c = hexo.extend.console.get(cmd);
      if (!c) cmd = 'help';
    } else if (args.v || args.version) {
      cmd = 'version';
    } else {
      cmd = 'help';
    }

    // Listen to Ctrl+C (SIGINT) signal
    process.on('SIGINT', function() {
      log.info(goodbye());

      // Stop watching
      if (hexo) hexo.unwatch();

      // Exit
      exit().then(function() {
        process.exit();
      });
    });

    return hexo.call(cmd, args);
  }

  return findPkg(cwd, args).then(function(path) {
    if (!path) return runCLICommand(args);

    var modulePath = pathFn.join(path, 'node_modules', 'hexo');

    return fs.exists(modulePath).then(function(exist) {
      if (!exist) {
        log.error('Local hexo not found in %s', chalk.magenta(tildify(path)));
        log.error('Try running: \'npm install hexo --save\'');
        return process.exit(1);
      }

      var Hexo = require(modulePath);
      hexo = new Hexo(path, args);
      log = hexo.log;

      return hexo.init().then(runHexoCommand);
    });
  }).then(function() {
    return exit();
  }, function(err) {

    return exit(err).then(function() {
      process.exit(1);
    });
  });
};

exports.console = commands;
exports.version = pkg.version;

function runCLICommand(args) {
  var cmd = args._.shift();

  if (alias.hasOwnProperty(cmd)) {
    cmd = alias[cmd];
  } else if (args.v || args.version) {
    cmd = 'version';
  } else {
    cmd = 'help';
  }

  return commands[cmd].call({
    base_dir: process.cwd(),
    log: log
  }, args);
}
