type EngineCallback = (event: string, data?: unknown) => void;

interface BrsEngineApi {
  initialize(device?: Record<string, unknown>, options?: Record<string, unknown>): Promise<void>;
  subscribe(id: string, callback: EngineCallback): void;
  unsubscribe(id: string): void;
  execute(fileName: string, file: ArrayBuffer, options?: Record<string, unknown>): void;
  terminate(): void;
  sendKeyPress(key: string, delay?: number): void;
  getVersion(): string;
}

declare global {
  interface Window {
    brs?: BrsEngineApi;
  }
}

let apiPromise: Promise<BrsEngineApi> | undefined;
let initialized = false;
let operation: Promise<unknown> = Promise.resolve();
let activeCallback: EngineCallback | undefined;
let workerInstrumented = false;

function instrumentWorkers(): void {
  if (workerInstrumented) return;
  const NativeWorker = window.Worker;
  window.Worker = new Proxy(NativeWorker, {
    construct(target, argumentsList) {
      const worker = new target(
        argumentsList[0] as string | URL,
        argumentsList[1] as WorkerOptions | undefined,
      );
      worker.addEventListener('message', ({ data }) => {
        if (
          data &&
          typeof data === 'object' &&
          typeof data.id === 'number' &&
          typeof data.action === 'string' &&
          ['global', 'task', 'scene', 'node'].includes(data.type) &&
          typeof data.address === 'string' &&
          typeof data.key === 'string'
        )
          activeCallback?.('worker-update', data);
      });
      return worker;
    },
  });
  workerInstrumented = true;
}

function loadApi(): Promise<BrsEngineApi> {
  if (window.brs) return Promise.resolve(window.brs);
  if (apiPromise) return apiPromise;
  instrumentWorkers();
  apiPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = new URL('brs-engine/brs.api.js', document.baseURI).href;
    script.onload = () =>
      window.brs ? resolve(window.brs) : reject(new Error('BrightScript engine API did not load'));
    script.onerror = () =>
      reject(new Error('Unable to load the BrightScript compatibility engine'));
    document.head.append(script);
  });
  return apiPromise;
}

export async function startCompatibilityEngine(
  archive: Uint8Array,
  title: string,
  callback: EngineCallback,
): Promise<string> {
  const start = async () => {
    activeCallback = callback;
    if (!crossOriginIsolated)
      throw new Error('Compatibility engine requires cross-origin isolation');
    const common = await fetch(new URL('assets/common.zip', document.baseURI));
    if (!common.ok || !(await common.arrayBuffer()).byteLength)
      throw new Error('Compatibility engine common assets are unavailable');
    const api = await loadApi();
    if (!initialized) {
      await api.initialize(
        {
          displayMode: '1080p',
          locale: 'pt_BR',
          countryCode: 'BR',
          extensions: new Map([
            ['brs-scenegraph', new URL('brs-engine/brs-sg.js', document.baseURI).href],
          ]),
        },
        { debugToConsole: false },
      );
      initialized = true;
      await new Promise((resolve) => setTimeout(resolve, 100));
    } else {
      api.terminate();
    }
    api.unsubscribe('rokulab');
    api.subscribe('rokulab', callback);
    const bytes = Uint8Array.from(archive);
    api.execute(`${title.replace(/[^A-Za-z0-9._-]+/g, '-')}.zip`, bytes.buffer);
    return api.getVersion();
  };
  const result = operation.then(start, start);
  operation = result.catch(() => undefined);
  return result;
}

export async function sendCompatibilityKey(key: string): Promise<void> {
  (await loadApi()).sendKeyPress(key, 80);
}

export async function stopCompatibilityEngine(): Promise<void> {
  const stop = () => {
    if (window.brs) window.brs.terminate();
    activeCallback = undefined;
  };
  const result = operation.then(stop, stop);
  operation = result.catch(() => undefined);
  return result;
}
