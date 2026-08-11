import type { RuntimeObserver } from '@rokulab/shared';
import type { RuntimeFieldUpdate, RuntimeNode } from './runtime-tree';

export interface RuntimeSourceLocation {
  file: string;
  line?: number;
  column?: number;
}

export interface RuntimeCall {
  id?: number;
  address: string;
  hostAddress: string;
  method: string;
  type: string;
  args: unknown[];
  location?: RuntimeSourceLocation;
}

export interface CorrelatedObserverCall {
  call: RuntimeCall;
  observer: RuntimeObserver;
  node?: RuntimeNode;
}

function nonEmptyString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function sourceLocation(value: unknown): RuntimeSourceLocation | undefined {
  if (typeof value === 'string' && value.trim()) return { file: value.trim() };
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const file = nonEmptyString(record.file);
  if (!file) return undefined;
  const start =
    record.start && typeof record.start === 'object' && !Array.isArray(record.start)
      ? (record.start as Record<string, unknown>)
      : undefined;
  const line = Number(start?.line);
  const column = Number(start?.column);
  return {
    file,
    ...(Number.isFinite(line) ? { line } : {}),
    ...(Number.isFinite(column) ? { column } : {}),
  };
}

export function runtimeCallFromUpdate(
  update: RuntimeFieldUpdate & { id?: number },
): RuntimeCall | undefined {
  if (update.action.toLowerCase() !== 'call') return undefined;
  if (!update.value || typeof update.value !== 'object' || Array.isArray(update.value))
    return undefined;
  const payload = update.value as Record<string, unknown>;
  const hostAddress = nonEmptyString(payload.host);
  if (!hostAddress) return undefined;
  const location = sourceLocation(payload.location);
  return {
    ...(typeof update.id === 'number' ? { id: update.id } : {}),
    address: update.address,
    hostAddress,
    method: update.key,
    type: update.type,
    args: Array.isArray(payload.args) ? payload.args : [],
    ...(location ? { location } : {}),
  };
}

export function correlateObserverCalls(
  calls: readonly RuntimeCall[],
  nodes: readonly RuntimeNode[],
  observers: readonly RuntimeObserver[],
): CorrelatedObserverCall[] {
  return calls.flatMap((call) => {
    const node = nodes.find(
      ({ address }) => address === call.hostAddress || address === call.address,
    );
    const method = call.method.toLowerCase();
    const matches = observers.filter(
      (observer) =>
        observer.handler.toLowerCase() === method &&
        Boolean(node?.nodeId) &&
        observer.nodeId.toLowerCase() === node?.nodeId?.toLowerCase(),
    );
    return matches.map((observer) => ({ call, observer, ...(node ? { node } : {}) }));
  });
}

export function formatRuntimeLocation(location?: RuntimeSourceLocation): string {
  if (!location) return 'source unavailable';
  if (location.line === undefined) return location.file;
  return `${location.file}:${location.line}${
    location.column === undefined ? '' : `:${location.column}`
  }`;
}
