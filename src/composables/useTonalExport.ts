import type { TonalScaleParams } from '@/utils/tonal/scale';
import type { TonalStep } from '@/utils/tonal/scale';

export interface TonalExportInput {
  params: TonalScaleParams;
  fullStrip: TonalStep[];
  extendedStrip: TonalStep[];
  keyStrip: TonalStep[];
}

export const useTonalExport = () => {
  const generateScaleSvg = (input: TonalExportInput): string => {
    const { params, fullStrip, extendedStrip, keyStrip } = input;
    const swatchWidth = 40;
    const swatchHeight = 40;

    // Stack strips vertically
    const strips = [fullStrip, extendedStrip, keyStrip];
    let svgContent = '';
    let maxWidth = 0;

    strips.forEach((strip, rowIndex) => {
      const y = rowIndex * swatchHeight;
      const rowRects = strip
        .map((step, colIndex) => {
          const x = colIndex * swatchWidth;
          return `<rect x="${x}" y="${y}" width="${swatchWidth}" height="${swatchHeight}" fill="${step.hex}" />`;
        })
        .join('');

      svgContent += rowRects;
      maxWidth = Math.max(maxWidth, strip.length * swatchWidth);
    });

    const totalHeight = strips.length * swatchHeight;
    const metadata = JSON.stringify(params);

    // Position text to the right of the longest strip
    const exportTextX = maxWidth + 20;

    const exportTextUrl = `<text x="${exportTextX}" y="20" font-family="sans-serif" font-size="16">${window.location.href}</text>`;
    // wrap params in a CDATA section or just text? Text is fine.
    const exportTextParams = `<text x="${exportTextX}" y="50" font-family="monospace" font-size="12">${metadata}</text>`;

    const finalWidth = maxWidth + 800; // Buffer for text

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${finalWidth} ${totalHeight}" width="${finalWidth}" height="${totalHeight}">
        <desc>${metadata}</desc>
        ${svgContent}
        ${exportTextUrl}
        ${exportTextParams}
      </svg>
    `.trim();
  };

  return { generateScaleSvg };
};
