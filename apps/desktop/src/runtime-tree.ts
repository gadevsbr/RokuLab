export interface RuntimeFieldUpdate {
  action: string;
  address: string;
  key: string;
  type: string;
  value: unknown;
}

export interface RuntimeNode {
  address: string;
  stableId: string;
  nodeId?: string;
  subtype?: string;
  parentAddress?: string;
  type: string;
  fields: Record<string, unknown>;
  updates: number;
}

export interface RuntimeBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

const identityFields = new Set(['id', 'subtype']);

function identityValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function serializedNode(
  value: unknown,
): { address: string; type: string; subtype: string; value: Record<string, unknown> } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const record = value as Record<string, unknown>;
  const address = identityValue(record._address_);
  const signature = identityValue(record._node_) ?? identityValue(record._circular_);
  if (!address || !signature) return undefined;
  const separator = signature.indexOf(':');
  return {
    address,
    type: separator >= 0 ? signature.slice(0, separator).trim() : 'node',
    subtype: separator >= 0 ? signature.slice(separator + 1).trim() : signature,
    value: record,
  };
}

function mergeSerializedNodes(
  nodes: RuntimeNode[],
  value: unknown,
  parentAddress?: string,
  ancestors: ReadonlySet<string> = new Set(),
): RuntimeNode[] {
  if (Array.isArray(value))
    return value.reduce(
      (current, child) => mergeSerializedNodes(current, child, parentAddress, ancestors),
      nodes,
    );
  const serialized = serializedNode(value);
  if (!serialized) return nodes;
  if (ancestors.has(serialized.address)) return nodes;
  const index = nodes.findIndex(({ address }) => address === serialized.address);
  const current = index >= 0 ? nodes[index]! : undefined;
  const nodeId = identityValue(serialized.value.id) ?? current?.nodeId;
  const serializedFields = Object.fromEntries(
    Object.entries(serialized.value).filter(([key]) => !key.startsWith('_')),
  );
  const node: RuntimeNode = {
    address: serialized.address,
    stableId: current?.stableId ?? `${serialized.type}:${serialized.address}`,
    ...(nodeId ? { nodeId } : {}),
    ...(serialized.subtype ? { subtype: serialized.subtype } : {}),
    ...(parentAddress
      ? { parentAddress }
      : current?.parentAddress
        ? { parentAddress: current.parentAddress }
        : {}),
    type: serialized.type,
    fields: { ...serializedFields, ...(current?.fields ?? {}) },
    updates: current?.updates ?? 0,
  };
  const merged =
    index < 0 ? [...nodes, node] : nodes.map((entry, item) => (item === index ? node : entry));
  return mergeSerializedNodes(
    merged,
    serialized.value._children_,
    serialized.address,
    new Set([...ancestors, serialized.address]),
  );
}

export function applyRuntimeUpdate(
  nodes: readonly RuntimeNode[],
  update: RuntimeFieldUpdate,
): RuntimeNode[] {
  const index = nodes.findIndex(({ address }) => address === update.address);
  const current = index >= 0 ? nodes[index]! : undefined;
  const key = update.key.toLowerCase();
  const nodeId = key === 'id' ? identityValue(update.value) : current?.nodeId;
  const subtype = key === 'subtype' ? identityValue(update.value) : current?.subtype;
  const fields = { ...(current?.fields ?? {}) };
  if (update.action === 'delete' || update.action === 'remove') delete fields[update.key];
  else fields[update.key] = update.value;

  const node: RuntimeNode = {
    address: update.address,
    stableId: current?.stableId ?? `${update.type}:${update.address}`,
    ...(nodeId ? { nodeId } : {}),
    ...(subtype ? { subtype } : {}),
    type: update.type,
    fields,
    updates: (current?.updates ?? 0) + 1,
  };
  let merged =
    index < 0
      ? [...nodes, node]
      : nodes.map((entry, entryIndex) => (entryIndex === index ? node : entry));
  const relationParent = ['children', '_children_', 'childnodes'].includes(key)
    ? update.address
    : undefined;
  merged = mergeSerializedNodes(
    merged,
    update.value,
    relationParent,
    relationParent ? new Set([relationParent]) : new Set(),
  );
  return merged;
}

export function runtimeNodeChildren(nodes: readonly RuntimeNode[], parent?: string): RuntimeNode[] {
  return nodes.filter(({ parentAddress }) => parentAddress === parent);
}

export function runtimeNodeBounds(
  nodes: readonly RuntimeNode[],
  node: RuntimeNode,
): RuntimeBounds | undefined {
  const width = Number(node.fields.width);
  const height = Number(node.fields.height);
  if (!Number.isFinite(width) || !Number.isFinite(height)) return undefined;
  const translation = Array.isArray(node.fields.translation) ? node.fields.translation : [];
  let x = Number(translation[0]) || 0;
  let y = Number(translation[1]) || 0;
  const visited = new Set([node.address]);
  let parent = nodes.find(({ address }) => address === node.parentAddress);
  while (parent && !visited.has(parent.address)) {
    visited.add(parent.address);
    const parentTranslation = Array.isArray(parent.fields.translation)
      ? parent.fields.translation
      : [];
    x += Number(parentTranslation[0]) || 0;
    y += Number(parentTranslation[1]) || 0;
    parent = nodes.find(({ address }) => address === parent?.parentAddress);
  }
  return { x, y, width, height };
}

export function runtimeNodeLabel(node: RuntimeNode): string {
  if (node.nodeId) return `#${node.nodeId}`;
  if (node.subtype) return node.subtype;
  return `${node.type} ${node.address.slice(-8)}`;
}

export function visibleRuntimeFields(node: RuntimeNode): Array<[string, unknown]> {
  return Object.entries(node.fields).filter(([key]) => !identityFields.has(key.toLowerCase()));
}
