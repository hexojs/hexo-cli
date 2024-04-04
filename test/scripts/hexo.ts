import chai from 'chai';
import sinon from 'sinon';
import proxyquire from 'proxyquire';
chai.should();

require('chai').should();

describe('hexo', () => {
  const cwd = process.cwd();

  it('run help if no specified command', async () => {
    const spy = sinon.spy();
    const hexo = proxyquire('../../dist/hexo', {
      './console'(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    await hexo(cwd, {_: []});
    spy.calledOnce.should.be.true;
  });

  it('run specified command', async () => {
    const spy = sinon.spy();
    const hexo = proxyquire('../../dist/hexo', {
      './console'(ctx) {
        ctx.extend.console.register('test', spy);
      }
    });

    await hexo(cwd, {_: ['test']});
    spy.calledOnce.should.be.true;
  });

  it('run help if specified command not found', async () => {
    const spy = sinon.spy();
    const hexo = proxyquire('../../dist/hexo', {
      './console'(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    await hexo(cwd, {_: ['test']});
    spy.calledOnce.should.be.true;
  });

  it('should call init() method');

  it('should handle error properly');

  it('should watch SIGINT signal');

  it('load hexo module in current folder');

  it('load hexo module in parent folder recursively');

  it('display error message if failed to load hexo module');
});
