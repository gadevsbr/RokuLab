import { describe, expect, it } from 'vitest';
import { findNode, parseSceneGraph } from '@rokulab/scenegraph';
import { runInit } from '@rokulab/brightscript-runtime';

const xml = `<component name="Demo" extends="Scene"><script uri="pkg:/components/Demo.brs"/><children><Group id="root"><Label id="title" text="Old" translation="10,20"/></Group></children></component>`;

describe('SceneGraph vertical slice', () => {
  it('parses nodes and resolves IDs', () => {
    const parsed = parseSceneGraph(xml);
    expect(findNode(parsed.scene, 'title')?.properties.translation).toEqual([10, 20]);
    expect(parsed.scriptUris).toEqual(['pkg:/components/Demo.brs']);
  });
  it('parses Roku bracketed translation arrays', () => {
    const parsed = parseSceneGraph(xml.replace('10,20', '[10,20]'));
    expect(findNode(parsed.scene, 'title')?.properties.translation).toEqual([10, 20]);
  });
  it('runs init print and literal field assignment', () => {
    const { scene } = parseSceneGraph(xml);
    const result = runInit(
      'sub init()\n print "ready"\n m.top.findNode("title").text = "New"\nend sub',
      scene,
    );
    expect(result.console[0]?.message).toBe('ready');
    expect(findNode(scene, 'title')?.properties.text).toBe('New');
  });
  it('groups unsupported BrightScript statements into source ranges', () => {
    const { scene } = parseSceneGraph(xml);
    const result = runInit(
      'sub init()\n unknownOne()\n unknownTwo()\n print "ok"\n unknownThree()\nend sub',
      scene,
      'Demo.brs',
    );
    expect(result.warnings).toEqual(['Unsupported BrightScript statements at Demo.brs:2-3, 5']);
  });
  it('groups repeated unsupported SceneGraph node types', () => {
    const parsed = parseSceneGraph(
      '<component name="Demo" extends="Scene"><children><Group><Video/><Video/></Group></children></component>',
    );
    expect(parsed.warnings).toEqual(['Video is not rendered in this alpha (2 nodes)']);
  });
});
