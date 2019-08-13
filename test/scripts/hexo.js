'use strict';

require('chai').should();
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('hexo', () => {
  const cwd = process.cwd();

  it('run help if no specified command', () => {
    const spy = sinon.spy();
    const hexo = proxyquire('../../lib/hexo', {
      './console'(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    return hexo(cwd, {_: []}).then(() => {
      spy.calledOnce.should.be.true;
    });
  });

  it('run specified command', () => {
    const spy = sinon.spy();
    const hexo = proxyquire('../../lib/hexo', {
      './console'(ctx) {
        ctx.extend.console.register('test', spy);
      }
    });

    return hexo(cwd, {_: ['test']}).then(() => {
      spy.calledOnce.should.be.true;
    });
  });

  it('run help if specified command not found', () => {
    const spy = sinon.spy();
    const hexo = proxyquire('../../lib/hexo', {
      './console'(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    return hexo(cwd, {_: ['test']}).then(() => {
      spy.calledOnce.should.be.true;
    });
  });

  it('should call init() method');

  it('should handle error properly');

  it('should watch SIGINT signal');

  it('load hexo module in current folder');

  it('load hexo module in parent folder recursively');

  it('display error message if failed to load hexo module');
});
