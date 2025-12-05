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
  });

  it('should include text metadata', () => {
    const svg = generateScaleSvg(mockInput);

    expect(svg).toContain('http://test.com');
    expect(svg).toContain('colorHex');
    expect(svg).toContain('#808080');
  });
});
