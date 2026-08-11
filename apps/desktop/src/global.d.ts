import type { ProjectChange, ProjectFileContent, ProjectSnapshot } from '@rokulab/shared';
declare global {
  interface Window {
    rokulab?: {
      chooseProject(): Promise<ProjectSnapshot | null>;
      initialProject(): Promise<ProjectSnapshot | null>;
      openPath(path: string): Promise<ProjectSnapshot>;
      openExample(): Promise<ProjectSnapshot>;
      readFile(relative: string): Promise<ProjectFileContent>;
      writeFile(relative: string, content: string): Promise<ProjectFileContent>;
      archiveProject(): Promise<Uint8Array>;
      onProjectChanged(listener: (change: ProjectChange) => void): () => void;
      onWatchError(listener: (message: string) => void): () => void;
    };
  }
}
export {};
