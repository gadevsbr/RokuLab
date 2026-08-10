import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { loadProject, readProjectFile, writeProjectFile } from '@rokulab/project-loader';

describe('hello-world fixture', () => {
  it('loads a runnable project snapshot', async () => {
    const project = await loadProject(path.resolve('examples/hello-world'));
    expect(project.manifest.title).toBe('RokuLab Hello World');
    expect(project.scene?.type).toBe('Rectangle');
    expect(project.console.some((entry) => entry.message === 'Hello from BrightScript')).toBe(true);
  });
  it('rejects script URIs that escape the project', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'rokulab-'));
    await mkdir(path.join(root, 'components'));
    await writeFile(path.join(root, 'manifest'), 'title=Unsafe');
    await writeFile(
      path.join(root, 'components', 'Scene.xml'),
      '<component name="Scene" extends="Scene"><script uri="pkg:/../outside.brs"/><children><Scene/></children></component>',
    );
    await expect(loadProject(root)).rejects.toThrow('escapes the selected root');
  });
  it('loads the component named by CreateScene instead of the first XML file', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'rokulab-entry-scene-'));
    await mkdir(path.join(root, 'source'));
    await mkdir(path.join(root, 'components'));
    await writeFile(path.join(root, 'manifest'), 'title=Multi component');
    await writeFile(
      path.join(root, 'source', 'main.brs'),
      'sub Main()\n screen.CreateScene("MainScene")\nend sub',
    );
    await writeFile(
      path.join(root, 'components', 'ApiTask.xml'),
      '<component name="ApiTask" extends="Task"><interface/></component>',
    );
    await writeFile(
      path.join(root, 'components', 'MainScene.xml'),
      '<component name="MainScene" extends="Scene"><children><Group id="main"/></children></component>',
    );
    const project = await loadProject(root);
    expect(project.scene?.id).toBe('main');
  });
  it('reads and explicitly saves editable project files', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'rokulab-edit-'));
    await mkdir(path.join(root, 'source'));
    await writeFile(path.join(root, 'manifest'), 'title=Editable');
    await writeFile(path.join(root, 'source', 'main.brs'), 'sub Main()\nend sub');
    const opened = await readProjectFile(root, 'source/main.brs');
    expect(opened.language).toBe('brightscript');
    await writeProjectFile(root, 'source/main.brs', 'sub Main()\n print "saved"\nend sub');
    expect((await readProjectFile(root, 'source/main.brs')).content).toContain('saved');
  });
  it('blocks hidden areas, traversal, unsupported writes, and oversized content', async () => {
    const root = await mkdtemp(path.join(tmpdir(), 'rokulab-safe-edit-'));
    await mkdir(path.join(root, 'source'));
    await writeFile(path.join(root, 'manifest'), 'title=Safe');
    await writeFile(path.join(root, 'secret.txt'), 'secret');
    await writeFile(path.join(root, 'source', 'asset.png'), 'not an image');
    await expect(readProjectFile(root, 'secret.txt')).rejects.toThrow('outside the readable');
    await expect(readProjectFile(root, '../outside.txt')).rejects.toThrow('outside the readable');
    await expect(writeProjectFile(root, 'source/asset.png', 'data')).rejects.toThrow('read-only');
    await expect(writeProjectFile(root, 'manifest', 'x'.repeat(1024 * 1024 + 1))).rejects.toThrow(
      '1 MiB',
    );
  });
});
