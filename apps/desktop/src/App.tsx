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

const sourcePattern = /(^manifest$|\.(brs|xml|json|txt)$)/i;

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
  const projectRoot = project?.rootPath;
  const focusTargets = useMemo(
    () => (project?.scene ? collectFocusTargets(project.scene) : []),
    [project?.scene],
  );
  const inspectedNode = useMemo(
    () => findSceneNode(project?.scene, selectedNode),
    [project?.scene, selectedNode],
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

  const move = useCallback(
    (direction: FocusDirection) => {
      if (engineActive) void sendCompatibilityKey(direction);
      else setFocusedNode((current) => nextFocusTarget(focusTargets, current, direction));
    },
    [engineActive, focusTargets],
  );

  const runEngine = useCallback(async () => {
    if (!project || !window.rokulab) return;
    try {
      setError('');
      setEngineConsole([]);
      setEngineActive(true);
      setWorkspaceTab('Preview');
      const archive = await window.rokulab.archiveProject();
      const version = await startCompatibilityEngine(
        archive,
        project.manifest.title ?? 'RokuLab-channel',
        (event, data) => {
          if (event === 'debug') {
            const detail = (data ?? {}) as { level?: string; content?: unknown };
            const level: ConsoleEntry['level'] =
              detail.level === 'error' || detail.level === 'warn' || detail.level === 'debug'
                ? detail.level
                : 'info';
            setEngineConsole((entries) => [
              ...entries.slice(-499),
              {
                timestamp: new Date().toISOString(),
                level,
                source: 'brs-engine',
                message: String(detail.content ?? ''),
              },
            ]);
          } else if (event === 'error') {
            setError(typeof data === 'string' ? data : JSON.stringify(data));
          } else if (event === 'end') {
            setEngineActive(false);
            setStatus('Compatibility engine stopped');
          } else if (!['audio', 'video', 'display', 'stats'].includes(event)) {
            setEngineConsole((entries) => [
              ...entries.slice(-499),
              {
                timestamp: new Date().toISOString(),
                level: 'debug',
                source: 'brs-engine',
                message: `${event}${data === undefined ? '' : `: ${typeof data === 'string' ? data : JSON.stringify(data)}`}`,
              },
            ]);
          }
        },
      );
      setStatus(`Compatibility engine ${version} running`);
    } catch (reason) {
      setEngineActive(false);
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  }, [project]);

  const stopEngine = useCallback(async () => {
    await stopCompatibilityEngine();
    setEngineActive(false);
    setStatus('Compatibility engine stopped');
  }, []);

  useEffect(() => {
    if (!focusTargets.some(({ id }) => id === focusedNode)) setFocusedNode(focusTargets[0]?.id);
  }, [focusTargets, focusedNode]);

  useEffect(() => {
    const api = window.rokulab;
    if (!api || !projectRoot) return;
    const removeChange = api.onProjectChanged((change) => {
      setProject(change.snapshot);
      setStatus(`Hot reloaded ${change.changedPath}`);
      if (file?.path === change.changedPath && !dirty) void openFile(change.changedPath);
    });
    const removeError = api.onWatchError(setError);
    return () => {
      removeChange();
      removeError();
    };
  }, [dirty, file?.path, projectRoot]);

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
      if (engineActive && event.key === 'Enter') void sendCompatibilityKey('select');
      if (engineActive && event.key === 'Escape') void sendCompatibilityKey('back');
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [engineActive, move, workspaceTab]);

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
        <strong>
          <i>RL</i> RokuLab
        </strong>
        <span>
          {project.manifest.title}{' '}
          <em>
            {project.manifest.major_version ?? '0'}.{project.manifest.minor_version ?? '0'}.
            {project.manifest.build_version ?? '0'}
          </em>
        </span>
        <nav>
          <button title="Run" onClick={() => void runEngine()}>
            Run
          </button>
          <button title="Stop" disabled={!engineActive} onClick={() => void stopEngine()}>
            Stop
          </button>
          <button
            title="Reload"
            onClick={() => void window.rokulab?.openPath(project.rootPath).then(setProject)}
          >
            Reload
          </button>
          <button onClick={() => setProject(undefined)}>Open...</button>
        </nav>
      </header>
      <aside className="explorer">
        <h2>PROJECT</h2>
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
          <>
            <div className="display-toolbar">
              <span>VIRTUAL ROKU</span>
              <span>1080p | 100%</span>
            </div>
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
            <div className="remote">
              <button onClick={() => engineActive && void sendCompatibilityKey('back')}>
                Back
              </button>
              <button onClick={() => move('up')}>Up</button>
              <div>
                <button onClick={() => move('left')}>Left</button>
                <button
                  className="ok"
                  onClick={() => engineActive && void sendCompatibilityKey('select')}
                >
                  OK
                </button>
                <button onClick={() => move('right')}>Right</button>
              </div>
              <button onClick={() => move('down')}>Down</button>
              <div>
                <button onClick={() => engineActive && void sendCompatibilityKey('rev')}>
                  Rev
                </button>
                <button onClick={() => engineActive && void sendCompatibilityKey('play')}>
                  Play
                </button>
                <button onClick={() => engineActive && void sendCompatibilityKey('fwd')}>
                  Fwd
                </button>
              </div>
              <small>Arrow keys | Enter | Escape</small>
            </div>
          </>
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
    </main>
  );
}
