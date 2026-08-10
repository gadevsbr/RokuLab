import { XMLParser } from 'fast-xml-parser';
import type { SceneNodeData } from '@rokulab/shared';

export class SceneGraphParseError extends Error {
  override name = 'SceneGraphParseError';
}

const supported = new Set(['Scene', 'Group', 'Rectangle', 'Label', 'Poster', 'Button']);
const arrayFields = new Set(['translation', 'scale']);

function valueOf(key: string, value: unknown): unknown {
  if (typeof value !== 'string') return value;
  if (arrayFields.has(key)) return value.split(',').map((part) => Number(part.trim()));
  if (value === 'true' || value === 'false') return value === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
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
    const warnings: string[] = [];
    const visit = (node: SceneNodeData) => {
      if (!supported.has(node.type)) warnings.push(`${node.type} is not rendered in this alpha`);
      node.children.forEach(visit);
    };
    visit(scene);
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
