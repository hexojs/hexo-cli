'use strict';

require('chai');

describe('hexo-cli', () => {
  require('./scripts/find_pkg');
  require('./scripts/context');
  require('./scripts/hexo');
  require('./scripts/init');
  require('./scripts/help');
  require('./scripts/version');
});
