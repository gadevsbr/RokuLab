import { findNode } from '@rokulab/scenegraph';
import type { ConsoleEntry, SceneNodeData } from '@rokulab/shared';

export interface RuntimeResult {
  console: ConsoleEntry[];
  warnings: string[];
}

function literal(raw: string): unknown {
  const value = raw.trim();
  if (/^".*"$/.test(value)) return value.slice(1, -1).replace(/""/g, '"');
  if (/^(true|false)$/i.test(value)) return value.toLowerCase() === 'true';
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
}

function lineRanges(lines: number[]): string {
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
  const unsupportedLines: number[] = [];
  const lines = source.split(/\r?\n/);
  const start = lines.findIndex((line) => /^\s*(sub|function)\s+init\s*\(/i.test(line));
  if (start < 0) return { console, warnings };
  for (let index = start + 1; index < lines.length; index += 1) {
    const text = lines[index]?.trim() ?? '';
    if (/^end\s+(sub|function)/i.test(text)) break;
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
    const assignment = text.match(/^m\.top\.findNode\("([^"]+)"\)\.([A-Za-z]\w*)\s*=\s*(.+)$/i);
    if (assignment) {
      const node = findNode(scene, assignment[1]!);
      if (node) node.properties[assignment[2]!] = literal(assignment[3]!);
      else warnings.push(`findNode could not find ${assignment[1]} at ${sourceName}:${index + 1}`);
      continue;
    }
    unsupportedLines.push(index + 1);
  }
  if (unsupportedLines.length > 0)
    warnings.push(
      `Unsupported BrightScript statements at ${sourceName}:${lineRanges(unsupportedLines)}`,
    );
  return { console, warnings };
}
