import { copyFile, existsSync, mkdirs, rmdir, unlink } from 'hexo-fs';
import spawn from 'hexo-util/dist/spawn';
import { basename, join } from 'path';
import { sync as commandExistsSync } from 'command-exists';
import type Context from '../context';

const REGISTRY_URL = 'https://api.github.com/repos/hexojs/site/contents/source/_data/themes';

interface ThemeArgs {
  _: string[];
}

interface ThemeRegistryResponse {
  content: string;
}

interface RegistryResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

async function themeConsole(this: Context, args: ThemeArgs) {
  const [command, themeName, ...extraArgs] = args._;

  if ((command !== 'install' && command !== 'uninstall') || !themeName || extraArgs.length) {
    throw new Error('Usage: hexo theme <install|uninstall> <theme-name>');
  }

  if (themeName !== basename(themeName) || themeName === '.' || themeName === '..') {
    throw new Error('Theme name must not contain a path.');
  }

  if (command === 'uninstall') {
    await uninstallTheme(this, themeName);
    return;
  }

  const target = join(this.base_dir, 'themes', themeName);
  if (existsSync(target)) {
    throw new Error(`Theme directory already exists: ${target}`);
  }

  if (!commandExistsSync('git')) {
    throw new Error('Git is required to install themes. Please install Git and try again.');
  }

  const repository = await getThemeRepository(themeName);
  const themesDir = join(this.base_dir, 'themes');

  await mkdirs(themesDir);
  this.log.info('Installing theme %s', themeName);

  try {
    await spawn('git', ['clone', '--depth=1', '--quiet', repository, target], {
      stdio: 'inherit'
    });

    await installThemeDependencies(this.base_dir, target);
    await copyThemeConfig(this, themeName, target);
  } catch (err) {
    await removeThemeDirectory(target);
    throw err;
  }

  this.log.info('Theme %s installed in %s', themeName, target);
  this.log.info('Set `theme: %s` in _config.yml to use it.', themeName);
}

async function getThemeRepository(themeName: string) {
  const response = await fetchThemeRegistry(themeName);

  if (response.status === 404) {
    throw new Error(`Theme "${themeName}" is not listed in the official Hexo theme registry.`);
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch the official Hexo theme registry (HTTP ${response.status}).`);
  }

  const payload = await response.json() as ThemeRegistryResponse;
  const metadata = Buffer.from(payload.content, 'base64').toString('utf8');
  const link = metadata.split(/\r?\n/u).find(line => line.startsWith('link:'))!;

  return link.slice('link:'.length).trim();
}

async function fetchThemeRegistry(themeName: string): Promise<RegistryResponse> {
  try {
    // fetch is stable in supported Node.js versions, but eslint-plugin-n still marks it as experimental before Node 21.
    // eslint-disable-next-line n/no-unsupported-features/node-builtins
    return await fetch(`${REGISTRY_URL}/${encodeURIComponent(themeName)}.yml`, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'hexo-cli'
      }
    });
  } catch {
    throw new Error('Failed to fetch the official Hexo theme registry.');
  }
}

async function installThemeDependencies(baseDir: string, target: string) {
  if (!existsSync(join(target, 'package.json'))) return;

  const packageManager = findPackageManager(baseDir);
  if (!commandExistsSync(packageManager)) {
    throw new Error(`${packageManager} is required to install theme dependencies. Please install it and try again.`);
  }

  let args: string[];
  if (packageManager === 'pnpm') {
    args = ['install', '--prod'];
  } else if (packageManager === 'yarn') {
    args = ['install', '--production'];
  } else {
    args = ['install', '--omit=dev'];
  }

  await spawn(packageManager, args, {
    cwd: target,
    stdio: 'inherit'
  });
}

async function copyThemeConfig(ctx: Context, themeName: string, target: string) {
  const source = join(target, '_config.yml');
  const destination = join(ctx.base_dir, `_config.${themeName}.yml`);

  if (!existsSync(source)) {
    ctx.log.warn('Theme %s does not provide _config.yml; no theme config was created.', themeName);
    return;
  }

  if (existsSync(destination)) {
    ctx.log.warn('Theme config already exists at %s; keeping the existing file.', destination);
    return;
  }

  await copyFile(source, destination);
  ctx.log.info('Theme config copied to %s', destination);
}

async function uninstallTheme(ctx: Context, themeName: string) {
  const target = join(ctx.base_dir, 'themes', themeName);
  const config = join(ctx.base_dir, `_config.${themeName}.yml`);
  const hasTheme = existsSync(target);
  const hasConfig = existsSync(config);

  if (!hasTheme && !hasConfig) {
    throw new Error(`Theme "${themeName}" is not installed.`);
  }

  if (hasTheme) await rmdir(target);
  if (hasConfig) await unlink(config);

  ctx.log.info('Theme %s uninstalled.', themeName);
}

function findPackageManager(baseDir: string) {
  if (existsSync(join(baseDir, 'pnpm-lock.yaml'))) return 'pnpm';
  if (existsSync(join(baseDir, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

async function removeThemeDirectory(target: string) {
  if (!existsSync(target)) return;
  await rmdir(target);
}

export = themeConsole;
