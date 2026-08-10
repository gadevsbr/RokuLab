export type Manifest = Record<string, string>;

export interface ProjectEntry {
  name: string;
  path: string;
  kind: 'file' | 'directory';
  children?: ProjectEntry[];
}

export interface SceneNodeData {
  id?: string;
  type: string;
  properties: Record<string, unknown>;
  children: SceneNodeData[];
  focusable: boolean;
}

export interface ConsoleEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  source?: string;
  line?: number;
}

export interface ProjectSnapshot {
  rootPath: string;
  manifest: Manifest;
  files: ProjectEntry[];
  scene?: SceneNodeData;
  console: ConsoleEntry[];
  warnings: string[];
}
