import { describe, expect, it } from 'vitest';
import { ManifestError, parseManifest } from '@rokulab/manifest-parser';

describe('parseManifest', () => {
  it('parses values containing equals signs', () => {
    expect(parseManifest('title=Demo\napi_url=https://example.test?a=b')).toEqual({
      title: 'Demo',
      api_url: 'https://example.test?a=b',
    });
  });
  it('rejects missing title and duplicate keys', () => {
    expect(() => parseManifest('version=1')).toThrow(ManifestError);
    expect(() => parseManifest('title=A\ntitle=B')).toThrow('Duplicate');
  });
});
