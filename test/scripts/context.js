'use strict';

require('chai').should();
const sinon = require('sinon');

describe('context', () => {
  const Context = require('../../lib/context');

  describe('call', () => {
    const hexo = new Context();
    const spy = sinon.spy(args => args);

    hexo.extend.console.register('test', spy);

    it('success', () => {
      const args = {foo: 'bar'};

      return hexo.call('test', args).then(result => {
        result.should.eql(args);
        spy.calledOnce.should.be.true;
        spy.lastCall.args[0].should.eql(args);
        spy.resetHistory();
      });
    });

    it('console not registered', () => {
      const hexo = new Context();

      return hexo.call('wtf').catch(err => {
        err.should.have.property('message', 'Console `wtf` has not been registered yet!');
      });
    });

    it('with callback', done => {
      const args = {foo: 'bar'};

      hexo.call('test', args, (err, result) => {
        if (err) return done(err);

        result.should.eql(args);
        spy.calledOnce.should.be.true;
        spy.lastCall.args[0].should.eql(args);
        spy.resetHistory();
        done();
      });
    });

    it('with callback but no args', done => {
      hexo.call('test', err => {
        if (err) return done(err);

        spy.calledOnce.should.be.true;
        spy.resetHistory();
        done();
      });
    });
  });

  describe('exit', () => {
    let hexo, fatal;

    beforeEach(() => {
      hexo = new Context();
      fatal = hexo.log.fatal = sinon.spy();
    });

    it('no error', () => {
      hexo.exit();
      fatal.called.should.be.false;
    });

    it('with error', () => {
      hexo.exit(new Error('error test'));
      fatal.calledOnce.should.be.true;
    });
  });
});
