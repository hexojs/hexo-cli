'use strict';

var chai = require('chai');

chai.use(require('chai-as-promised'));

describe('hexo-cli', function() {
  require('./scripts/find_pkg');
  require('./scripts/init');
});
