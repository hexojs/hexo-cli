import chai from 'chai';
import sinon from 'sinon';
import Context from '../../lib/context';
import { platform, release } from 'os';
import { format } from 'util';
import { version as cliVersion } from '../../package.json';
import rewire from 'rewire';
import { spawn } from 'hexo-util';
chai.should();

function getConsoleLog({ args }: { args: any[] }) {
  return args.map(arr => format(...arr)).join('\n');
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
      const expected: string[] = [];

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
          const v = await spawn('cat', '/etc/os-release') as string;
          const distro = (v || '').match(/NAME="(.+)"/);
          output.should.contain(`os: ${platform()} ${release()} ${distro![1]}`);
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
