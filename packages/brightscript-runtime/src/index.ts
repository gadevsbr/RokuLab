import { findNode } from '@rokulab/scenegraph';
import type { ConsoleEntry, RuntimeObserver, SceneNodeData } from '@rokulab/shared';

export interface RuntimeResult {
  console: ConsoleEntry[];
  warnings: string[];
  observers: RuntimeObserver[];
}

interface Routine {
  start: number;
  end: number;
  linear: boolean;
}

function literal(raw: string): unknown {
  const value = raw.trim();
  if (/^".*"$/.test(value)) return value.slice(1, -1).replace(/""/g, '"');
  if (/^(true|false)$/i.test(value)) return value.toLowerCase() === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
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

export function runInit(
  source: string,
  scene: SceneNodeData,
  sourceName = 'component.brs',
): RuntimeResult {
  const console: ConsoleEntry[] = [];
  const warnings: string[] = [];
  const observers: RuntimeObserver[] = [];
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
    const body = lines.slice(index + 1, end);
    routines.set(declaration[2]!.toLowerCase(), {
      start: index,
      end,
      linear: !body.some((line) => /^\s*(if|else|for|while|end\s+(if|for|while))\b/i.test(line)),
    });
    index = end;
  }
  if (!routines.has('init')) return { console, warnings, observers };
  const variables = new Map<string, unknown>();
  const active = new Set<string>();

  const execute = (routineName: string) => {
    const routine = routines.get(routineName);
    if (!routine || active.has(routineName)) return;
    active.add(routineName);
    for (let index = routine.start + 1; index < routine.end; index += 1) {
      const text = lines[index]?.trim() ?? '';
      if (!text || text.startsWith("'")) continue;
      const print = text.match(/^print\s+(.+)$/i);
      if (print) {
        console.push({
          timestamp: new Date().toISOString(),
          level: 'info',
          message: String(literal(print[1]!)),
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
        } else {
          warnings.push(
            `ObserveField target ${observer[1]} was not resolved at ${sourceName}:${index + 1}`,
          );
        }
        continue;
      }
      const assignment = text.match(/^m\.top\.findNode\("([^"]+)"\)\.([A-Za-z]\w*)\s*=\s*(.+)$/i);
      if (assignment) {
        const node = findNode(scene, assignment[1]!);
        if (node) node.properties[assignment[2]!] = literal(assignment[3]!);
        else
          warnings.push(`findNode could not find ${assignment[1]} at ${sourceName}:${index + 1}`);
        continue;
      }
      const call = text.match(/^([A-Za-z]\w*)\(\)$/);
      const called = call ? routines.get(call[1]!.toLowerCase()) : undefined;
      if (call && called?.linear) {
        execute(call[1]!.toLowerCase());
        continue;
      }
      unsupportedLines.push(index + 1);
    }
    active.delete(routineName);
  };
  execute('init');
  if (unsupportedLines.length > 0)
    warnings.push(
      `Unsupported BrightScript statements at ${sourceName}:${lineRanges(unsupportedLines)}`,
    );
  return { console, warnings, observers };
}
