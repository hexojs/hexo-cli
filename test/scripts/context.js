'use strict';

const should = require('chai').should(); // eslint-disable-line
const sinon = require('sinon');

describe('context', function() {
  const Context = require('../../lib/context');

  describe('call', function() {
    const hexo = new Context();
    const spy = sinon.spy(function(args) {
      return args;
    });

    hexo.extend.console.register('test', spy);

    it('success', function() {
      const args = {foo: 'bar'};

      return hexo.call('test', args).then(function(result) {
        result.should.eql(args);
        spy.calledOnce.should.be.true;
        spy.lastCall.args[0].should.eql(args);
        spy.resetHistory();
      });
    });

    it('console not registered', function() {
      const hexo = new Context();

      return hexo.call('wtf').catch(function(err) {
        err.should.have.property('message', 'Console `wtf` has not been registered yet!');
      });
    });

    it('with callback', function(done) {
      const args = {foo: 'bar'};

      hexo.call('test', args, function(err, result) {
        if (err) return done(err);

        result.should.eql(args);
        spy.calledOnce.should.be.true;
        spy.lastCall.args[0].should.eql(args);
        spy.resetHistory();
        done();
      });
    });

    it('with callback but no args', function(done) {
      hexo.call('test', function(err) {
        if (err) return done(err);

        spy.calledOnce.should.be.true;
        spy.resetHistory();
        done();
      });
    });
  });

  describe('exit', function() {
    let hexo, fatal;

    beforeEach(function() {
      hexo = new Context();
      fatal = hexo.log.fatal = sinon.spy();
    });

    it('no error', function() {
      hexo.exit();
      fatal.called.should.be.false;
    });

    it('with error', function() {
      hexo.exit(new Error('error test'));
      fatal.calledOnce.should.be.true;
    });
  });
});
