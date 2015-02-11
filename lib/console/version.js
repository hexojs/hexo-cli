'use strict';

var os = require('os');
var pkg = require('../../package.json');

module.exports = function(args){
  var versions = {
    'hexo-cli': pkg.version,
    os: os.type() + ' ' + os.release() + ' ' + os.platform() + ' ' + os.arch()
  };
  var i;

  for (i in process.versions){
    versions[i] = process.versions[i];
  }

  if (args.json){
    console.log(versions);
  } else {
    for (i in versions){
      console.log(i + ': ' + versions[i]);
    }
  }
};