import type { TonalStep } from './scale';

type ExportMetadata = {
  url: string;
  exportJson: string;
};

export type TonalStripExport = {
  id: string;
  tones: TonalStep[];
};

const escapeXml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export const buildScaleSvg = (strips: TonalStripExport[], metadata: ExportMetadata): string => {
  const cellSize = 40;
  const maxColumns = Math.max(0, ...strips.map((strip) => strip.tones.length));
  const metaX = maxColumns * cellSize + 20;

  const rects = strips
    .map((strip, rowIndex) =>
      strip.tones
        .map(
          (tone, columnIndex) =>
            `<rect x="${columnIndex * cellSize}" y="${rowIndex * cellSize}" width="${cellSize}" height="${cellSize}" fill="${tone.hex}" />`,
        )
        .join(''),
    )
    .join('');

  const url = escapeXml(metadata.url);
  const params = escapeXml(metadata.exportJson);

  const urlText = `<text x="${metaX}" y="0" font-size="12pt">${url}</text>`;
  const paramsText = `<text x="${metaX}" y="16" font-size="12pt">${params}</text>`;

  return `<svg xmlns="http://www.w3.org/2000/svg">${rects}${urlText}${paramsText}</svg>`;
};
