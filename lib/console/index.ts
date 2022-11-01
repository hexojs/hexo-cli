import helpConsole from './help';
import initConsole from './init';
import versionConsole from './version';

export = function(ctx) {
  const { console } = ctx.extend;

  console.register('help', 'Get help on a command.', {}, helpConsole);

  console.register('init', 'Create a new Hexo folder.', {
    desc: 'Create a new Hexo folder at the specified path or the current directory.',
    usage: '[destination]',
    arguments: [
      {name: 'destination', desc: 'Folder path. Initialize in current folder if not specified'}
    ],
    options: [
      {name: '--no-clone', desc: 'Copy files instead of cloning from GitHub'},
      {name: '--no-install', desc: 'Skip npm install'}
    ]
  }, initConsole);

  console.register('version', 'Display version information.', {}, versionConsole);
};
