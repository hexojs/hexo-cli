'use strict';

var should = require('chai').should(); // eslint-disable-line
var Context = require('../../lib/context');
var sinon = require('sinon');
var os = require('os');
var format = require('util').format;
var cliVersion = require('../../package.json').version;
var rewire = require('rewire');

function getConsoleLog(spy) {
  var args = spy.args;

  return args.map(function(arr) {
    return format.apply(null, arr);
  }).join('\n');
}

describe('version', function() {
  var versionModule = rewire('../../lib/console/version');
  var hexo = new Context();

  it('show version info', function() {
    var spy = sinon.spy();

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return versionModule.call(hexo, {_: []});
    }).then(function() {
      var output = getConsoleLog(spy);
      var expected = [
        'hexo-cli: ' + cliVersion,
        'os: ' + os.type() + ' ' + os.release() + ' ' + os.platform() + ' ' + os.arch()
      ];

      Object.keys(process.versions).forEach(function(key) {
        expected.push(key + ': ' + process.versions[key]);
      });

      output.should.eql(expected.join('\n'));
    });
  });

  it('show hexo version if available', function() {
    var spy = sinon.spy();

    hexo.version = '3.2.1';

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return versionModule.call(hexo, {_: []});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.contain('hexo: ' + hexo.version);
    }).finally(function() {
      hexo.version = null;
    });
  });
});
