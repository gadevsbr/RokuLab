import { describe, expect, it } from 'vitest';
import {
  collectFocusTargets,
  findNode,
  nextFocusTarget,
  parseSceneGraph,
} from '@rokulab/scenegraph';
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
    expect(result.observers).toEqual([]);
  });
  it('executes linear bind routines and records observers', () => {
    const { scene } = parseSceneGraph(xml);
    const result = runInit(
      'sub init()\n bindNodes()\n bindObservers()\nend sub\n' +
        'sub bindNodes()\n m.title = m.top.FindNode("title")\nend sub\n' +
        'sub bindObservers()\n m.title.ObserveField("text", "onTitleChanged")\nend sub',
      scene,
      'Demo.brs',
    );
    expect(result.warnings).toEqual([]);
    expect(result.observers).toEqual([
      {
        nodeId: 'title',
        field: 'text',
        handler: 'onTitleChanged',
        source: 'Demo.brs',
        line: 9,
      },
    ]);
  });
  it('does not execute routines containing control flow', () => {
    const { scene } = parseSceneGraph(xml);
    const result = runInit(
      'sub init()\n conditionalWork()\nend sub\nsub conditionalWork()\n if true\n  print "wrong"\n end if\nend sub',
      scene,
    );
    expect(result.console).toEqual([]);
    expect(result.warnings).toEqual(['Unsupported BrightScript statements at component.brs:2']);
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
  it('moves focus geometrically using accumulated translations', () => {
    const parsed = parseSceneGraph(
      '<component name="Focus" extends="Scene"><children><Group translation="100,50"><Button id="topLeft" translation="0,0"/><Button id="topRight" translation="200,0"/><Button id="bottomLeft" translation="0,200"/><Button id="hidden" visible="false" translation="200,200"/></Group></children></component>',
    );
    const targets = collectFocusTargets(parsed.scene);
    expect(targets).toEqual([
      { id: 'topLeft', x: 100, y: 50 },
      { id: 'topRight', x: 300, y: 50 },
      { id: 'bottomLeft', x: 100, y: 250 },
    ]);
    expect(nextFocusTarget(targets, 'topLeft', 'right')).toBe('topRight');
    expect(nextFocusTarget(targets, 'topLeft', 'down')).toBe('bottomLeft');
    expect(nextFocusTarget(targets, 'bottomLeft', 'right')).toBe('topRight');
  });
});
