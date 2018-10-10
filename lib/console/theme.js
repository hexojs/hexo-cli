'use strict';

var Promise = require('bluebird');
var fs = require('fs');
var path = require('path');

var themeStructureFolders = [
  'languages',
  'layout',
  'scripts',
  'source'
];

function parseArguments(args) {
  return { name: args._[0] };
}

function addFolder(pathName) {
  fs.mkdirSync(pathName);
}

function addFile(directoryPath, fileName) {
  fs.writeFileSync(path.join(directoryPath, fileName), '');
}

function themeConsole(args) {
  var name = parseArguments(args).name;

  if (!name)
    return Promise.reject(new Error('A theme name must be provided'));

  var baseDirectory = this.base_dir;
  var themeDirectory = path.join(baseDirectory, name);

  if (fs.existsSync(themeDirectory))
    return Promise.reject(
      new Error('Seems you already have `' + name + '` in your directory')
    );

  addFolder(themeDirectory);
  addFile(themeDirectory, 'config.yml');

  themeStructureFolders.forEach(folderName => {
    var folderPath = path.join(themeDirectory, folderName);
    addFolder(folderPath);
    addFile(folderPath, '.gitkeep');
  });

  return Promise.resolve();
};

module.exports = themeConsole;
