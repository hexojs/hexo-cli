'use strict';

const should = require('chai').should(); // eslint-disable-line
const Context = require('../../lib/context');
const sinon = require('sinon');
const Promise = require('bluebird');
const fs = require('hexo-fs');
const pathFn = require('path');
const format = require('util').format;
const rewire = require('rewire');

function getConsoleLog(spy) {
  const args = spy.args;

  return args.map(function(arr) {
    return format.apply(null, arr);
  }).join('\n');
}

describe('help', function() {
  const helpModule = rewire('../../lib/console/help');
  const hexo = new Context();

  require('../../lib/console')(hexo);

  it('show global help', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: []});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo <command>');
    });
  });

  it('show help on a command', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init');
    });
  });

  it('show help on a command with alias', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['i']});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init');
    });
  });

  it('show command description', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.contain('Description:\n' + hexo.extend.console.get('init').options.desc);
    });
  });

  it('show command usage', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init ' + hexo.extend.console.get('init').options.usage);
    });
  });

  it('show command arguments', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      const output = getConsoleLog(spy);

      hexo.extend.console.get('init').options.arguments.forEach(function(arg) {
        output.should.contain(arg.name);
        output.should.contain(arg.desc);
      });
    });
  });

  it('show command options', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      const output = getConsoleLog(spy);

      hexo.extend.console.get('init').options.options.forEach(function(option) {
        output.should.contain(option.name);
        output.should.contain(option.desc);
      });
    });
  });

  it('show version info', function() {
    sinon.stub(hexo, 'call').callsFake(() => {
      return Promise.resolve();
    });

    return helpModule.call(hexo, {_: [], version: true}).then(function() {
      hexo.call.calledWith('version').should.be.true;
    }).finally(function() {
      hexo.call.restore();
    });
  });

  it('show console list', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: [], consoleList: true});
    }).then(function() {
      const output = getConsoleLog(spy);

      output.should.eql(Object.keys(hexo.extend.console.list()).join('\n'));
    });
  });

  it('show completion script', function() {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: [], completion: 'bash'});
    }).then(function() {
      const output = getConsoleLog(spy);

      return fs.readFile(pathFn.join(__dirname, '../../completion/bash')).then(function(script) {
        script.should.eql(output);
      });
    });
  });
});
