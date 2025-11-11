import chai from 'chai';
import sinon, { type SinonStub } from 'sinon';
import { readFile } from 'hexo-fs';
import { join } from 'path';
import { format } from 'util';
import rewire from 'rewire';
import Context from '../../lib/context';
import console from '../../lib/console/index';
chai.should();

function getConsoleLog({ args }: { args: any[] }) {
  return args.map(arr => format(...arr)).join('\n');
}

describe('help', () => {
  const helpModule = rewire('../../dist/console/help');
  const hexo = new Context();

  console(hexo);

  it('show global help', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(async () => {
      await helpModule.call(hexo, {_: []});
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
    })(async () => {
      await helpModule.call(hexo, {_: ['init']});
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
    })(async () => {
      await helpModule.call(hexo, {_: ['i']});
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
    })(async () => {
      await helpModule.call(hexo, {_: ['init']});
      const output = getConsoleLog(spy);

      output.should.contain(`Description:\n${hexo.extend.console.get('init').options!.desc}`);
    });
  });

  it('show command usage', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(async () => {
      await helpModule.call(hexo, {_: ['init']});
      const output = getConsoleLog(spy);

      output.should.contain(`Usage: hexo init ${hexo.extend.console.get('init').options!.usage}`);
    });
  });

  it('show command arguments', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(async () => {
      await helpModule.call(hexo, {_: ['init']});
      const output = getConsoleLog(spy);

      hexo.extend.console.get('init').options!.arguments!.forEach(arg => {
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
    })(async () => {
      await helpModule.call(hexo, {_: ['init']});
      const output = getConsoleLog(spy);

      hexo.extend.console.get('init').options!.options!.forEach(option => {
        output.should.contain(option.name);
        output.should.contain(option.desc);
      });
    });
  });

  it('show version info', async () => {
    sinon.stub(hexo, 'call').callsFake(() => Promise.resolve());

    await helpModule.call(hexo, {_: [], version: true});

    const call = hexo.call as SinonStub;

    call.calledWith('version').should.be.true;

    await call.restore();
  });

  it('show console list', () => {
    const spy = sinon.spy();

    return helpModule.__with__({
      console: {
        log: spy
      }
    })(async () => {
      await helpModule.call(hexo, {_: [], consoleList: true});
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
    })(async () => {
      await helpModule.call(hexo, {_: [], completion: 'bash'});
      const output = getConsoleLog(spy);

      const script = await readFile(join(__dirname, '../../completion/bash'));
      script.should.eql(output);
    });
  });
});
