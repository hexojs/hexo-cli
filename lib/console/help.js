'use strict';

var chalk = require('chalk');

module.exports = function(args){
  console.log('Usage: hexo <command>\n');

  printList('Commands', [
    {name: 'help', desc: 'Get help on Hexo.'},
    {name: 'init', desc: 'Create a new Hexo folder.'},
    {name: 'version', desc: 'Display version information.'}
  ]);

  printList('Global Options', [
    {name: '--config', desc: 'Specify config file instead of using _config.yml'},
    {name: '--cwd', desc: 'Specify the CWD'},
    {name: '--debug', desc: 'Display all verbose messages in the terminal'},
    {name: '--safe', desc: 'Disable all plugins and scripts'},
    {name: '--silent', desc: 'Hide output on console'}
  ]);

  console.log('For more help, you can use \'hexo help [command]\' for the detailed information');
  console.log('or you can check the docs:', chalk.underline('http://hexo.io/docs/'));
};

function printList(title, list){
  var length = 0;
  var str = title + '\n';

  list.sort(function(a, b){
    var nameA = a.name;
    var nameB = b.name;

    if (nameA.length >= nameB.length && length < nameA.length){
      length = nameA.length;
    } else if (length < nameB.length){
      length = nameB.length;
    }

    if (nameA < nameB) return -1;
    else if (nameA > nameB) return 1;
    else return 0;
  }).forEach(function(item){
    str += '  ' + chalk.bold(item.name);

    for (var i = 0, len = length - item.name.length; i < len; i++){
      str += ' ';
    }

    str += '   ' + item.desc + '\n';
  });

  console.log(str);
}