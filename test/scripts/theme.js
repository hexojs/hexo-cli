'use strict';

var should = require('chai').should(); // eslint-disable-line
var Context = require('../../lib/context');

describe('theme', function() {
  let context;
  let themeModule;

  beforeEach(function() {
    context = new Context();
    themeModule = (require('../../lib/console/theme'));
  });

  it('throw error when folder already exists', function() {
    var params = { _: [] };

    themeModule
      .call(context, params)
      .catch(function(error) {
        error.message.should.contain('A theme name must be provided');
      });
  });

  it('create folder structure', function() {
    //
  });
});
