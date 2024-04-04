import { underline, bold } from 'picocolors';
import { readFile } from 'hexo-fs';
import { join } from 'path';
import Promise from 'bluebird';
import type Context from '../context';
import type { Callback, Store, Command } from '../types';

const COMPLETION_DIR = join(__dirname, '../../completion');

interface HelpArgs {
  _: string[];
  v?: boolean;
  version?: boolean;
  consoleList?: boolean;
  completion?: string;
}

function helpConsole(this: Context, args: HelpArgs) {
  if (args.v || args.version) {
    return this.call('version');
  } else if (args.consoleList) {
    return printConsoleList(this.extend.console.list());
  } else if (typeof args.completion === 'string') {
    return printCompletion(args.completion);
  }

  const command = args._[0];

  if (typeof command === 'string' && command !== 'help') {
    const c = this.extend.console.get(command);
    if (c) return printHelpForCommand(this.extend.console.alias[command], c);
  }

  return printAllHelp(this.extend.console.list());
}

function printHelpForCommand(command: string, data: Callback) {
  const { options } = data;

  const desc = options.description || options.desc || data.description || data.desc;

  console.log('Usage: hexo', command, options.usage || '');
  console.log('\nDescription:');
  console.log(`${desc}\n`);

  if (options.arguments) printList('Arguments', options.arguments);
  if (options.commands) printList('Commands', options.commands);
  if (options.options) printList('Options', options.options);

  return Promise.resolve();
}

function printAllHelp(list: Store) {
  const keys = Object.keys(list);
  const commands = [];
  const { length } = keys;

  for (let i = 0; i < length; i++) {
    const key = keys[i];

    commands.push({
      name: key,
      desc: list[key].desc
    });
  }

  console.log('Usage: hexo <command>\n');

  printList('Commands', commands);

  printList('Global Options', [
    {name: '--config', desc: 'Specify config file instead of using _config.yml'},
    {name: '--cwd', desc: 'Specify the CWD'},
    {name: '--debug', desc: 'Display all verbose messages in the terminal'},
    {name: '--draft', desc: 'Display draft posts'},
    {name: '--safe', desc: 'Disable all plugins and scripts'},
    {name: '--silent', desc: 'Hide output on console'}
  ]);

  console.log('For more help, you can use \'hexo help [command]\' for the detailed information');
  console.log('or you can check the docs:', underline('https://hexo.io/docs/'));

  return Promise.resolve();
}

function printList(title: string, list: Command[]) {
  list.sort((a, b) => {
    const nameA = a.name;
    const nameB = b.name;

    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;

    return 0;
  });

  const lengths = list.map(item => item.name.length);
  const maxLen = lengths.reduce((prev, current) => Math.max(prev, current));

  let str = `${title}:\n`;
  const { length } = list;

  for (let i = 0; i < length; i++) {
    const { description = list[i].desc } = list[i];
    const pad = ' '.repeat(maxLen - lengths[i] + 2);
    str += `  ${bold(list[i].name)}${pad}${description}\n`;
  }

  console.log(str);

  return Promise.resolve();
}

function printConsoleList(list: Store) {
  console.log(Object.keys(list).join('\n'));

  return Promise.resolve();
}

function printCompletion(type: string) {
  return readFile(join(COMPLETION_DIR, type)).then(content => {
    console.log(content);
  });
}

export = helpConsole;
