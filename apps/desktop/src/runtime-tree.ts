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
  type: string;
  fields: Record<string, unknown>;
  updates: number;
}

const identityFields = new Set(['id', 'subtype']);

function identityValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
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
  if (index < 0) return [...nodes, node];
  return nodes.map((entry, entryIndex) => (entryIndex === index ? node : entry));
}

export function runtimeNodeLabel(node: RuntimeNode): string {
  if (node.nodeId) return `#${node.nodeId}`;
  if (node.subtype) return node.subtype;
  return `${node.type} ${node.address.slice(-8)}`;
}

export function visibleRuntimeFields(node: RuntimeNode): Array<[string, unknown]> {
  return Object.entries(node.fields).filter(([key]) => !identityFields.has(key.toLowerCase()));
}
