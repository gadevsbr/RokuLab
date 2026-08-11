import { findNode } from '@rokulab/scenegraph';
import type { ConsoleEntry, RuntimeEvent, RuntimeObserver, SceneNodeData } from '@rokulab/shared';

export interface RuntimeResult {
  console: ConsoleEntry[];
  warnings: string[];
  observers: RuntimeObserver[];
  events: RuntimeEvent[];
}

interface Routine {
  start: number;
  end: number;
  hasLoop: boolean;
}

function lineRanges(lines: number[]): string {
  lines = [...new Set(lines)].sort((left, right) => left - right);
  const ranges: string[] = [];
  let start = lines[0];
  let end = start;
  for (const line of lines.slice(1)) {
    if (end !== undefined && line === end + 1) {
      end = line;
      continue;
    }
    if (start !== undefined) ranges.push(start === end ? `${start}` : `${start}-${end}`);
    start = line;
    end = line;
  }
  if (start !== undefined) ranges.push(start === end ? `${start}` : `${start}-${end}`);
  return ranges.join(', ');
}

function equal(left: unknown, right: unknown): boolean {
  if (left === undefined && right === undefined) return true;
  return left === right;
}

export function runInit(
  source: string,
  scene: SceneNodeData,
  sourceName = 'component.brs',
): RuntimeResult {
  const console: ConsoleEntry[] = [];
  const warnings: string[] = [];
  const observers: RuntimeObserver[] = [];
  const events: RuntimeEvent[] = [];
  const unsupportedLines: number[] = [];
  const lines = source.split(/\r?\n/);
  const routines = new Map<string, Routine>();
  for (let index = 0; index < lines.length; index += 1) {
    const declaration = lines[index]?.match(/^\s*(sub|function)\s+([A-Za-z]\w*)\s*\([^)]*\)/i);
    if (!declaration) continue;
    const end = lines.findIndex(
      (line, candidate) => candidate > index && /^\s*end\s+(sub|function)\s*$/i.test(line),
    );
    if (end < 0) continue;
    routines.set(declaration[2]!.toLowerCase(), {
      start: index,
      end,
      hasLoop: lines
        .slice(index + 1, end)
        .some((line) => /^\s*(for|while|end\s+(for|while))\b/i.test(line)),
    });
    index = end;
  }

  const variables = new Map<string, unknown>();
  const activeRoutines = new Set<string>();
  const dispatching = new Set<string>();

  const valueOf = (raw: string): { supported: boolean; value: unknown } => {
    const value = raw.trim();
    if (/^".*"$/.test(value))
      return { supported: true, value: value.slice(1, -1).replace(/""/g, '"') };
    if (/^(true|false)$/i.test(value))
      return { supported: true, value: value.toLowerCase() === 'true' };
    if (/^invalid$/i.test(value)) return { supported: true, value: undefined };
    if (/^-?\d+(\.\d+)?$/.test(value)) return { supported: true, value: Number(value) };
    if (/^\[\s*\]$/.test(value)) return { supported: true, value: [] };
    const nodeField = value.match(/^m\.([A-Za-z]\w*)\.([A-Za-z]\w*)$/i);
    if (nodeField) {
      const owner = variables.get(nodeField[1]!.toLowerCase());
      if (owner && typeof owner === 'object' && 'type' in owner)
        return { supported: true, value: (owner as SceneNodeData).properties[nodeField[2]!] };
    }
    const member = value.match(/^m\.([A-Za-z]\w*)$/i);
    if (member)
      return {
        supported: variables.has(member[1]!.toLowerCase()),
        value: variables.get(member[1]!.toLowerCase()),
      };
    return { supported: false, value };
  };

  const conditionOf = (raw: string): { supported: boolean; value: boolean } => {
    const condition = raw.replace(/\s+then\s*$/i, '').trim();
    const comparison = condition.match(/^(.+?)\s*(<>|>=|<=|=|>|<)\s*(.+)$/);
    if (comparison) {
      const left = valueOf(comparison[1]!);
      const right = valueOf(comparison[3]!);
      if (!left.supported || !right.supported) return { supported: false, value: false };
      const operator = comparison[2];
      if (operator === '=') return { supported: true, value: equal(left.value, right.value) };
      if (operator === '<>') return { supported: true, value: !equal(left.value, right.value) };
      if (typeof left.value !== 'number' || typeof right.value !== 'number')
        return { supported: false, value: false };
      if (operator === '>') return { supported: true, value: left.value > right.value };
      if (operator === '<') return { supported: true, value: left.value < right.value };
      if (operator === '>=') return { supported: true, value: left.value >= right.value };
      return { supported: true, value: left.value <= right.value };
    }
    const value = valueOf(condition);
    return { supported: value.supported, value: Boolean(value.value) };
  };

  const executeRoutine = (routineName: string): void => {
    const routine = routines.get(routineName);
    if (!routine || routine.hasLoop || activeRoutines.has(routineName)) return;
    activeRoutines.add(routineName);

    const executeRange = (start: number, end: number): void => {
      for (let index = start; index < end; index += 1) {
        const text = lines[index]?.trim() ?? '';
        if (!text || text.startsWith("'")) continue;

        const ifMatch = text.match(/^if\s+(.+)$/i);
        if (ifMatch) {
          let depth = 0;
          let otherwise = -1;
          let close = -1;
          for (let candidate = index + 1; candidate < end; candidate += 1) {
            const nested = lines[candidate]?.trim() ?? '';
            if (/^if\s+/i.test(nested)) depth += 1;
            if (/^end\s+if$/i.test(nested)) {
              if (depth === 0) {
                close = candidate;
                break;
              }
              depth -= 1;
            } else if (/^else$/i.test(nested) && depth === 0) otherwise = candidate;
          }
          const condition = conditionOf(ifMatch[1]!);
          if (close < 0 || !condition.supported) {
            unsupportedLines.push(index + 1);
          } else if (condition.value) {
            executeRange(index + 1, otherwise >= 0 ? otherwise : close);
          } else if (otherwise >= 0) {
            executeRange(otherwise + 1, close);
          }
          index = close >= 0 ? close : index;
          continue;
        }

        const print = text.match(/^print\s+(.+)$/i);
        if (print) {
          const value = valueOf(print[1]!);
          console.push({
            timestamp: new Date().toISOString(),
            level: 'info',
            message: String(value.value),
            source: sourceName,
            line: index + 1,
          });
          continue;
        }

        const nodeReference = text.match(/^m\.([A-Za-z]\w*)\s*=\s*m\.top\.findNode\("([^"]+)"\)$/i);
        if (nodeReference) {
          const node = findNode(scene, nodeReference[2]!);
          if (node) variables.set(nodeReference[1]!.toLowerCase(), node);
          else
            warnings.push(
              `findNode could not find ${nodeReference[2]} at ${sourceName}:${index + 1}`,
            );
          continue;
        }

        const observer = text.match(/^m\.([A-Za-z]\w*)\.observeField\("([^"]+)",\s*"([^"]+)"\)$/i);
        if (observer) {
          const node = variables.get(observer[1]!.toLowerCase());
          if (node && typeof node === 'object' && 'type' in node) {
            const sceneNode = node as SceneNodeData;
            observers.push({
              nodeId: sceneNode.id ?? observer[1]!,
              field: observer[2]!,
              handler: observer[3]!,
              source: sourceName,
              line: index + 1,
            });
          } else
            warnings.push(
              `ObserveField target ${observer[1]} was not resolved at ${sourceName}:${index + 1}`,
            );
          continue;
        }

        const assignNodeField = (node: SceneNodeData, field: string, raw: string): boolean => {
          const value = valueOf(raw);
          if (!value.supported) return false;
          if (equal(node.properties[field], value.value)) return true;
          node.properties[field] = value.value;
          for (const registered of observers.filter(
            ({ nodeId, field: observed }) =>
              nodeId === node.id && observed.toLowerCase() === field.toLowerCase(),
          )) {
            const key = `${registered.nodeId}.${registered.field}`.toLowerCase();
            if (dispatching.has(key)) continue;
            dispatching.add(key);
            events.push({
              nodeId: registered.nodeId,
              field: registered.field,
              handler: registered.handler,
              source: sourceName,
              line: index + 1,
            });
            executeRoutine(registered.handler.toLowerCase());
            dispatching.delete(key);
          }
          return true;
        };

        const directAssignment = text.match(
          /^m\.top\.findNode\("([^"]+)"\)\.([A-Za-z]\w*)\s*=\s*(.+)$/i,
        );
        if (directAssignment) {
          const node = findNode(scene, directAssignment[1]!);
          if (!node)
            warnings.push(
              `findNode could not find ${directAssignment[1]} at ${sourceName}:${index + 1}`,
            );
          else if (!assignNodeField(node, directAssignment[2]!, directAssignment[3]!))
            unsupportedLines.push(index + 1);
          continue;
        }

        const aliasAssignment = text.match(/^m\.([A-Za-z]\w*)\.([A-Za-z]\w*)\s*=\s*(.+)$/i);
        if (aliasAssignment) {
          const node = variables.get(aliasAssignment[1]!.toLowerCase());
          if (
            node &&
            typeof node === 'object' &&
            'type' in node &&
            assignNodeField(node as SceneNodeData, aliasAssignment[2]!, aliasAssignment[3]!)
          )
            continue;
        }

        const variableAssignment = text.match(/^m\.([A-Za-z]\w*)\s*=\s*(.+)$/i);
        if (variableAssignment) {
          const value = valueOf(variableAssignment[2]!);
          if (value.supported) {
            variables.set(variableAssignment[1]!.toLowerCase(), value.value);
            continue;
          }
        }

        const call = text.match(/^([A-Za-z]\w*)\(\)$/);
        const called = call ? routines.get(call[1]!.toLowerCase()) : undefined;
        if (call && called && !called.hasLoop) {
          executeRoutine(call[1]!.toLowerCase());
          continue;
        }
        unsupportedLines.push(index + 1);
      }
    };

    executeRange(routine.start + 1, routine.end);
    activeRoutines.delete(routineName);
  };

  if (routines.has('init')) executeRoutine('init');
  if (unsupportedLines.length > 0)
    warnings.push(
      `Unsupported BrightScript statements at ${sourceName}:${lineRanges(unsupportedLines)}`,
    );
  return { console, warnings, observers, events };
}
