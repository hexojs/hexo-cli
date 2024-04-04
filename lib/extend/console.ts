import Promise from 'bluebird';
import abbrev from 'abbrev';
import type { Options, Callback, Store, Alias } from '../types';

class Console {
  store: Store;
  alias: Alias;

  constructor() {
    this.store = {};
    this.alias = {};
  }

  get(name: string) {
    name = name.toLowerCase();
    return this.store[this.alias[name]];
  }

  list() {
    return this.store;
  }

  register(name: string, desc: string, options: Options, fn: Callback): void;
  register(name: string, options: Options, fn: Callback): void;
  register(name: string, desc: string, fn: Callback): void;
  register(name: string, fn: Callback): void;
  register(name: string, desc: string | Options | Callback, options?: Options | Callback, fn?: Callback) {
    if (!name) throw new TypeError('name is required');

    if (!fn) {
      if (options) {
        if (typeof options === 'function') {
          fn = options as Callback;

          if (typeof desc === 'object') { // name, options, fn
            options = desc;
            desc = '';
          } else { // name, desc, fn
            options = {};
          }
        } else {
          throw new TypeError('fn must be a function');
        }
      } else {
        // name, fn
        if (typeof desc === 'function') {
          fn = desc as Callback;
          options = {};
          desc = '';
        } else {
          throw new TypeError('fn must be a function');
        }
      }
    }

    if (fn.length > 1) {
      fn = Promise.promisify(fn);
    } else {
      fn = Promise.method(fn);
    }

    this.store[name.toLowerCase()] = fn;
    const c = fn;
    c.options = options as Options;
    c.desc = desc as string;

    this.alias = abbrev(Object.keys(this.store));
  }
}

export = Console;
