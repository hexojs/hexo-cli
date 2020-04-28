'use strict';

require('chai').should();
const { join } = require('path');
const { listDir, rmdir, createReadStream } = require('hexo-fs');
const { createSha1Hash } = require('hexo-util');
const rewire = require('rewire');
const Context = require('../../lib/context');
const assetDir = join(__dirname, '../../assets');

describe('init', () => {
  const baseDir = join(__dirname, 'init_test');
  const initModule = rewire('../../lib/console/init');
  const hexo = new Context(baseDir, { silent: true });
  const init = initModule.bind(hexo);
  let assets = [];

  async function rmDir(path) {
    try {
      await rmdir(path);
    } catch (err) {
      if (err && err.code === 'ENOENT') return;
      throw err;
    }
  }

  function pipeStream(rs, ws) {
    return new Promise((resolve, reject) => {
      rs.pipe(ws)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  async function compareFile(a, b) {
    const streamA = createSha1Hash();
    const streamB = createSha1Hash();

    await Promise.all([
      pipeStream(createReadStream(a), streamA),
      pipeStream(createReadStream(b), streamB)
    ]);

    streamA.read().equals(streamB.read());
  }

  async function check(path) {
    for (const item of assets) {
      const result = await compareFile(
        join(assetDir, item),
        join(path, item)
      );

      result.should.be.true;
    }

  }

  function withoutSpawn(fn) {
    return initModule.__with__('spawn', () => Promise.reject(new Error('spawn is not available')))(fn);
  }

  before(async () => {
    const files = await listDir(assetDir);
    assets = files;
  });

  after(async () => await rmDir(baseDir));

  it('current path', () => withoutSpawn(async () => {
    await init({_: []});
    await check(baseDir);
  }));

  it('relative path', () => withoutSpawn(async () => {
    await init({_: ['test']});
    await check(join(baseDir, 'test'));
  }));

  it('absolute path', () => {
    const path = join(baseDir, 'test');

    withoutSpawn(async () => {
      await init({_: [path]});
      await check(path);
    });
  });

  it('git clone');

  it('npm install');
});
