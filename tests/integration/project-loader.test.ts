import { describe, expect, it } from 'vitest';
import path from 'node:path';
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { loadProject } from '@rokulab/project-loader';

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
});
