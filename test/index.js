'use strict';

var chai = require('chai');

chai.use(require('chai-as-promised'));

describe('hexo-cli', function() {
  require('./scripts/find_pkg');
  require('./scripts/context');
  require('./scripts/hexo');
  require('./scripts/init');
  require('./scripts/help');
  require('./scripts/version');
});
