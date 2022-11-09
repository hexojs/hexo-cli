'use strict';

require('chai').should();
const Context = require('../../dist/context');
const sinon = require('sinon');
const { platform, release } = require('os');
const { format } = require('util');
const cliVersion = require('../../package.json').version;
const rewire = require('rewire');
const { spawn } = require('hexo-util');

function getConsoleLog({ args }) {
  return args.map(arr => format.apply(null, arr)).join('\n');
}

describe('version', () => {
  const versionModule = rewire('../../dist/console/version');
  const hexo = new Context();

  it('show version info', () => {
    const spy = sinon.spy();

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(async () => {
      await versionModule.call(hexo, {_: []});
      const output = getConsoleLog(spy);
      const expected = [];

      Object.keys(process.versions).forEach(key => {
        expected.push(`${key}: ${process.versions[key]}`);
      });

      output.should.contain(`hexo-cli: ${cliVersion}`);
      output.should.contain(`os: ${platform()} ${release()}`);
      output.should.contain(expected.join('\n'));

      if (process.env.CI === 'true') {
        if (process.platform === 'darwin') {
          const osInfo = await spawn('sw_vers', '-productVersion');
          output.should.contain(`os: ${platform()} ${release()} ${osInfo}`);
        } else if (process.platform === 'linux') {
          const v = await spawn('cat', '/etc/os-release');
          const distro = (v || '').match(/NAME="(.+)"/);
          output.should.contain(`os: ${platform()} ${release()} ${distro[1]}`);
        }
      }
    });
  });

  it('show hexo version if available', () => {
    const spy = sinon.spy();

    hexo.version = '3.2.1';

    return versionModule.__with__({
      console: {
        log: spy
      }
    })(async () => {
      await versionModule.call(hexo, {_: []});
      const output = getConsoleLog(spy);

      output.should.contain(`hexo: ${hexo.version}`);
    }).finally(() => {
      hexo.version = null;
    });
  });
});
