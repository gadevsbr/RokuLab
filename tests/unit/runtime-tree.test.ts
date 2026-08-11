import { describe, expect, it } from 'vitest';
import {
  applyRuntimeUpdate,
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
});
