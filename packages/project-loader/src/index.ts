import { readFile, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { runInit } from '@rokulab/brightscript-runtime';
import { parseManifest } from '@rokulab/manifest-parser';
import { parseSceneGraph } from '@rokulab/scenegraph';
import type { ProjectEntry, ProjectSnapshot } from '@rokulab/shared';

const allowedRoots = new Set(['source', 'components', 'images', 'fonts', 'locale']);

function within(root: string, relative: string): string {
  const resolved = path.resolve(root, relative);
  const prefix = root.endsWith(path.sep) ? root : `${root}${path.sep}`;
  if (resolved !== root && !resolved.startsWith(prefix))
    throw new Error(`Project path escapes the selected root: ${relative}`);
  return resolved;
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

function findFirst(entries: ProjectEntry[], suffix: string): string | undefined {
  for (const entry of entries) {
    if (entry.kind === 'file' && entry.path.endsWith(suffix)) return entry.path;
    const nested = entry.children && findFirst(entry.children, suffix);
    if (nested) return nested;
  }
  return undefined;
}

export async function loadProject(inputPath: string): Promise<ProjectSnapshot> {
  const rootPath = await realpath(path.resolve(inputPath));
  const manifest = parseManifest(await readFile(within(rootPath, 'manifest'), 'utf8'));
  const files = await tree(rootPath);
  const xmlPath = findFirst(files, '.xml');
  if (!xmlPath)
    return {
      rootPath,
      manifest,
      files,
      console: [],
      warnings: ['No SceneGraph XML component found'],
    };
  const parsed = parseSceneGraph(await readFile(within(rootPath, xmlPath), 'utf8'));
  const scriptUri = parsed.scriptUris[0]?.replace(/^pkg:\//, '');
  const runtime = scriptUri
    ? runInit(await readFile(within(rootPath, scriptUri), 'utf8'), parsed.scene, scriptUri)
    : { console: [], warnings: [] };
  return {
    rootPath,
    manifest,
    files,
    scene: parsed.scene,
    console: runtime.console,
    warnings: [...parsed.warnings, ...runtime.warnings],
  };
}
