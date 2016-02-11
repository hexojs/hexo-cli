'use strict';

var should = require('chai').should(); // eslint-disable-line
var Context = require('../../lib/context');
var sinon = require('sinon');
var Promise = require('bluebird');
var fs = require('hexo-fs');
var pathFn = require('path');
var format = require('util').format;
var rewire = require('rewire');

function getConsoleLog(spy) {
  var args = spy.args;

  return args.map(function(arr) {
    return format.apply(null, arr);
  }).join('\n');
}

describe('help', function() {
  var helpModule = rewire('../../lib/console/help');
  var hexo = new Context();

  require('../../lib/console')(hexo);

  it('show global help', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: []});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.contain('Usage: hexo <command>');
    });
  });

  it('show help on a command', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init');
    });
  });

  it('show help on a command with alias', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['i']});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init');
    });
  });

  it('show command description', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.contain('Description:\n' + hexo.extend.console.get('init').options.desc);
    });
  });

  it('show command usage', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.contain('Usage: hexo init ' + hexo.extend.console.get('init').options.usage);
    });
  });

  it('show command arguments', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      var output = getConsoleLog(spy);

      hexo.extend.console.get('init').options.arguments.forEach(function(arg) {
        output.should.contain(arg.name);
        output.should.contain(arg.desc);
      });
    });
  });

  it('show command options', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: ['init']});
    }).then(function() {
      var output = getConsoleLog(spy);

      hexo.extend.console.get('init').options.options.forEach(function(option) {
        output.should.contain(option.name);
        output.should.contain(option.desc);
      });
    });
  });

  it('show version info', function() {
    sinon.stub(hexo, 'call', function() {
      return Promise.resolve();
    });

    return helpModule.call(hexo, {_: [], version: true}).then(function() {
      hexo.call.calledWith('version').should.be.true;
    }).finally(function() {
      hexo.call.restore();
    });
  });

  it('show console list', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: [], consoleList: true});
    }).then(function() {
      var output = getConsoleLog(spy);

      output.should.eql(Object.keys(hexo.extend.console.list()).join('\n'));
    });
  });

  it('show completion script', function() {
    var spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(function() {
      return helpModule.call(hexo, {_: [], completion: 'bash'});
    }).then(function() {
      var output = getConsoleLog(spy);

      return fs.readFile(pathFn.join(__dirname, '../../completion/bash')).then(function(script) {
        script.should.eql(output);
      });
    });
  });
});
