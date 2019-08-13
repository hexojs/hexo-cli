'use strict';

require('chai').should();
const Context = require('../../lib/context');
const sinon = require('sinon');
const Promise = require('bluebird');
const fs = require('hexo-fs');
const pathFn = require('path');
const { format } = require('util');
const rewire = require('rewire');

function getConsoleLog(spy) {
  const args = spy.args;

  return args.map(arr => format.apply(null, arr)).join('\n');
}

describe('help', () => {
  const helpModule = rewire('../../lib/console/help');
  const hexo = new Context();

  require('../../lib/console')(hexo);

  it('show global help', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: []})).then(() => {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo <command>');
    });
  });

  it('show help on a command', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: ['init']})).then(() => {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init');
    });
  });

  it('show help on a command with alias', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: ['i']})).then(() => {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init');
    });
  });

  it('show command description', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: ['init']})).then(() => {
      const output = getConsoleLog(spy);

      output.should.contain(`Description:\n${hexo.extend.console.get('init').options.desc}`);
    });
  });

  it('show command usage', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: ['init']})).then(() => {
      const output = getConsoleLog(spy);

      output.should.contain(`Usage: hexo init ${hexo.extend.console.get('init').options.usage}`);
    });
  });

  it('show command arguments', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: ['init']})).then(() => {
      const output = getConsoleLog(spy);

      hexo.extend.console.get('init').options.arguments.forEach(arg => {
        output.should.contain(arg.name);
        output.should.contain(arg.desc);
      });
    });
  });

  it('show command options', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: ['init']})).then(() => {
      const output = getConsoleLog(spy);

      hexo.extend.console.get('init').options.options.forEach(option => {
        output.should.contain(option.name);
        output.should.contain(option.desc);
      });
    });
  });

  it('show version info', () => {
    sinon.stub(hexo, 'call').callsFake(() => Promise.resolve());

    return helpModule.call(hexo, {_: [], version: true}).then(() => {
      hexo.call.calledWith('version').should.be.true;
    }).finally(() => {
      hexo.call.restore();
    });
  });

  it('show console list', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: [], consoleList: true})).then(() => {
      const output = getConsoleLog(spy);

      output.should.eql(Object.keys(hexo.extend.console.list()).join('\n'));
    });
  });

  it('show completion script', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(() => helpModule.call(hexo, {_: [], completion: 'bash'})).then(() => {
      const output = getConsoleLog(spy);

      return fs.readFile(pathFn.join(__dirname, '../../completion/bash')).then(script => {
        script.should.eql(output);
      });
    });
  });
});
