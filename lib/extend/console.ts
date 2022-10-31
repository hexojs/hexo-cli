'use strict';

import Promise from 'bluebird';
import abbrev from 'abbrev';

interface Store {
  [key: string]: Function;
}

interface Alias {
  [key: string]: string;
}

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

  register(name, desc, options, fn) {
    if (!name) throw new TypeError('name is required');

    if (!fn) {
      if (options) {
        if (typeof options === 'function') {
          fn = options;

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
          fn = desc;
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
    c.options = options;
    c.desc = desc;

    this.alias = abbrev(Object.keys(this.store));
  }
}

export = Console;
