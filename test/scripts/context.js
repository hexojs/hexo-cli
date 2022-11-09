'use strict';

require('chai').should();
const should = require('chai').should();
const sinon = require('sinon');

describe('context', () => {
  const Context = require('../../dist/context');

  describe('call', () => {
    const hexo = new Context();
    const spy = sinon.spy(args => args);

    hexo.extend.console.register('test', spy);

    it('success', async () => {
      const args = {foo: 'bar'};
      const result = await hexo.call('test', args);

      result.should.eql(args);
      spy.calledOnce.should.be.true;
      spy.lastCall.args[0].should.eql(args);
      spy.resetHistory();
    });

    it('console not registered', async () => {
      const hexo = new Context();

      try {
        await hexo.call('wtf');
        should.fail();
      } catch (err) {
        err.should.have.property('message', 'Console `wtf` has not been registered yet!');
      }
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
      hexo.log.fatal = sinon.spy();
      fatal = hexo.log.fatal;
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
