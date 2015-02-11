'use strict';

var chalk = require('chalk');
var format = require('util').format;

var loggerLevels = {
  debug: 'gray',
  info: 'green',
  warn: 'yellow',
  error: 'red',
  fatal: 'magenta'
};

var keys = Object.keys(loggerLevels);
var maxLength = 0;

function Logger(args){
  this.args = args;
}

Logger.prototype.log = function(level, args){
  var str = chalk[loggerLevels[level]](level.toUpperCase());
  var padding = maxLength - level.length + 1;

  while (padding--){
    str += ' ';
  }

  str += format.apply(null, args);
  console.log(str);
};

keys.forEach(function(key){
  if (key.length > maxLength){
    maxLength = key.length;
  }

  Logger.prototype[key] = function(){
    var len = arguments.length;
    var args = new Array(len);

    for (var i = 0; i < len; i++){
      args[i] = arguments[i];
    }

    this.log(key, args);
  };
});

// Override debug method
var debug = Logger.prototype.debug;

Logger.prototype.debug = function(){
  if (this.args.debug) debug.apply(this, arguments);
};

module.exports = Logger;