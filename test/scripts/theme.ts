import chai from 'chai';
import sinon from 'sinon';
import rewire from 'rewire';
import { join } from 'path';
import { existsSync, mkdirs, readFile, rmdir, writeFile } from 'hexo-fs';
import Context from '../../lib/context';
import console from '../../lib/console/index';
chai.should();

function registryResponse(link = 'https://github.com/example/hexo-theme-example') {
  return {
    ok: true,
    status: 200,
    json: async () => ({
      content: Buffer.from(`link: ${link}\n`).toString('base64')
    })
  };
}

describe('theme', () => {
  const baseDir = join(__dirname, 'theme_test');
  const themeModule = rewire('../../dist/console/theme');
  const theme = themeModule.bind(new Context(baseDir, {silent: true}));

  async function reset() {
    if (existsSync(baseDir)) await rmdir(baseDir);
    await mkdirs(baseDir);
  }

  async function withMocks(fetchMock: sinon.SinonStub, spawnMock: sinon.SinonStub, fn: () => Promise<void>) {
    return themeModule.__with__({
      fetch: fetchMock,
      'spawn_1': {default: spawnMock},
      command_exists_1: {sync: () => true}
    })(fn);
  }

  async function expectError(promise: Promise<unknown>, message: string) {
    let error: Error | undefined;

    try {
      await promise;
    } catch (err) {
      error = err as Error;
    }

    chai.expect(error).to.be.instanceOf(Error);
    error!.message.should.contain(message);
  }

  beforeEach(reset);
  after(async () => {
    if (existsSync(baseDir)) await rmdir(baseDir);
  });

  it('registers the theme command', () => {
    const hexo = new Context();
    console(hexo);

    const command = hexo.extend.console.get('theme');
    command?.options?.usage.should.eql('<install|uninstall> <theme-name>');
  });

  it('installs an official theme into the site themes directory', async () => {
    const spawnMock = sinon.stub().resolves();
    const fetchMock = sinon.stub().resolves(registryResponse());

    await withMocks(fetchMock, spawnMock, async () => {
      await theme({_: ['install', 'example']});
    });

    fetchMock.calledWithMatch('https://api.github.com/repos/hexojs/site/contents/source/_data/themes/example.yml').should.be.true;
    spawnMock.calledOnce.should.be.true;
    spawnMock.calledWith('git', [
      'clone', '--depth=1', '--quiet', 'https://github.com/example/hexo-theme-example', join(baseDir, 'themes', 'example')
    ]).should.be.true;
  });

  it('rejects names not found in the official registry', async () => {
    const spawnMock = sinon.stub();
    const fetchMock = sinon.stub().resolves({ok: false, status: 404});

    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['install', 'missing']}), 'not listed');
    });

    spawnMock.notCalled.should.be.true;
  });

  it('reports registry transport errors', async () => {
    const spawnMock = sinon.stub();
    const fetchMock = sinon.stub();

    fetchMock.rejects(new Error('offline'));
    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['install', 'example']}), 'Failed to fetch the official Hexo theme registry');
    });
  });

  it('installs the repository link returned by the registry without extra validation', async () => {
    const spawnMock = sinon.stub().resolves();
    const fetchMock = sinon.stub().resolves(registryResponse('https://example.com/theme'));

    await withMocks(fetchMock, spawnMock, async () => {
      await theme({_: ['install', 'example']});
    });

    spawnMock.calledWith('git', [
      'clone', '--depth=1', '--quiet', 'https://example.com/theme', join(baseDir, 'themes', 'example')
    ]).should.be.true;
  });

  it('rejects a pre-existing theme directory before fetching the registry', async () => {
    const target = join(baseDir, 'themes', 'example');
    await mkdirs(target);
    const fetchMock = sinon.stub();
    const spawnMock = sinon.stub();

    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['install', 'example']}), 'already exists');
    });

    fetchMock.notCalled.should.be.true;
    spawnMock.notCalled.should.be.true;
  });

  it('removes the new directory when cloning fails', async () => {
    const target = join(baseDir, 'themes', 'example');
    const spawnMock = sinon.stub().callsFake(async () => {
      await mkdirs(target);
      throw new Error('clone failed');
    });
    const fetchMock = sinon.stub().resolves(registryResponse());

    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['install', 'example']}), 'clone failed');
    });

    existsSync(target).should.be.false;
  });

  it('removes the new directory when dependency installation fails', async () => {
    const target = join(baseDir, 'themes', 'example');
    const spawnMock = sinon.stub().callsFake(async (command: string) => {
      if (command === 'git') {
        await mkdirs(target);
        await writeFile(join(target, 'package.json'), '{}');
        return;
      }

      throw new Error('dependency install failed');
    });
    const fetchMock = sinon.stub().resolves(registryResponse());

    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['install', 'example']}), 'dependency install failed');
    });

    existsSync(target).should.be.false;
  });

  it('installs production dependencies with the site package manager', async () => {
    const target = join(baseDir, 'themes', 'example');
    await writeFile(join(baseDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
    const spawnMock = sinon.stub().callsFake(async (command: string) => {
      if (command === 'git') {
        await mkdirs(target);
        await writeFile(join(target, 'package.json'), '{}');
      }
    });
    const fetchMock = sinon.stub().resolves(registryResponse());

    await withMocks(fetchMock, spawnMock, async () => {
      await theme({_: ['install', 'example']});
    });

    spawnMock.calledWith('pnpm', ['install', '--prod'], {
      cwd: target,
      stdio: 'inherit'
    }).should.be.true;
  });

  it('copies the theme config to the site root', async () => {
    const target = join(baseDir, 'themes', 'example');
    const spawnMock = sinon.stub().callsFake(async () => {
      await mkdirs(target);
      await writeFile(join(target, '_config.yml'), 'color: blue\n');
    });
    const fetchMock = sinon.stub().resolves(registryResponse());

    await withMocks(fetchMock, spawnMock, async () => {
      await theme({_: ['install', 'example']});
    });

    const config = await readFile(join(baseDir, '_config.example.yml'));
    config.should.eql('color: blue\n');
  });

  it('does not overwrite an existing theme config', async () => {
    const target = join(baseDir, 'themes', 'example');
    const configPath = join(baseDir, '_config.example.yml');
    await writeFile(configPath, 'color: red\n');
    const spawnMock = sinon.stub().callsFake(async () => {
      await mkdirs(target);
      await writeFile(join(target, '_config.yml'), 'color: blue\n');
    });
    const fetchMock = sinon.stub().resolves(registryResponse());

    await withMocks(fetchMock, spawnMock, async () => {
      await theme({_: ['install', 'example']});
    });

    const config = await readFile(configPath);
    config.should.eql('color: red\n');
  });

  it('uninstalls the theme and its root config without accessing the registry', async () => {
    const target = join(baseDir, 'themes', 'example');
    const configPath = join(baseDir, '_config.example.yml');
    await mkdirs(target);
    await writeFile(join(target, 'layout.ejs'), '');
    await writeFile(configPath, 'color: blue\n');
    const fetchMock = sinon.stub();
    const spawnMock = sinon.stub();

    await withMocks(fetchMock, spawnMock, async () => {
      await theme({_: ['uninstall', 'example']});
    });

    existsSync(target).should.be.false;
    existsSync(configPath).should.be.false;
    fetchMock.notCalled.should.be.true;
    spawnMock.notCalled.should.be.true;
  });

  it('reports a theme that is not installed', async () => {
    const fetchMock = sinon.stub();
    const spawnMock = sinon.stub();

    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['uninstall', 'missing']}), 'is not installed');
    });

    fetchMock.notCalled.should.be.true;
    spawnMock.notCalled.should.be.true;
  });

  it('selects package managers from lockfiles', async () => {
    const findPackageManager = themeModule.__get__('findPackageManager');
    findPackageManager(baseDir).should.eql('npm');

    await writeFile(join(baseDir, 'package-lock.json'), '{}');
    findPackageManager(baseDir).should.eql('npm');
    await writeFile(join(baseDir, 'yarn.lock'), '');
    findPackageManager(baseDir).should.eql('yarn');
    await writeFile(join(baseDir, 'pnpm-lock.yaml'), 'lockfileVersion: 9\n');
    findPackageManager(baseDir).should.eql('pnpm');
  });

  it('rejects invalid command usage and local paths', async () => {
    const spawnMock = sinon.stub();
    const fetchMock = sinon.stub();

    await withMocks(fetchMock, spawnMock, async () => {
      await expectError(theme({_: ['install']}), 'Usage: hexo theme <install|uninstall>');
      await expectError(theme({_: ['install', '../example']}), 'must not contain a path');
      await expectError(theme({_: ['uninstall', '../example']}), 'must not contain a path');
    });
  });
});
