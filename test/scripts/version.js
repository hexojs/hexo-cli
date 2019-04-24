'use strict';

const should = require('chai').should(); // eslint-disable-line
const Context = require('../../lib/context');
const sinon = require('sinon');
const os = require('os');
const format = require('util').format;
const cliVersion = require('../../package.json').version;
const rewire = require('rewire');

function getConsoleLog(spy) {
  const args = spy.args;

  return args.map(function(arr) {
    return format.apply(null, arr);
  }).join('\n');
}

describe('version', function() {
  const versionModule = rewire('../../lib/console/version');
  const hexo = new Context();

  it('show version info', function() {
    const spy = sinon.spy();

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return versionModule.call(hexo, {_: []});
    }).then(function() {
      const output = getConsoleLog(spy);
      const expected = [
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
    const spy = sinon.spy();

    hexo.version = '3.2.1';

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return versionModule.call(hexo, {_: []});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.contain('hexo: ' + hexo.version);
    }).finally(function() {
      hexo.version = null;
    });
  });
});
