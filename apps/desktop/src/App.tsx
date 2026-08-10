import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProjectEntry, ProjectSnapshot, SceneNodeData } from '@rokulab/shared';

function FileTree({ entries }: { entries: ProjectEntry[] }) {
  return (
    <ul className="tree">
      {entries.map((entry) => (
        <li key={entry.path}>
          <span className={entry.kind}>
            {entry.kind === 'directory' ? '⌄' : '·'} {entry.name}
          </span>
          {entry.children && <FileTree entries={entry.children} />}
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
          <SceneTreeList nodes={node.children} selected={selected} onSelect={onSelect} />
        </ul>
      )}
    </li>
  );
}
function SceneTreeList(props: {
  nodes: SceneNodeData[];
  selected: string | undefined;
  onSelect(id: string): void;
}) {
  return (
    <>
      {props.nodes.map((node, i) => (
        <SceneTree
          key={`${node.id ?? node.type}-${i}`}
          node={node}
          selected={props.selected}
          onSelect={props.onSelect}
        />
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
      {node.children.map((child, i) => (
        <RenderNode key={`${child.id ?? child.type}-${i}`} node={child} focused={focused} />
      ))}
    </div>
  );
}

function collectFocusable(node?: SceneNodeData): string[] {
  return node
    ? [...(node.focusable && node.id ? [node.id] : []), ...node.children.flatMap(collectFocusable)]
    : [];
}

export function App() {
  const [project, setProject] = useState<ProjectSnapshot>();
  const [error, setError] = useState('');
  const [bottomTab, setBottomTab] = useState<'Console' | 'Problems'>('Console');
  const [selected, setSelected] = useState<string>();
  const focusable = useMemo(() => collectFocusable(project?.scene), [project]);
  const [focusIndex, setFocusIndex] = useState(0);
  const open = async (demo = false) => {
    try {
      setError('');
      const value = demo
        ? await window.rokulab?.openExample()
        : await window.rokulab?.chooseProject();
      if (value) setProject(value);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : String(reason));
    }
  };
  const move = useCallback(
    (direction: number) =>
      setFocusIndex((current) =>
        focusable.length ? (current + direction + focusable.length) % focusable.length : 0,
      ),
    [focusable.length],
  );
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (['ArrowDown', 'ArrowRight'].includes(event.key)) move(1);
      if (['ArrowUp', 'ArrowLeft'].includes(event.key)) move(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [move]);

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
        <small>Local-first · Early alpha · Final testing still belongs on Roku hardware</small>
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
          <button title="Run">▶</button>
          <button
            title="Reload"
            onClick={() => void window.rokulab?.openPath(project.rootPath).then(setProject)}
          >
            ↻
          </button>
          <button title="Stop">■</button>
          <button onClick={() => setProject(undefined)}>Open…</button>
        </nav>
      </header>
      <aside className="explorer">
        <h2>PROJECT</h2>
        <FileTree entries={project.files} />
      </aside>
      <section className="display">
        <div className="display-toolbar">
          <span>VIRTUAL ROKU</span>
          <span>1080p · 100%</span>
        </div>
        <div className="tv">
          <div className="screen">
            {project.scene && <RenderNode node={project.scene} focused={focusable[focusIndex]} />}
          </div>
        </div>
        <div className="remote">
          <button onClick={() => move(-1)}>↑</button>
          <div>
            <button onClick={() => move(-1)}>←</button>
            <button className="ok">OK</button>
            <button onClick={() => move(1)}>→</button>
          </div>
          <button onClick={() => move(1)}>↓</button>
          <small>Keyboard arrows · Enter · Escape</small>
        </div>
      </section>
      <aside className="inspector">
        <h2>SCENEGRAPH</h2>
        {project.scene && (
          <ul className="tree">
            <SceneTree node={project.scene} selected={selected} onSelect={setSelected} />
          </ul>
        )}
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
            Console <b>{project.console.length}</b>
          </button>
          <button
            className={bottomTab === 'Problems' ? 'active' : ''}
            onClick={() => setBottomTab('Problems')}
          >
            Problems <b>{project.warnings.length}</b>
          </button>
          <span />
          <button>Clear</button>
        </div>
        <div className="output">
          {bottomTab === 'Console'
            ? project.console.map((entry, i) => (
                <p key={i}>
                  <time>{entry.timestamp.slice(11, 19)}</time> <mark>INFO</mark>{' '}
                  <code>
                    {entry.source}:{entry.line}
                  </code>{' '}
                  {entry.message}
                </p>
              ))
            : project.warnings.map((warning, i) => (
                <p key={i} className="warning">
                  ⚠ {warning}
                </p>
              ))}
        </div>
      </section>
    </main>
  );
}
