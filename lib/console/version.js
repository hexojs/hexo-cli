'use strict';

var os = require('os');
var _ = require('lodash');
var pkg = require('../../package.json');

module.exports = function(args){
  console.log('hexo-cli:', pkg.version);
  console.log('os:', os.type(), os.release(), os.platform(), os.arch());
  _.forOwn(process.versions, function(val, key) {
    console.log('%s: %s', key, val);
  });
};