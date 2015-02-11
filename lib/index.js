'use strict';

var minimist = require('minimist');
var abbrev = require('abbrev');
var pathFn = require('path');
var fs = require('hexo-fs');
var tildify = require('tildify');
var chalk = require('chalk');
var findPkg = require('./find_pkg');
var pkg = require('../package.json');

var commands = {
  help: require('./console/help'),
  init: require('./console/init'),
  version: require('./console/version')
};

var alias = abbrev(Object.keys(commands));

var byeWords = [
  'Good bye',
  'See you again',
  'Farewell',
  'Have a nice day',
  'Bye!',
  'Catch you later'
];

function sayGoodbye(){
  return byeWords[(Math.random() * byeWords.length) | 0];
}

// Change the title in console
process.title = 'hexo';

exports = module.exports = function(){
  var args = minimist(process.argv.slice(2));
  var cwd = process.cwd();
  var hexo;

  function exit(err){
    if (hexo){
      hexo.unwatch();
      hexo.exit(err).then(function(){
        process.exit(err ? 1 : 0);
      });
    } else {
      if (err) console.log(err.stack || err.message || err);
      process.exit(err ? 1 : 0);
    }
  }

  function runHexo(){
    var command = args._.shift();

    if (command){
      var c = hexo.extend.console.get(command);

      if (!c || (!hexo.env.init && !c.options.init)){
        command = 'help';
      }
    } else if (args.v || args.version){
      command = 'version';
    } else {
      command = 'help';
    }

    // Listen to Ctrl+C (SIGINT) signal
    process.on('SIGINT', function(){
      hexo.log.info(sayGoodbye());
      exit();
    });

    return hexo.call(command, args);
  }

  return findPkg(cwd, args).then(function(path){
    if (!path) return showHelp(args);

    var modulePath = pathFn.join(path, 'node_modules', 'hexo');

    return fs.exists(modulePath).then(function(exist){
      if (!exist){
        console.log('Local hexo not found in %s', chalk.magenta(tildify(path)));
        console.log('Try running: \'npm install hexo --save\'');
        return process.exit(1);
      }

      var Hexo = require(modulePath);
      hexo = new Hexo(path, args);

      return hexo.init().then(runHexo);
    });
  }).then(function(){
    return exit();
  }, function(err){
    return exit(err);
  });
};

exports.version = pkg.version;

function showHelp(args){
  var cmd = args._.shift();

  if (alias.hasOwnProperty(cmd)){
    cmd = alias[cmd];
  } else if (args.v || args.version){
    cmd = 'version';
  } else {
    cmd = 'help';
  }

  return commands[cmd](args);
}