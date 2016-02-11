'use strict';

var should = require('chai').should(); // eslint-disable-line
var sinon = require('sinon');
var proxyquire = require('proxyquire');

describe('hexo', function() {
  var cwd = process.cwd();

  it('run help if no specified command', function() {
    var spy = sinon.spy();
    var hexo = proxyquire('../../lib/hexo', {
      './console': function(ctx) {
        ctx.extend.console.register('help', spy);
      }
    });

    return hexo(cwd, {_: []}).then(function() {
      spy.calledOnce.should.be.true;
    });
  });

  it('run specified command', function() {
    var spy = sinon.spy();
    var hexo = proxyquire('../../lib/hexo', {
      './console': function(ctx) {
        ctx.extend.console.register('test', spy);
      }
    });

    return hexo(cwd, {_: ['test']}).then(function() {
      spy.calledOnce.should.be.true;
    });
  });

  it('run help if specified command not found', function() {
    var spy = sinon.spy();
    var hexo = proxyquire('../../lib/hexo', {
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
