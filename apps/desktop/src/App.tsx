import Editor, { type BeforeMount } from '@monaco-editor/react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { collectFocusTargets, nextFocusTarget, type FocusDirection } from '@rokulab/scenegraph';
import type {
  ConsoleEntry,
  ProjectEntry,
  ProjectFileContent,
  ProjectSnapshot,
  SceneNodeData,
} from '@rokulab/shared';
import {
  sendCompatibilityKey,
  startCompatibilityEngine,
  stopCompatibilityEngine,
} from './compatibility-engine';
import {
  applyRuntimeUpdate,
  runtimeNodeBounds,
  runtimeNodeChildren,
  runtimeNodeLabel,
  visibleRuntimeFields,
  type RuntimeNode,
} from './runtime-tree';

const sourcePattern = /(^manifest$|\.(brs|xml|json|txt)$)/i;

interface EngineDiagnostic {
  event: string;
  detail: string;
  timestamp: string;
}

interface EngineFieldUpdate {
  action: string;
  address: string;
  key: string;
  type: string;
  value: string;
}

function serializeDiagnostic(value: unknown): string {
  try {
    const serialized = JSON.stringify(value, (_key, item) =>
      typeof item === 'bigint' ? item.toString() : item,
    );
    return (serialized ?? String(value)).slice(0, 2_000);
  } catch {
    return String(value).slice(0, 2_000);
  }
}

function FileTree({
  entries,
  selected,
  onOpen,
}: {
  entries: ProjectEntry[];
  selected: string | undefined;
  onOpen(path: string): void;
}) {
  return (
    <ul className="tree">
      {entries.map((entry) => (
        <li key={entry.path}>
          {entry.kind === 'directory' ? (
            <span className="directory">v {entry.name}</span>
          ) : sourcePattern.test(entry.path) ? (
            <button
              className={`file file-button ${selected === entry.path ? 'active' : ''}`}
              onClick={() => onOpen(entry.path)}
            >
              . {entry.name}
            </button>
          ) : (
            <span className="file">. {entry.name}</span>
          )}
          {entry.children && (
            <FileTree entries={entry.children} selected={selected} onOpen={onOpen} />
          )}
        </li>
      ))}
    </ul>
  );
}

function SceneTree({
  node,
  selected,
  onSelect,
}: {
  node: SceneNodeData;
  selected: string | undefined;
  onSelect(id: string): void;
}) {
  const key = node.id ?? `${node.type}-${node.children.length}`;
  return (
    <li>
      <button className={selected === key ? 'node active' : 'node'} onClick={() => onSelect(key)}>
        {node.type}
        {node.id && <small> #{node.id}</small>}
      </button>
      {node.children.length > 0 && (
        <ul className="tree">
          {node.children.map((child, index) => (
            <SceneTree
              key={`${child.id ?? child.type}-${index}`}
              node={child}
              selected={selected}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function LiveRuntimeTree({
  nodes,
  parent,
  selected,
  onSelect,
  ancestors = [],
}: {
  nodes: RuntimeNode[];
  parent?: string;
  selected: string | undefined;
  onSelect(address: string): void;
  ancestors?: string[];
}) {
  const children = runtimeNodeChildren(nodes, parent).filter(
    ({ address }) => !ancestors.includes(address),
  );
  return (
    <>
      {children.map((node) => (
        <li key={node.stableId}>
          <button
            className={selected === node.address ? 'active' : ''}
            title={`${node.type}:${node.address}`}
            onClick={() => onSelect(node.address)}
          >
            <span>{runtimeNodeLabel(node)}</span>
            <small>{node.updates}</small>
          </button>
          {runtimeNodeChildren(nodes, node.address).length > 0 && (
            <ul className="runtime-tree nested">
              <LiveRuntimeTree
                nodes={nodes}
                parent={node.address}
                selected={selected}
                onSelect={onSelect}
                ancestors={[...ancestors, node.address]}
              />
            </ul>
          )}
        </li>
      ))}
    </>
  );
}

function RenderNode({ node, focused }: { node: SceneNodeData; focused: string | undefined }) {
  const style = {
    transform: Array.isArray(node.properties.translation)
      ? `translate(${node.properties.translation[0] ?? 0}px, ${node.properties.translation[1] ?? 0}px)`
      : undefined,
    width: typeof node.properties.width === 'number' ? node.properties.width : undefined,
    height: typeof node.properties.height === 'number' ? node.properties.height : undefined,
    color: typeof node.properties.color === 'string' ? node.properties.color : undefined,
    background:
      node.type === 'Rectangle' && typeof node.properties.color === 'string'
        ? node.properties.color
        : undefined,
    opacity: typeof node.properties.opacity === 'number' ? node.properties.opacity : undefined,
  };
  return (
    <div
      data-node={node.id}
      className={`sg sg-${node.type.toLowerCase()} ${focused === node.id ? 'focused' : ''}`}
      style={style}
    >
      {node.type === 'Label' || node.type === 'Button' ? String(node.properties.text ?? '') : null}
      {node.type === 'Poster' && typeof node.properties.uri === 'string' ? (
        <img src={node.properties.uri} alt="" />
      ) : null}
      {node.children.map((child, index) => (
        <RenderNode key={`${child.id ?? child.type}-${index}`} node={child} focused={focused} />
      ))}
    </div>
  );
}

function findSceneNode(
  node: SceneNodeData | undefined,
  id: string | undefined,
): SceneNodeData | undefined {
  if (!node || !id) return undefined;
  if (node.id === id) return node;
  for (const child of node.children) {
    const found = findSceneNode(child, id);
    if (found) return found;
  }
  return undefined;
}

function displayProperty(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === undefined) return '';
  return JSON.stringify(value);
}

const prepareMonaco: BeforeMount = (monaco) => {
  if (monaco.languages.getLanguages().some(({ id }: { id: string }) => id === 'brightscript'))
    return;
  monaco.languages.register({ id: 'brightscript', extensions: ['.brs'] });
  monaco.languages.setMonarchTokensProvider('brightscript', {
    ignoreCase: true,
    keywords: [
      'sub',
      'function',
      'end',
      'if',
      'then',
      'else',
      'for',
      'each',
      'while',
      'return',
      'print',
    ],
    tokenizer: {
      root: [
        [/'[^$]*/, 'comment'],
        [/"(?:[^"]|"")*"/, 'string'],
        [/\b\d+(\.\d+)?\b/, 'number'],
        [/[a-zA-Z_]\w*/, { cases: { '@keywords': 'keyword', '@default': 'identifier' } }],
      ],
    },
  });
};

export function App() {
  const [project, setProject] = useState<ProjectSnapshot>();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [bottomTab, setBottomTab] = useState<'Console' | 'Problems'>('Console');
  const [workspaceTab, setWorkspaceTab] = useState<'Preview' | 'Editor'>('Preview');
  const [selectedNode, setSelectedNode] = useState<string>();
  const [file, setFile] = useState<ProjectFileContent>();
  const [draft, setDraft] = useState('');
  const [dirty, setDirty] = useState(false);
  const [focusedNode, setFocusedNode] = useState<string>();
  const [engineActive, setEngineActive] = useState(false);
  const [engineConsole, setEngineConsole] = useState<ConsoleEntry[]>([]);
  const [engineVersion, setEngineVersion] = useState('');
  const [engineRestarts, setEngineRestarts] = useState(0);
  const [engineEvents, setEngineEvents] = useState<EngineDiagnostic[]>([]);
  const [engineFields, setEngineFields] = useState<EngineFieldUpdate[]>([]);
  const [runtimeNodes, setRuntimeNodes] = useState<RuntimeNode[]>([]);
  const [selectedRuntimeNode, setSelectedRuntimeNode] = useState<string>();
  const [lastEngineInput, setLastEngineInput] = useState('');
  const projectRoot = project?.rootPath;
  const focusTargets = useMemo(
    () => (project?.scene ? collectFocusTargets(project.scene) : []),
    [project?.scene],
  );
  const inspectedNode = useMemo(
    () => findSceneNode(project?.scene, selectedNode),
    [project?.scene, selectedNode],
  );
  const inspectedRuntimeNode = useMemo(
    () => runtimeNodes.find(({ address }) => address === selectedRuntimeNode),
    [runtimeNodes, selectedRuntimeNode],
  );
  const inspectedRuntimeBounds = useMemo(
    () =>
      inspectedRuntimeNode ? runtimeNodeBounds(runtimeNodes, inspectedRuntimeNode) : undefined,
    [inspectedRuntimeNode, runtimeNodes],
  );

  const open = async (demo = false) => {
    try {
      setError('');
      const value = demo
        ? await window.rokulab?.openExample()
        : await window.rokulab?.chooseProject();
      if (value) {
        setProject(value);
        setWorkspaceTab('Preview');
        setFile(undefined);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const openFile = async (relative: string) => {
    try {
      const value = await window.rokulab?.readFile(relative);
      if (!value) return;
      setFile(value);
      setDraft(value.content);
      setDirty(false);
      setWorkspaceTab('Editor');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };

  const save = useCallback(async () => {
    if (!file || !dirty) return;
    try {
      await window.rokulab?.writeFile(file.path, draft);
      setFile((current) => (current ? { ...current, content: draft } : current));
      setDirty(false);
      setStatus(`Saved ${file.path}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, [draft, dirty, file]);

  const sendEngineInput = useCallback((key: string) => {
    setLastEngineInput(key);
    void sendCompatibilityKey(key);
  }, []);

  const move = useCallback(
    (direction: FocusDirection) => {
      if (engineActive) sendEngineInput(direction);
      else setFocusedNode((current) => nextFocusTarget(focusTargets, current, direction));
    },
    [engineActive, focusTargets, sendEngineInput],
  );

  const runEngine = useCallback(
    async (targetProject: ProjectSnapshot | undefined = project) => {
      if (!targetProject || !window.rokulab) return;
      try {
        setError('');
        setEngineConsole([]);
        setRuntimeNodes([]);
        setSelectedRuntimeNode(undefined);
        setStatus(
          engineActive ? 'Restarting compatibility engine...' : 'Starting compatibility engine...',
        );
        setWorkspaceTab('Preview');
        const archive = await window.rokulab.archiveProject();
        const version = await startCompatibilityEngine(
          archive,
          targetProject.manifest.title ?? 'RokuLab-channel',
          (event, data) => {
            const detail = data === undefined ? '' : serializeDiagnostic(data);
            setEngineEvents((events) => [
              ...events.slice(-99),
              { event, detail, timestamp: new Date().toISOString() },
            ]);
            if (event === 'debug') {
              const debug = (data ?? {}) as { level?: string; content?: unknown };
              const level: ConsoleEntry['level'] =
                debug.level === 'error' || debug.level === 'warn' || debug.level === 'debug'
                  ? debug.level
                  : 'info';
              setEngineConsole((entries) => [
                ...entries.slice(-499),
                {
                  timestamp: new Date().toISOString(),
                  level,
                  source: 'brs-engine',
                  message: String(debug.content ?? ''),
                },
              ]);
            } else if (event === 'worker-update') {
              const update = data as {
                action: string;
                address: string;
                key: string;
                type: string;
                value: unknown;
              };
              setEngineFields((updates) => [
                ...updates.slice(-99),
                { ...update, value: serializeDiagnostic(update.value) },
              ]);
              setRuntimeNodes((nodes) => applyRuntimeUpdate(nodes, update));
            } else if (event === 'error') {
              setError(typeof data === 'string' ? data : serializeDiagnostic(data));
            } else if (event === 'closed') {
              setEngineActive(false);
              setStatus('Compatibility engine stopped');
            } else if (!['audio', 'video', 'display', 'stats'].includes(event)) {
              setEngineConsole((entries) => [
                ...entries.slice(-499),
                {
                  timestamp: new Date().toISOString(),
                  level: 'debug',
                  source: 'brs-engine',
                  message: `${event}${data === undefined ? '' : `: ${serializeDiagnostic(data)}`}`,
                },
              ]);
            }
          },
        );
        setEngineVersion(version);
        setEngineActive(true);
        setEngineRestarts((value) => value + 1);
        setStatus(`Compatibility engine ${version} running`);
      } catch (reason) {
        setEngineActive(false);
        setError(reason instanceof Error ? reason.message : String(reason));
      }
    },
    [engineActive, project],
  );

  const stopEngine = useCallback(async () => {
    await stopCompatibilityEngine();
    setEngineActive(false);
    setStatus('Compatibility engine stopped');
  }, []);

  useEffect(() => {
    void window.rokulab
      ?.initialProject()
      .then((initial) => initial && setProject(initial))
      .catch((reason) => setError(reason instanceof Error ? reason.message : String(reason)));
  }, []);

  useEffect(() => {
    if (!focusTargets.some(({ id }) => id === focusedNode)) setFocusedNode(focusTargets[0]?.id);
  }, [focusTargets, focusedNode]);

  useEffect(() => {
    const api = window.rokulab;
    if (!api || !projectRoot) return;
    const removeChange = api.onProjectChanged((change) => {
      setProject(change.snapshot);
      if (engineActive) {
        setStatus(`Restarting after ${change.changedPath}`);
        void runEngine(change.snapshot);
      } else setStatus(`Hot reloaded ${change.changedPath}`);
      if (file?.path === change.changedPath && !dirty) void openFile(change.changedPath);
    });
    const removeError = api.onWatchError(setError);
    return () => {
      removeChange();
      removeError();
    };
  }, [dirty, engineActive, file?.path, projectRoot, runEngine]);

  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        void save();
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [save]);

  useEffect(() => {
    if (workspaceTab !== 'Preview') return;
    const key = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown') move('down');
      if (event.key === 'ArrowRight') move('right');
      if (event.key === 'ArrowUp') move('up');
      if (event.key === 'ArrowLeft') move('left');
      if (engineActive && event.key === 'Enter') sendEngineInput('select');
      if (engineActive && event.key === 'Escape') sendEngineInput('back');
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [engineActive, move, sendEngineInput, workspaceTab]);

  if (!project)
    return (
      <main className="welcome">
        <div className="brand-mark">RL</div>
        <h1>RokuLab</h1>
        <p>The missing development environment for Roku.</p>
        <button className="primary" onClick={() => void open()}>
          Open Roku Project
        </button>
        <button className="secondary" onClick={() => void open(true)}>
          Open bundled Hello World
        </button>
        {error && <div className="error">{error}</div>}
        <small>Local-first | Early alpha | Final testing still belongs on Roku hardware</small>
      </main>
    );

  return (
    <main className="workbench">
      <header>
        <strong className="app-brand">
          <i>RL</i> RokuLab
        </strong>
        <button className="project-switcher" title={project.rootPath}>
          {project.manifest.title}{' '}
          <em>
            {project.manifest.major_version ?? '0'}.{project.manifest.minor_version ?? '0'}.
            {project.manifest.build_version ?? '0'}
          </em>
          <span>⌄</span>
        </button>
        <div className="toolbar-context">
          <button title="Current branch">⑂ main ⌄</button>
          <button title="Virtual TV profile">▣ Roku TV · 1080p ⌄</button>
          <button title="Run configuration">⌁ app ⌄</button>
        </div>
        <nav>
          <button
            className="run-action"
            aria-label="Run"
            title="Run channel"
            onClick={() => void runEngine()}
          >
            ▶
          </button>
          <button
            aria-label="Stop"
            title="Stop"
            disabled={!engineActive}
            onClick={() => void stopEngine()}
          >
            ■
          </button>
          <button
            aria-label="Reload"
            title="Reload"
            onClick={() => void window.rokulab?.openPath(project.rootPath).then(setProject)}
          >
            ↻
          </button>
          <button
            aria-label="Open another project"
            title="Open another project"
            onClick={() => setProject(undefined)}
          >
            ⋮
          </button>
        </nav>
      </header>
      <aside className="tool-rail" aria-label="Tool windows">
        <button className="active" title="Project">
          ▱
        </button>
        <button title="SceneGraph">◇</button>
        <button title="Inspector">⚙</button>
        <button title="Problems">△</button>
        <span />
        <button title="Terminal">›_</button>
      </aside>
      <aside className="explorer">
        <div className="panel-title">
          <h2>PROJECT</h2>
          <button title="Panel options">⋮</button>
        </div>
        <FileTree
          entries={project.files}
          selected={file?.path}
          onOpen={(path) => void openFile(path)}
        />
      </aside>
      <section className="display">
        <div className="workspace-tabs">
          <button
            className={workspaceTab === 'Preview' ? 'active' : ''}
            onClick={() => setWorkspaceTab('Preview')}
          >
            Preview
          </button>
          <button
            className={workspaceTab === 'Editor' ? 'active' : ''}
            disabled={!file}
            onClick={() => setWorkspaceTab('Editor')}
          >
            {file ? `${dirty ? '* ' : ''}${file.path}` : 'Editor'}
          </button>
          <span />
          {workspaceTab === 'Editor' && (
            <button className="save" disabled={!dirty} onClick={() => void save()}>
              Save
            </button>
          )}
        </div>
        {workspaceTab === 'Preview' ? (
          <div className="preview-workspace">
            <section className="preview-device">
              <div className="preview-toolbar">
                <h2>RUNNING TV</h2>
                <span>Roku TV · 1080p</span>
                <span className={engineActive ? 'device-status running' : 'device-status'}>
                  {engineActive ? '● Running' : '○ Stopped'}
                </span>
                <span>100%</span>
              </div>
              <div className="tv-stage">
                <div className="tv">
                  <div className="screen">
                    <canvas id="display" width="1920" height="1080" hidden={!engineActive} />
                    <video id="player" hidden />
                    <div id="stats" hidden />
                    {!engineActive && project.scene && (
                      <RenderNode node={project.scene} focused={focusedNode} />
                    )}
                  </div>
                </div>
                <div className="tv-stand" />
              </div>
            </section>
            <aside className="remote-panel">
              <div className="panel-title">
                <h2>REMOTE</h2>
                <span>{lastEngineInput || 'Ready'}</span>
              </div>
              <div className="remote">
                <button aria-label="Back" onClick={() => engineActive && sendEngineInput('back')}>
                  ↩
                </button>
                <button aria-label="Up" onClick={() => move('up')}>
                  ↑
                </button>
                <div>
                  <button aria-label="Left" onClick={() => move('left')}>
                    ←
                  </button>
                  <button className="ok" onClick={() => engineActive && sendEngineInput('select')}>
                    OK
                  </button>
                  <button aria-label="Right" onClick={() => move('right')}>
                    →
                  </button>
                </div>
                <button aria-label="Down" onClick={() => move('down')}>
                  ↓
                </button>
                <div className="media-keys">
                  <button onClick={() => engineActive && sendEngineInput('rev')}>◀◀</button>
                  <button onClick={() => engineActive && sendEngineInput('play')}>▶Ⅱ</button>
                  <button onClick={() => engineActive && sendEngineInput('fwd')}>▶▶</button>
                </div>
                <small>Keyboard: arrows · Enter · Escape</small>
              </div>
              <dl className="remote-runtime">
                <dt>Canvas</dt>
                <dd>1920 × 1080</dd>
                <dt>Observers</dt>
                <dd>{project.observers.length}</dd>
                <dt>Events</dt>
                <dd>{project.events.length}</dd>
              </dl>
            </aside>
          </div>
        ) : file ? (
          <div className="editor-shell">
            <Editor
              path={file.path}
              language={file.language}
              value={draft}
              theme="vs-dark"
              beforeMount={prepareMonaco}
              onChange={(value) => {
                setDraft(value ?? '');
                setDirty((value ?? '') !== file.content);
              }}
              options={{
                automaticLayout: true,
                minimap: { enabled: false },
                fontSize: 13,
                tabSize: 2,
                wordWrap: 'on',
              }}
            />
          </div>
        ) : null}
      </section>
      <aside className="inspector">
        <div className="panel-title">
          <h2>INSPECTOR</h2>
          <button title="Panel options">⋮</button>
        </div>
        <h2>RUNTIME</h2>
        <dl>
          <dt>state</dt>
          <dd>{engineActive ? 'running' : 'stopped'}</dd>
        </dl>
        <dl>
          <dt>engine</dt>
          <dd>{engineVersion || 'not started'}</dd>
        </dl>
        <dl>
          <dt>starts</dt>
          <dd>{engineRestarts}</dd>
        </dl>
        <dl>
          <dt>last input</dt>
          <dd>{lastEngineInput || 'none'}</dd>
        </dl>
        <dl>
          <dt>canvas</dt>
          <dd>1920 x 1080</dd>
        </dl>
        <h2>RUNTIME EVENTS ({engineEvents.length})</h2>
        {engineEvents.slice(-10).map((entry, index) => (
          <dl key={`${entry.timestamp}-${entry.event}-${index}`}>
            <dt>{entry.event}</dt>
            <dd title={entry.detail}>{entry.detail || entry.timestamp.slice(11, 19)}</dd>
          </dl>
        ))}
        <h2>LIVE FIELD UPDATES ({engineFields.length})</h2>
        {engineFields.slice(-20).map((update, index) => (
          <dl key={`${update.address}-${update.key}-${update.action}-${index}`}>
            <dt title={`${update.type}:${update.address}`}>
              {update.action} {update.key}
            </dt>
            <dd title={update.value}>{update.value}</dd>
          </dl>
        ))}
        <h2>LIVE NODES ({runtimeNodes.length})</h2>
        <ul className="runtime-tree">
          <LiveRuntimeTree
            nodes={runtimeNodes}
            selected={selectedRuntimeNode}
            onSelect={setSelectedRuntimeNode}
          />
        </ul>
        {inspectedRuntimeNode && (
          <>
            <h2>LIVE PROPERTIES {runtimeNodeLabel(inspectedRuntimeNode)}</h2>
            <dl>
              <dt>address</dt>
              <dd title={inspectedRuntimeNode.address}>{inspectedRuntimeNode.address}</dd>
            </dl>
            <dl>
              <dt>type</dt>
              <dd>{inspectedRuntimeNode.subtype ?? inspectedRuntimeNode.type}</dd>
            </dl>
            <dl>
              <dt>parent</dt>
              <dd title={inspectedRuntimeNode.parentAddress}>
                {inspectedRuntimeNode.parentAddress ?? 'root / unknown'}
              </dd>
            </dl>
            <dl>
              <dt>bounds</dt>
              <dd>
                {inspectedRuntimeBounds
                  ? `${inspectedRuntimeBounds.x}, ${inspectedRuntimeBounds.y} · ${inspectedRuntimeBounds.width} × ${inspectedRuntimeBounds.height}`
                  : 'unavailable'}
              </dd>
            </dl>
            {visibleRuntimeFields(inspectedRuntimeNode).map(([key, value]) => (
              <dl key={key}>
                <dt>{key}</dt>
                <dd title={serializeDiagnostic(value)}>{serializeDiagnostic(value)}</dd>
              </dl>
            ))}
          </>
        )}
        <h2>SCENEGRAPH</h2>
        {project.scene && (
          <ul className="tree">
            <SceneTree node={project.scene} selected={selectedNode} onSelect={setSelectedNode} />
          </ul>
        )}
        {inspectedNode && (
          <>
            <h2>PROPERTIES #{inspectedNode.id}</h2>
            <dl>
              <dt>type</dt>
              <dd>{inspectedNode.type}</dd>
            </dl>
            <dl>
              <dt>focusable</dt>
              <dd>{String(inspectedNode.focusable)}</dd>
            </dl>
            {Object.entries(inspectedNode.properties).map(([key, value]) => (
              <dl key={key}>
                <dt>{key}</dt>
                <dd title={displayProperty(value)}>{displayProperty(value)}</dd>
              </dl>
            ))}
          </>
        )}
        <h2>OBSERVERS ({project.observers.length})</h2>
        {project.observers.map((observer) => (
          <dl key={`${observer.nodeId}-${observer.field}-${observer.handler}`}>
            <dt>
              #{observer.nodeId}.{observer.field}
            </dt>
            <dd>{observer.handler}</dd>
          </dl>
        ))}
        <h2>EVENTS ({project.events.length})</h2>
        {project.events.map((event, index) => (
          <dl key={`${event.nodeId}-${event.field}-${event.handler}-${index}`}>
            <dt>
              #{event.nodeId}.{event.field}
            </dt>
            <dd>{event.handler}</dd>
          </dl>
        ))}
        <h2>MANIFEST</h2>
        {Object.entries(project.manifest).map(([key, value]) => (
          <dl key={key}>
            <dt>{key}</dt>
            <dd>{value}</dd>
          </dl>
        ))}
      </aside>
      <section className="bottom">
        <div className="tabs">
          <button
            className={bottomTab === 'Console' ? 'active' : ''}
            onClick={() => setBottomTab('Console')}
          >
            Console <b>{project.console.length + engineConsole.length}</b>
          </button>
          <button
            className={bottomTab === 'Problems' ? 'active' : ''}
            onClick={() => setBottomTab('Problems')}
          >
            Problems <b>{project.warnings.length}</b>
          </button>
          <span>{status}</span>
          <button onClick={() => setStatus('')}>Clear status</button>
        </div>
        <div className="output">
          {error && <p className="error">ERROR {error}</p>}
          {bottomTab === 'Console'
            ? [...project.console, ...engineConsole].map((entry, index) => (
                <p key={index}>
                  <time>{entry.timestamp.slice(11, 19)}</time>{' '}
                  <mark>{entry.level.toUpperCase()}</mark>{' '}
                  <code>
                    {entry.source}:{entry.line}
                  </code>{' '}
                  {entry.message}
                </p>
              ))
            : project.warnings.map((warning, index) => (
                <p key={index} className="warning">
                  WARNING {warning}
                </p>
              ))}
        </div>
      </section>
      <footer className="statusbar">
        <span>RokuLab</span>
        <span>›</span>
        <span>{project.manifest.title}</span>
        <span className="status-spacer" />
        <span>{engineActive ? 'Runtime connected' : 'Runtime stopped'}</span>
        <span>UTF-8</span>
        <span>LF</span>
        <span>2 spaces</span>
      </footer>
    </main>
  );
}
