import { XMLParser } from 'fast-xml-parser';
import type { SceneNodeData } from '@rokulab/shared';

export class SceneGraphParseError extends Error {
  override name = 'SceneGraphParseError';
}

const supported = new Set(['Scene', 'Group', 'Rectangle', 'Label', 'Poster', 'Button']);
const arrayFields = new Set(['translation', 'scale']);

export type FocusDirection = 'up' | 'down' | 'left' | 'right';

export interface FocusTarget {
  id: string;
  x: number;
  y: number;
}

function valueOf(key: string, value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (arrayFields.has(key))
    return value
      .replace(/^\s*\[/, '')
      .replace(/\]\s*$/, '')
      .split(',')
      .map((part) => Number(part.trim()));
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

export function parseComponentDescriptor(xml: string): {
  name?: string;
  extends?: string;
} {
  try {
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
    const component = (parser.parse(xml) as { component?: Record<string, unknown> }).component;
    if (!component) throw new SceneGraphParseError('XML does not contain a component');
    const name = component['@_name'];
    const extended = component['@_extends'];
    return {
      ...(typeof name === 'string' ? { name } : {}),
      ...(typeof extended === 'string' ? { extends: extended } : {}),
    };
  } catch (error) {
    if (error instanceof SceneGraphParseError) throw error;
    throw new SceneGraphParseError(error instanceof Error ? error.message : String(error));
  }
}

function convert(entry: Record<string, unknown>): SceneNodeData {
  const type = Object.keys(entry).find((key) => key !== ':@');
  if (!type) throw new SceneGraphParseError('SceneGraph node has no type');
  const content = (entry[type] ?? []) as Array<Record<string, unknown>>;
  const attributes = (entry[':@'] ?? {}) as Record<string, unknown>;
  const children: SceneNodeData[] = [];
  for (const child of content) {
    const childType = Object.keys(child).find((key) => key !== ':@');
    if (childType && childType !== 'script' && childType !== 'interface')
      children.push(convert(child));
  }
  const properties = Object.fromEntries(
    Object.entries(attributes)
      .filter(([key]) => !['id', 'focusable'].includes(key.replace(/^@_/, '')))
      .map(([key, value]) => [key.replace(/^@_/, ''), valueOf(key.replace(/^@_/, ''), value)]),
  );
  const id = attributes['@_id'];
  return {
    ...(typeof id === 'string' ? { id } : {}),
    type,
    properties,
    children,
    focusable: attributes['@_focusable'] === 'true' || type === 'Button',
  };
}

export function parseSceneGraph(xml: string): {
  scene: SceneNodeData;
  warnings: string[];
  scriptUris: string[];
} {
  try {
    const parser = new XMLParser({
      ignoreAttributes: false,
      preserveOrder: true,
      attributeNamePrefix: '@_',
    });
    const ordered = parser.parse(xml) as Array<Record<string, unknown>>;
    const component = ordered.find((entry) => 'component' in entry)?.component as
      | Array<Record<string, unknown>>
      | undefined;
    if (!component) throw new SceneGraphParseError('XML does not contain a component');
    const root = component.find((entry) => 'children' in entry)?.children as
      | Array<Record<string, unknown>>
      | undefined;
    const first = root?.find((entry) => Object.keys(entry).some((key) => key !== ':@'));
    if (!first) throw new SceneGraphParseError('Component has no SceneGraph children');
    const scene = convert(first);
    const unsupportedCounts = new Map<string, number>();
    const visit = (node: SceneNodeData) => {
      if (!supported.has(node.type))
        unsupportedCounts.set(node.type, (unsupportedCounts.get(node.type) ?? 0) + 1);
      node.children.forEach(visit);
    };
    visit(scene);
    const warnings = [...unsupportedCounts].map(([type, count]) =>
      count === 1
        ? `${type} is not rendered in this alpha`
        : `${type} is not rendered in this alpha (${count} nodes)`,
    );
    const scripts = component
      .filter((entry) => 'script' in entry)
      .map((entry) => (entry[':@'] as Record<string, string> | undefined)?.['@_uri'])
      .filter((uri): uri is string => Boolean(uri));
    return { scene, warnings, scriptUris: scripts };
  } catch (error) {
    if (error instanceof SceneGraphParseError) throw error;
    throw new SceneGraphParseError(error instanceof Error ? error.message : String(error));
  }
}

export function findNode(root: SceneNodeData, id: string): SceneNodeData | undefined {
  if (root.id === id) return root;
  for (const child of root.children) {
    const found = findNode(child, id);
    if (found) return found;
  }
  return undefined;
}

export function collectFocusTargets(root: SceneNodeData, parentX = 0, parentY = 0): FocusTarget[] {
  const translation = root.properties.translation;
  const x =
    parentX +
    (Array.isArray(translation) && typeof translation[0] === 'number' ? translation[0] : 0);
  const y =
    parentY +
    (Array.isArray(translation) && typeof translation[1] === 'number' ? translation[1] : 0);
  if (root.properties.visible === false) return [];
  const width = typeof root.properties.width === 'number' ? root.properties.width : 0;
  const height = typeof root.properties.height === 'number' ? root.properties.height : 0;
  return [
    ...(root.focusable && root.id ? [{ id: root.id, x: x + width / 2, y: y + height / 2 }] : []),
    ...root.children.flatMap((child) => collectFocusTargets(child, x, y)),
  ];
}

export function nextFocusTarget(
  targets: FocusTarget[],
  currentId: string | undefined,
  direction: FocusDirection,
): string | undefined {
  if (targets.length === 0) return undefined;
  const current = targets.find(({ id }) => id === currentId) ?? targets[0]!;
  const ranked = targets
    .filter(({ id }) => id !== current.id)
    .map((target) => {
      const dx = target.x - current.x;
      const dy = target.y - current.y;
      const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
      const perpendicular =
        direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
      const eligible =
        (direction === 'left' && dx < 0) ||
        (direction === 'right' && dx > 0) ||
        (direction === 'up' && dy < 0) ||
        (direction === 'down' && dy > 0);
      return { target, eligible, score: primary + perpendicular * 2 };
    })
    .filter(({ eligible }) => eligible)
    .sort((left, right) => left.score - right.score);
  return ranked[0]?.target.id ?? current.id;
}
