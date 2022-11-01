import logger from 'hexo-log';
import { underline } from 'picocolors';
import { EventEmitter } from 'events';
import Promise from 'bluebird';
import ConsoleExtend from './extend/console';

// a stub Hexo object
// see `hexojs/hexo/lib/hexo/index.js`

type Callback = (err?: any, value?: any) => void;

class Context extends EventEmitter {
  base_dir: string;
  log: logger;
  extend: {
    console: ConsoleExtend;
  };

  constructor(base = process.cwd(), args = {}) {
    super();
    this.base_dir = base;
    this.log = logger(args);

    this.extend = {
      console: new ConsoleExtend()
    };
  }

  init() {
    // Do nothing
  }

  call(name: string, args: object, callback: Callback);
  call(name: string, callback?: Callback);
  call(name: string, args?: object | Callback, callback?: Callback) {
    if (!callback && typeof args === 'function') {
      callback = args as Callback;
      args = {};
    }

    return new Promise((resolve, reject) => {
      const c = this.extend.console.get(name);

      if (c) {
        c.call(this, args).then(resolve, reject);
      } else {
        reject(new Error(`Console \`${name}\` has not been registered yet!`));
      }
    }).asCallback(callback);
  }

  exit(err?: Error) {
    if (err) {
      this.log.fatal(
        {err},
        'Something\'s wrong. Maybe you can find the solution here: %s',
        underline('http://hexo.io/docs/troubleshooting.html')
      );
    }

    return Promise.resolve();
  }

  unwatch() {
    // Do nothing
  }
}

export = Context;
