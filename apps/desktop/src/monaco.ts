import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/editor/editor.api.js';
import editorWorker from 'monaco-editor/editor/editor.worker.js?worker';
import jsonWorker from 'monaco-editor/language/json/json.worker.js?worker';

type MonacoWorkerScope = typeof globalThis & {
  MonacoEnvironment?: { getWorker(_moduleId: string, label: string): Worker };
};

(globalThis as MonacoWorkerScope).MonacoEnvironment = {
  getWorker(_moduleId, label) {
    return label === 'json' ? new jsonWorker() : new editorWorker();
  },
};

loader.config({ monaco });
