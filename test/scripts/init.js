'use strict';

require('chai').should();
const pathFn = require('path');
const fs = require('hexo-fs');
const Promise = require('bluebird');
const { createSha1Hash } = require('hexo-util');
const rewire = require('rewire');
const Context = require('../../lib/context');
const assetDir = pathFn.join(__dirname, '../../assets');

describe('init', () => {
  const baseDir = pathFn.join(__dirname, 'init_test');
  const initModule = rewire('../../lib/console/init');
  const hexo = new Context(baseDir, { silent: true });
  const init = initModule.bind(hexo);
  let assets = [];

  function rmdir(path) {
    return fs.rmdir(path).catch(err => {
      if (err && err.code === 'ENOENT') return;
      throw err;
    });
  }

  function pipeStream(rs, ws) {
    return new Promise((resolve, reject) => {
      rs.pipe(ws)
        .on('error', reject)
        .on('finish', resolve);
    });
  }

  function compareFile(a, b) {
    const streamA = createSha1Hash();
    const streamB = createSha1Hash();

    return Promise.all([
      pipeStream(fs.createReadStream(a), streamA),
      pipeStream(fs.createReadStream(b), streamB)
    ]).then(() => streamA.read().equals(streamB.read()));
  }

  function check(path) {
    return Promise.each(assets, item => compareFile(
      pathFn.join(assetDir, item),
      pathFn.join(path, item)
    ).should.eventually.be.true).finally(() => rmdir(path));
  }

  function withoutSpawn(fn) {
    return initModule.__with__('spawn', () => Promise.reject(new Error('spawn is not available')))(fn);
  }

  before(() => fs.listDir(assetDir).then(files => {
    assets = files;
  }));

  after(() => rmdir(baseDir));

  it('current path', () => withoutSpawn(() => init({_: []}).then(() => check(baseDir))));

  it('relative path', () => withoutSpawn(() => init({_: ['test']}).then(() => check(pathFn.join(baseDir, 'test')))));

  it('absolute path', () => {
    const path = pathFn.join(baseDir, 'test');

    return withoutSpawn(() => init({_: [path]}).then(() => check(path)));
  });

  it('git clone');

  it('npm install');
});
