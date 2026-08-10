import type { Manifest } from '@rokulab/shared';

export class ManifestError extends Error {
  override name = 'ManifestError';
}

export function parseManifest(source: string): Manifest {
  const manifest: Manifest = {};
  source.split(/\r?\n/).forEach((rawLine, index) => {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) return;
    const separator = line.indexOf('=');
    if (separator < 1) throw new ManifestError(`Invalid manifest entry at line ${index + 1}`);
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    if (key in manifest) throw new ManifestError(`Duplicate manifest key: ${key}`);
    manifest[key] = value;
  });
  if (!manifest.title) throw new ManifestError('Manifest must define title');
  return manifest;
}
