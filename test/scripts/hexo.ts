import chai from 'chai';
import sinon from 'sinon';
import rewire from 'rewire';
import ConsoleExtend from '../../lib/extend/console';
chai.should();

require('chai').should();

describe('hexo', () => {
  const cwd = process.cwd();

  it('run help if no specified command', async () => {
    const spy = sinon.spy();
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      console_1: {
        default: ctx => {
          ctx.extend.console.register('help', spy);
        }
      }
    })(async () => {
      // @ts-expect-error
      await hexo(cwd, {_: []});
      spy.calledOnce.should.be.true;
    });
  });

  it('run specified command', async () => {
    const spy = sinon.spy();
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      console_1: {
        default: ctx => {
          ctx.extend.console.register('test', spy);
        }
      }
    })(async () => {
      // @ts-expect-error
      await hexo(cwd, {_: ['test']});
      spy.calledOnce.should.be.true;
    });
  });

  it('run help if specified command not found', async () => {
    const spy = sinon.spy();
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      console_1: {
        default: ctx => {
          ctx.extend.console.register('help', spy);
        }
      }
    })(async () => {
      // @ts-expect-error
      await hexo(cwd, {_: ['test']});
      spy.calledOnce.should.be.true;
    });
  });

  it('path - number (issue hexo#4334)', async () => {
    let args;
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      find_pkg_1: {
        default: (_cwd, _args) => {
          args = _args;
          return Promise.resolve();
        }
      }
    })(async () => {
      process.argv = ['hexo', 'new', '--path', '123', 'test'];
      // @ts-expect-error
      hexo(null, null);
      args.path.should.eql('123');
      process.argv = [];
    });
  });

  it('p - number (issue hexo#4334)', async () => {
    let args;
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      find_pkg_1: {
        default: (_cwd, _args) => {
          args = _args;
          return Promise.resolve();
        }
      }
    })(async () => {
      process.argv = ['hexo', 'new', '-p', '123', 'test'];
      // @ts-expect-error
      hexo(null, null);
      args.p.should.eql('123');
      process.argv = [];
    });
  });

  it('slug - number (issue hexo#4334)', async () => {
    let args;
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      find_pkg_1: {
        default: (_cwd, _args) => {
          args = _args;
          return Promise.resolve();
        }
      }
    })(async () => {
      process.argv = ['hexo', 'new', '--slug', '123', 'test'];
      // @ts-expect-error
      hexo(null, null);
      args.slug.should.eql('123');
      process.argv = [];
    });
  });

  it('s - number (issue hexo#4334)', async () => {
    let args;
    const hexo = rewire('../../dist/hexo');
    return hexo.__with__({
      find_pkg_1: {
        default: (_cwd, _args) => {
          args = _args;
          return Promise.resolve();
        }
      }
    })(async () => {
      process.argv = ['hexo', 'new', '-s', '123', 'test'];
      // @ts-expect-error
      hexo(null, null);
      args.s.should.eql('123');
      process.argv = [];
    });
  });

  it('should call init() method');

  it('should handle HexoNotFoundError properly', () => {
    const spy = sinon.spy();
    const hexo = rewire('../../dist/hexo');
    const dummyPath = 'dummy';
    const dummyError = 'test';
    return hexo.__with__({
      find_pkg_1: {
        default: () => Promise.resolve(dummyPath)
      },
      loadModule: () => Promise.reject(new Error(dummyError)),
      context_1: {
        default: class Context {
          log: { error: typeof spy };
          constructor() {
            this.log = {
              error: spy
            };
          }
        }
      }
    })(async () => {
      // @ts-expect-error
      await hexo(cwd, {_: ['test']});
      spy.args[0][0].should.eql(dummyError);
      spy.args[1][0].should.eql('Local hexo loading failed in %s');
      spy.args[1][1].should.eql(`\x1B[35m${dummyPath}\x1B[39m`);
      spy.args[2][0].should.eql('Try running: \'rm -rf node_modules && npm install --force\'');
      process.exitCode?.should.eql(2);
    });
  });

  it('should handle other Error properly', () => {
    const spy = sinon.spy();
    const hexo = rewire('../../dist/hexo');
    const dummyPath = 'dummy';
    const dummyError = 'error';
    return hexo.__with__({
      find_pkg_1: {
        default: () => Promise.resolve(dummyPath)
      },
      loadModule: () => Promise.resolve(),
      console_1: {
        default: () => { /* empty */ }
      },
      context_1: {
        default: class Context {
          log: { error: typeof spy, fatal: typeof spy };
          constructor() {
            this.log = {
              error: spy,
              fatal: spy
            };
          }
          init() {
            throw new Error(dummyError);
          }
        }
      }
    })(async () => {
      // @ts-expect-error
      await hexo(cwd, {_: ['test']});
      spy.args[0][0].message.should.eql(dummyError);
      process.exitCode?.should.eql(2);
    });
  });

  it('should watch SIGINT signal', () => {
    const spy = sinon.spy();
    const watchSpy = sinon.spy();
    const exitSpy = sinon.spy();
    const dummyPath = 'dummy';
    const hexo = rewire('../../dist/hexo');
    const processSpy = {
      on: process.on,
      emit: process.emit,
      exit: exitSpy
    };
    return hexo.__with__({
      find_pkg_1: {
        default: () => Promise.resolve(dummyPath)
      },
      loadModule: () => Promise.resolve(),
      console_1: {
        default: () => { /* empty */ }
      },
      process: processSpy,
      context_1: {
        default: class Context {
          log: { error: typeof spy, fatal: typeof spy, info: typeof spy };
          extend: {
            console: ConsoleExtend;
          };
          constructor() {
            this.log = {
              error: spy,
              fatal: spy,
              info: spy
            };
            this.extend = {
              console: new ConsoleExtend()
            };
          }
          init() {
            return Promise.resolve();
          }
          call() {
            return Promise.resolve(processSpy.emit('SIGINT'));
          }
          unwatch() {
            watchSpy();
          }
          exit() {
            return Promise.resolve();
          }
        }
      }
    })(async () => {
      // @ts-expect-error
      await hexo(cwd, {_: ['help']});
      [
        'Good bye',
        'See you again',
        'Farewell',
        'Have a nice day',
        'Bye!',
        'Catch you later'
      ].includes(spy.args[0][0]).should.be.true;
      watchSpy.calledOnce.should.be.true;
      exitSpy.calledOnce.should.be.true;
    });
  });

  it('load hexo module in parent folder recursively');
});
