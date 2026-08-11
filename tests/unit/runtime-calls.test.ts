import { describe, expect, it } from 'vitest';
import {
  correlateObserverCalls,
  formatRuntimeLocation,
  runtimeCallFromUpdate,
} from '../../apps/desktop/src/runtime-calls';

describe('runtime call correlation', () => {
  it('normalizes an emitted method call without treating arbitrary updates as calls', () => {
    expect(
      runtimeCallFromUpdate({
        id: 17,
        action: 'call',
        address: 'task:1',
        key: 'onPosterLoaded',
        type: 'task',
        value: {
          host: 'node:42',
          args: ['ready'],
          location: { file: 'pkg:/components/MainScene.brs', start: { line: 31, column: 8 } },
        },
      }),
    ).toEqual({
      id: 17,
      address: 'task:1',
      hostAddress: 'node:42',
      method: 'onPosterLoaded',
      type: 'task',
      args: ['ready'],
      location: { file: 'pkg:/components/MainScene.brs', line: 31, column: 8 },
    });
    expect(
      runtimeCallFromUpdate({
        action: 'set',
        address: 'node:42',
        key: 'text',
        type: 'node',
        value: 'ready',
      }),
    ).toBeUndefined();
  });

  it('correlates only calls whose handler and emitted node id both match', () => {
    const call = runtimeCallFromUpdate({
      action: 'call',
      address: 'task:1',
      key: 'onPosterLoaded',
      type: 'task',
      value: { host: 'node:42' },
    })!;
    const nodes = [
      {
        address: 'node:42',
        stableId: 'node:node:42',
        nodeId: 'poster',
        type: 'node',
        fields: {},
        updates: 1,
      },
    ];
    const observers = [
      {
        nodeId: 'poster',
        field: 'loadStatus',
        handler: 'onPosterLoaded',
        source: 'components/MainScene.brs',
        line: 14,
      },
      {
        nodeId: 'otherPoster',
        field: 'loadStatus',
        handler: 'onPosterLoaded',
        source: 'components/MainScene.brs',
        line: 15,
      },
    ];

    const correlated = correlateObserverCalls([call], nodes, observers);
    expect(correlated).toHaveLength(1);
    expect(correlated[0]?.observer).toMatchObject({ nodeId: 'poster', field: 'loadStatus' });
    expect(correlated[0]?.node?.address).toBe('node:42');
  });

  it('formats structured and missing source locations clearly', () => {
    expect(formatRuntimeLocation({ file: 'pkg:/source/main.brs', line: 9, column: 2 })).toBe(
      'pkg:/source/main.brs:9:2',
    );
    expect(formatRuntimeLocation()).toBe('source unavailable');
  });
});
