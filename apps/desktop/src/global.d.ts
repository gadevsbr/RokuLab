import type { ProjectSnapshot } from '@rokulab/shared';
declare global {
  interface Window {
    rokulab?: {
      chooseProject(): Promise<ProjectSnapshot | null>;
      openPath(path: string): Promise<ProjectSnapshot>;
      openExample(): Promise<ProjectSnapshot>;
    };
  }
}
export {};
