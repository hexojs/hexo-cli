'use strict';

const should = require('chai').should(); // eslint-disable-line
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('hexo', function() {
  const cwd = process.cwd();

  it('run help if no specified command', function() {
    const spy = sinon.spy();
    const hexo = proxyquire('../../lib/hexo', {
      './console': function(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    return hexo(cwd, {_: []}).then(function() {
      spy.calledOnce.should.be.true;
    });
  });

  it('run specified command', function() {
    const spy = sinon.spy();
    const hexo = proxyquire('../../lib/hexo', {
      './console': function(ctx) {
        ctx.extend.console.register('test', spy);
      }
    });

    return hexo(cwd, {_: ['test']}).then(function() {
      spy.calledOnce.should.be.true;
    });
  });

  it('run help if specified command not found', function() {
    const spy = sinon.spy();
    const hexo = proxyquire('../../lib/hexo', {
      './console': function(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    return hexo(cwd, {_: ['test']}).then(function() {
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
