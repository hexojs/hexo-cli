import chai from 'chai';
import sinon from 'sinon';
import Console from '../../lib/extend/console';
chai.should();

describe('console', () => {
  it('register - name required', () => {
    const consoleExtend = new Console();
    try {
      // @ts-expect-error
      consoleExtend.register();
    } catch (err: any) {
      err.should.have.property('message', 'name is required');
    }
  });

  it('register - name, invalid fn', () => {
    const consoleExtend = new Console();
    try {
      // @ts-expect-error
      consoleExtend.register('test', 'fn');
    } catch (err: any) {
      err.should.have.property('message', 'fn must be a function');
    }
  });

  it('register - name, desc, invalid fn', () => {
    const consoleExtend = new Console();
    try {
      // @ts-expect-error
      consoleExtend.register('test', 'desc', 'fn');
    } catch (err: any) {
      err.should.have.property('message', 'fn must be a function');
    }
  });

  it('register - name, options, fn', () => {
    const consoleExtend = new Console();
    const options = {};
    const fn = sinon.spy();
    consoleExtend.register('test', options, fn);
    const storeFn = consoleExtend.get('test');
    storeFn();
    fn.calledOnce.should.be.true;
    storeFn.options?.should.eql(options);
    storeFn.desc?.should.eql('');
  });

  it('register - name, desc, fn', () => {
    const consoleExtend = new Console();
    const desc = 'desc';
    const fn = sinon.spy();
    consoleExtend.register('test', desc, fn);
    const storeFn = consoleExtend.get('test');
    storeFn();
    fn.calledOnce.should.be.true;
    storeFn.options?.should.deep.equal({});
    storeFn.desc?.should.eql(desc);
  });

  it('register - name, fn', () => {
    const consoleExtend = new Console();
    const fn = sinon.spy();
    consoleExtend.register('test', fn);
    const storeFn = consoleExtend.get('test');
    storeFn();
    fn.calledOnce.should.be.true;
    storeFn.options?.should.deep.equal({});
    storeFn.desc?.should.eql('');
  });
});
