import { describe, expect, it } from 'vitest';
import {
  applyRuntimeUpdate,
  runtimeFocusChain,
  runtimeNodeBounds,
  runtimeNodeChildren,
  runtimeNodeLabel,
  visibleRuntimeFields,
} from '../../apps/desktop/src/runtime-tree';

describe('live runtime node correlation', () => {
  it('keeps a stable address identity when the component id arrives later', () => {
    let nodes = applyRuntimeUpdate([], {
      action: 'set',
      address: '0x00000042',
      key: 'text',
      type: 'node',
      value: 'Loading',
    });
    const stableId = nodes[0]!.stableId;
    nodes = applyRuntimeUpdate(nodes, {
      action: 'set',
      address: '0x00000042',
      key: 'id',
      type: 'node',
      value: 'title',
    });

    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({ stableId, nodeId: 'title', updates: 2 });
    expect(runtimeNodeLabel(nodes[0]!)).toBe('#title');
    expect(visibleRuntimeFields(nodes[0]!)).toEqual([['text', 'Loading']]);
  });

  it('applies field removal without discarding node history', () => {
    const created = applyRuntimeUpdate([], {
      action: 'set',
      address: 'scene-1',
      key: 'visible',
      type: 'scene',
      value: true,
    });
    const removed = applyRuntimeUpdate(created, {
      action: 'remove',
      address: 'scene-1',
      key: 'visible',
      type: 'scene',
      value: undefined,
    });

    expect(removed[0]).toMatchObject({ fields: {}, updates: 2 });
  });

  it('uses serialized child references for hierarchy and absolute bounds', () => {
    let nodes = applyRuntimeUpdate([], {
      action: 'set',
      address: 'scene',
      key: 'translation',
      type: 'scene',
      value: [100, 40],
    });
    nodes = applyRuntimeUpdate(nodes, {
      action: 'set',
      address: 'scene',
      key: 'children',
      type: 'scene',
      value: [
        {
          _node_: 'roSGNode:Label',
          _address_: 'label',
          id: 'headline',
          translation: [20, 10],
          width: 300,
          height: 50,
          _children_: [],
        },
      ],
    });

    const child = runtimeNodeChildren(nodes, 'scene')[0]!;
    expect(child).toMatchObject({ address: 'label', nodeId: 'headline', subtype: 'Label' });
    expect(runtimeNodeBounds(nodes, child)).toEqual({ x: 120, y: 50, width: 300, height: 50 });
  });

  it('does not invent parent relations for ordinary node-valued fields', () => {
    const nodes = applyRuntimeUpdate([], {
      action: 'set',
      address: 'scene',
      key: 'focusedChild',
      type: 'scene',
      value: { _node_: 'roSGNode:Button', _address_: 'button' },
    });

    expect(nodes.find(({ address }) => address === 'button')?.parentAddress).toBeUndefined();
  });

  it('rejects circular serialized child references', () => {
    const nodes = applyRuntimeUpdate([], {
      action: 'set',
      address: 'scene',
      key: 'children',
      type: 'scene',
      value: [
        {
          _node_: 'roSGNode:Group',
          _address_: 'group',
          _children_: [{ _circular_: 'roSGNode:Scene', _address_: 'scene' }],
        },
      ],
    });

    expect(nodes.find(({ address }) => address === 'scene')?.parentAddress).toBeUndefined();
    expect(nodes.find(({ address }) => address === 'group')?.parentAddress).toBe('scene');
  });

  it('follows focusedChild references without treating them as hierarchy', () => {
    let nodes = applyRuntimeUpdate([], {
      action: 'set',
      address: 'scene',
      key: 'focusedChild',
      type: 'scene',
      value: { _node_: 'roSGNode:Group', _address_: 'menu', id: 'menu' },
    });
    nodes = applyRuntimeUpdate(nodes, {
      action: 'set',
      address: 'menu',
      key: 'focusedChild',
      type: 'node',
      value: { _node_: 'roSGNode:Button', _address_: 'play', id: 'playButton' },
    });

    expect(runtimeFocusChain(nodes).map(({ address }) => address)).toEqual([
      'scene',
      'menu',
      'play',
    ]);
    expect(nodes.find(({ address }) => address === 'menu')?.parentAddress).toBeUndefined();
  });

  it('stops a circular focusedChild chain', () => {
    let nodes = applyRuntimeUpdate([], {
      action: 'set',
      address: 'scene',
      key: 'focusedChild',
      type: 'scene',
      value: { _node_: 'roSGNode:Button', _address_: 'button' },
    });
    nodes = applyRuntimeUpdate(nodes, {
      action: 'set',
      address: 'button',
      key: 'focusedChild',
      type: 'node',
      value: { _circular_: 'roSGNode:Scene', _address_: 'scene' },
    });

    expect(runtimeFocusChain(nodes)).toHaveLength(2);
  });
});
