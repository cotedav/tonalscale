import { describe, expect, it } from 'vitest';

import { buildScaleSvg, type TonalStripExport } from '@/utils/tonal/export';

describe('buildScaleSvg', () => {
  it('serializes visible strips with metadata', () => {
    const strips: TonalStripExport[] = [
      {
        id: 'full',
        tones: [
          { index: 0, hex: '#000000' },
          { index: 1, hex: '#111111' },
        ],
      },
      {
        id: 'key',
        tones: [{ index: 100, hex: '#ffffff' }],
      },
    ];

    const svg = buildScaleSvg(strips, {
      url: 'https://example.com',
      exportJson: '{"colorHex":"000000"}',
    });

    expect(svg).toContain('rect x="0" y="0"');
    expect(svg).toContain('rect x="40" y="0"');
    expect(svg).toContain('rect x="0" y="40"');
    expect(svg).toContain('#ffffff');
    expect(svg).toContain('https://example.com');
    expect(svg).toContain('{&quot;colorHex&quot;');
  });
});
