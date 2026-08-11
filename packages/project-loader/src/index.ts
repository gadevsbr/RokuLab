import { lstat, readFile, readdir, realpath, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { zipSync } from 'fflate';
import { runInit } from '@rokulab/brightscript-runtime';
import { parseManifest } from '@rokulab/manifest-parser';
import { parseComponentDescriptor, parseSceneGraph } from '@rokulab/scenegraph';
import type { ProjectEntry, ProjectFileContent, ProjectSnapshot } from '@rokulab/shared';

const allowedRoots = new Set(['source', 'components', 'images', 'fonts', 'locale']);
const editableExtensions = new Set(['.brs', '.xml', '.json', '.txt']);
const maximumSourceBytes = 1024 * 1024;
const maximumArchiveBytes = 128 * 1024 * 1024;

function within(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(prefix))
    throw new Error(`Project path escapes the selected root: ${relative}`);
  return resolved;
}

function assertProjectFile(relative: string): void {
  const normalized = relative.replaceAll('\\', '/');
  const first = normalized.split('/')[0];
  if (normalized !== 'manifest' && (!first || !allowedRoots.has(first))) {
    throw new Error(`File is outside the readable project areas: ${relative}`);
  }
}

async function safeExistingFile(root: string, relative: string): Promise<string> {
  assertProjectFile(relative);
  const candidate = within(root, relative);
  if ((await lstat(candidate)).isSymbolicLink())
    throw new Error('Symbolic-link files are not supported');
  const resolved = await realpath(candidate);
  within(root, path.relative(root, resolved));
  const details = await stat(resolved);
  if (!details.isFile()) throw new Error('The selected path is not a file');
  if (details.size > maximumSourceBytes) throw new Error('Source files are limited to 1 MiB');
  return resolved;
}

function languageFor(relative: string): ProjectFileContent['language'] {
  if (relative.endsWith('.brs')) return 'brightscript';
  if (relative.endsWith('.xml')) return 'xml';
  if (relative.endsWith('.json')) return 'json';
  return 'plaintext';
}

export async function readProjectFile(
  rootInput: string,
  relative: string,
): Promise<ProjectFileContent> {
  const root = await realpath(path.resolve(rootInput));
  const file = await safeExistingFile(root, relative);
  return {
    path: relative.replaceAll('\\', '/'),
    content: await readFile(file, 'utf8'),
    language: languageFor(relative),
  };
}

export async function writeProjectFile(
  rootInput: string,
  relative: string,
  content: string,
): Promise<ProjectFileContent> {
  if (typeof content !== 'string' || Buffer.byteLength(content, 'utf8') > maximumSourceBytes)
    throw new Error('Source files are limited to 1 MiB');
  if (relative !== 'manifest' && !editableExtensions.has(path.extname(relative).toLowerCase()))
    throw new Error('This file type is read-only');
  const root = await realpath(path.resolve(rootInput));
  const file = await safeExistingFile(root, relative);
  await writeFile(file, content, 'utf8');
  return { path: relative.replaceAll('\\', '/'), content, language: languageFor(relative) };
}

export async function archiveProject(rootInput: string): Promise<Uint8Array> {
  const root = await realpath(path.resolve(rootInput));
  const files = findAll(await tree(root), '');
  const archive: Record<string, Uint8Array> = {};
  let total = 0;
  for (const relative of files) {
    assertProjectFile(relative);
    const candidate = within(root, relative);
    if ((await lstat(candidate)).isSymbolicLink()) continue;
    const resolved = await realpath(candidate);
    within(root, path.relative(root, resolved));
    const details = await stat(resolved);
    if (!details.isFile()) continue;
    total += details.size;
    if (total > maximumArchiveBytes) throw new Error('Project archive is limited to 128 MiB');
    archive[relative] = new Uint8Array(await readFile(resolved));
  }
  return zipSync(archive, { level: 6 });
}

async function tree(root: string, current = ''): Promise<ProjectEntry[]> {
  const absolute = path.join(root, current);
  const entries = await readdir(absolute, { withFileTypes: true });
  const result: ProjectEntry[] = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (current === '' && entry.name !== 'manifest' && !allowedRoots.has(entry.name)) continue;
    const relative = path.join(current, entry.name).replaceAll('\\', '/');
    if (entry.isSymbolicLink()) continue;
    result.push({
      name: entry.name,
      path: relative,
      kind: entry.isDirectory() ? 'directory' : 'file',
      ...(entry.isDirectory() ? { children: await tree(root, relative) } : {}),
    });
  }
  return result;
}

function findAll(entries: ProjectEntry[], suffix: string): string[] {
  return entries.flatMap((entry) => [
    ...(entry.kind === 'file' && entry.path.toLowerCase().endsWith(suffix) ? [entry.path] : []),
    ...(entry.children ? findAll(entry.children, suffix) : []),
  ]);
}

async function entrySceneName(rootPath: string): Promise<string | undefined> {
  try {
    const main = await readFile(within(rootPath, 'source/main.brs'), 'utf8');
    return /CreateScene\s*\(\s*["']([^"']+)["']\s*\)/i.exec(main)?.[1];
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === 'ENOENT') return undefined;
    throw error;
  }
}

async function selectSceneGraph(
  rootPath: string,
  files: ProjectEntry[],
): Promise<string | undefined> {
  const candidates = await Promise.all(
    findAll(files, '.xml').map(async (relative) => {
      const xml = await readFile(within(rootPath, relative), 'utf8');
      return { relative, descriptor: parseComponentDescriptor(xml) };
    }),
  );
  const requested = await entrySceneName(rootPath);
  if (requested) {
    const match = candidates.find(({ descriptor }) => descriptor.name === requested);
    if (!match) throw new Error(`Entry SceneGraph component "${requested}" was not found`);
    return match.relative;
  }
  return candidates.find(({ descriptor }) => descriptor.extends?.toLowerCase() === 'scene')
    ?.relative;
}

export async function loadProject(inputPath: string): Promise<ProjectSnapshot> {
  const rootPath = await realpath(path.resolve(inputPath));
  const manifest = parseManifest(await readFile(within(rootPath, 'manifest'), 'utf8'));
  const files = await tree(rootPath);
  const xmlPath = await selectSceneGraph(rootPath, files);
  if (!xmlPath)
    return {
      rootPath,
      manifest,
      files,
      console: [],
      warnings: ['No SceneGraph XML component found'],
      observers: [],
      events: [],
    };
  const parsed = parseSceneGraph(await readFile(within(rootPath, xmlPath), 'utf8'));
  const scriptUri = parsed.scriptUris[0]?.replace(/^pkg:\//, '');
  const runtime = scriptUri
    ? runInit(await readFile(within(rootPath, scriptUri), 'utf8'), parsed.scene, scriptUri)
    : { console: [], warnings: [], observers: [], events: [] };
  return {
    rootPath,
    manifest,
    files,
    scene: parsed.scene,
    console: runtime.console,
    warnings: [...parsed.warnings, ...runtime.warnings],
    observers: runtime.observers,
    events: runtime.events,
  };
}
