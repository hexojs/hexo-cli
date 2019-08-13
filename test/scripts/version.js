'use strict';

require('chai').should();
const Context = require('../../lib/context');
const sinon = require('sinon');
const os = require('os');
const { format } = require('util');
const cliVersion = require('../../package.json').version;
const rewire = require('rewire');

function getConsoleLog(spy) {
  const args = spy.args;

  return args.map(arr => format.apply(null, arr)).join('\n');
}

describe('version', () => {
  const versionModule = rewire('../../lib/console/version');
  const hexo = new Context();

  it('show version info', () => {
    const spy = sinon.spy();

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(() => versionModule.call(hexo, {_: []})).then(() => {
      const output = getConsoleLog(spy);
      const expected = [
        `hexo-cli: ${cliVersion}`,
        `os: ${os.type()} ${os.release()} ${os.platform()} ${os.arch()}`
      ];

      Object.keys(process.versions).forEach(key => {
        expected.push(`${key}: ${process.versions[key]}`);
      });

      output.should.eql(expected.join('\n'));
    });
  });

  it('show hexo version if available', () => {
    const spy = sinon.spy();

    hexo.version = '3.2.1';

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(() => versionModule.call(hexo, {_: []})).then(() => {
      const output = getConsoleLog(spy);

      output.should.contain(`hexo: ${hexo.version}`);
    }).finally(() => {
      hexo.version = null;
    });
  });
});
