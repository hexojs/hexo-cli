import os from 'os';
const pkg = require('../../package.json');
import BlueBirdPromise from 'bluebird';
import { spawn } from 'hexo-util';

async function versionConsole() {
  const { versions, platform } = process;
  const keys = Object.keys(versions);

  if (this.version) {
    console.log('hexo:', this.version);
  }

  console.log('hexo-cli:', pkg.version);

  let osInfo: string | void | Buffer;
  if (platform === 'darwin') osInfo = await spawn('sw_vers', '-productVersion');
  else if (platform === 'linux') {
    const v = await spawn('cat', '/etc/os-release');
    const distro = String(v || '').match(/NAME="(.+)"/);
    const versionInfo = String(v || '').match(/VERSION="(.+)"/) || ['', ''];
    const versionStr = versionInfo !== null ? versionInfo[1] : '';
    osInfo = `${distro[1]} ${versionStr}`.trim() || '';
  }

  osInfo = `${os.platform()} ${os.release()} ${osInfo}`;
  console.log('os:', osInfo);

  for (let i = 0, len = keys.length; i < len; i++) {
    const key = keys[i];
    console.log('%s: %s', key, versions[key]);
  }

  await BlueBirdPromise.resolve();
}

export = versionConsole;
