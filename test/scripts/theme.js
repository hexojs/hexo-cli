'use strict';

var should = require('chai').should(); // eslint-disable-line
var fs = require('fs');
var path = require('path');
var rewire = require('rewire');
var sinon = require('sinon');
var Context = require('../../lib/context');

describe('theme', function() {
  var context, themeModule;

  beforeEach(function() {
    context = new Context();
    themeModule = require('../../lib/console/theme');
  });

  it('throw error when folder already exists', function() {
    var params = { _: [] };

    return themeModule
      .call(context, params)
      .catch(function(error) {
        error.message.should.contain('A theme name must be provided');
      });
  });

  it('create theme initial structure', function() {
    var params = { _: ['my-hexo-theme'] };
    var themeModule = rewire('../../lib/console/theme');
    var mkdirSpy = sinon.spy();
    var writeFileSpy = sinon.spy();
    var fsMock = {
      mkdirSync: mkdirSpy,
      writeFileSync: writeFileSpy
    };

    return themeModule
      .__with__({
        fs: Object.assign(fs, fsMock)
      })(function() {
        return themeModule.call(context, params);
      })
      .then(function() {
        mkdirSpy.args.should.eql([
          [path.join(context.base_dir, 'my-hexo-theme')],
          [path.join(context.base_dir, 'my-hexo-theme/languages')],
          [path.join(context.base_dir, 'my-hexo-theme/layout')],
          [path.join(context.base_dir, 'my-hexo-theme/scripts')],
          [path.join(context.base_dir, 'my-hexo-theme/source')]
        ]);

        writeFileSpy.args.should.eql([
          [path.join(context.base_dir, 'my-hexo-theme/config.yml'), ''],
          [path.join(context.base_dir, 'my-hexo-theme/languages/.gitkeep'), ''],
          [path.join(context.base_dir, 'my-hexo-theme/layout/.gitkeep'), ''],
          [path.join(context.base_dir, 'my-hexo-theme/scripts/.gitkeep'), ''],
          [path.join(context.base_dir, 'my-hexo-theme/source/.gitkeep'), '']
        ]);
      });
  });
});
