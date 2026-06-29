import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useTonalExport } from '@/composables/useTonalExport';
import type { TonalStep, TonalScaleParams } from '@/utils/tonal/scale';

describe('useTonalExport', () => {
  const { generateScaleSvg } = useTonalExport();

  const mockStep = (num: number, hex: string): TonalStep => ({
    index: num,
    hex,
  });

  const mockParams: TonalScaleParams = {
    colorHex: '#808080',
    blendMode: 'multiply',
    blendStrength: 0,
    blendR: 0,
    blendG: 0,
    blendB: 0,
    middle: 0,
    spread: 0,
    satDarker: 0,
    satLighter: 0,
  };

  const mockInput = {
    fullStrip: [mockStep(50, '#f2f2f2'), mockStep(500, '#808080')],
    extendedStrip: [mockStep(100, '#e6e6e6')],
    keyStrip: [mockStep(500, '#808080')],
    params: mockParams,
    roleLabel: 'Primary',
    exportedColorLabel: 'Exported color',
    surfaceCardsLabel: 'Surface role mapping',
    stripLabels: {
      full: 'Full scale strip',
      extended: 'Extended key strip',
      key: 'Key strip',
    },
    surfaceCards: [
      { label: 'Primary Surface', tone: 100, hex: '#e6e6e6' },
      { label: 'Primary Outline', tone: 50, hex: '#808080' },
    ],
  };

  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location.href
    // JSDOM's window.location is read-only, so use Object.defineProperty
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://test.com',
      },
      writable: true,
    });
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    window.location = originalLocation as any;
  });

  it('should generate a valid SVG string', () => {
    const svg = generateScaleSvg(mockInput);

    expect(svg).toContain('<svg');
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"');
    expect(svg).toContain('</svg>');
  });

  it('should include all strips', () => {
    const svg = generateScaleSvg(mockInput);

    expect(svg).toContain('fill="#f2f2f2"');
    expect(svg).toContain('fill="#e6e6e6"');
    expect(svg).toContain('fill="#808080"');
    expect(svg).toContain('>50</text>');
    expect(svg).toContain('>500</text>');
  });

  it('should include text metadata', () => {
    const svg = generateScaleSvg(mockInput);

    expect(svg).toContain('http://test.com');
    expect(svg).toContain('colorHex');
    expect(svg).toContain('#808080');
  });

  it('labels the exported role and includes surface role cards', () => {
    const svg = generateScaleSvg(mockInput);

    expect(svg).toContain('Exported color');
    expect(svg).toContain('>Primary</text>');
    expect(svg).toContain('Surface role mapping');
    expect(svg).toContain('Primary Surface');
    expect(svg).toContain('Tone 100');
    expect(svg).toContain('Primary Outline');
  });

  it('preserves long share links and import payloads in full', () => {
    const longHash = `#${'s'.repeat(260)}tail`;
    const longUrl = `http://test.com/${longHash}`;
    const longMetadata = JSON.stringify({
      ...mockParams,
      roles: {
        surface: {
          baseHex: '#123456',
          controls: {
            contrast: 'high',
            tone: 92,
          },
        },
        primary: {
          baseHex: '#abcdef',
          controls: {
            contrast: 'medium',
            tone: 84,
          },
        },
      },
      marker: `${'payload'.repeat(45)}end`,
    });

    Object.defineProperty(window, 'location', {
      value: {
        href: longUrl,
      },
      writable: true,
    });

    const svg = generateScaleSvg({
      ...mockInput,
      metadata: longMetadata,
    });

    expect(svg).toContain(`class="footer-text" style="inline-size: `);
    expect(svg).toContain(`>${longUrl}</text>`);
    expect(svg).toContain(`>${longMetadata}</text>`);
    expect(svg).toContain(`${'s'.repeat(260)}tail`);
    expect(svg).toContain(`${'payload'.repeat(45)}end`);
    expect(svg).not.toContain('<foreignObject');
    expect(svg).not.toContain('footer-frame');
    expect(svg).not.toContain('<tspan');
    expect(svg).not.toContain('Link:');
    expect(svg).not.toContain('Import:');
    expect(svg).not.toContain('...');
  });
});
