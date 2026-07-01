import type { TonalScaleParams, TonalStep } from '@/utils/tonal/scale';

export interface TonalExportSurfaceCard {
  label: string;
  tone: number;
  hex: string;
}

export interface TonalExportInput {
  params: TonalScaleParams;
  metadata?: string;
  roleLabel?: string;
  exportedColorLabel?: string;
  surfaceCardsLabel?: string;
  stripLabels?: {
    full: string;
    extended: string;
    key: string;
  };
  sourceUrl?: string;
  fullStrip: TonalStep[];
  extendedStrip: TonalStep[];
  keyStrip: TonalStep[];
  surfaceCards?: TonalExportSurfaceCard[];
}

export interface TonalMultiRoleExportInput {
  metadata?: string;
  titleLabel?: string;
  exportedColorLabel?: string;
  surfaceCardsLabel?: string;
  stripLabels?: {
    full: string;
    extended: string;
    key: string;
  };
  sourceUrl?: string;
  roles: Array<TonalExportInput & { roleLabel: string }>;
}

const escapeXml = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

export const useTonalExport = () => {
  const width = 1600;
  const margin = 56;
  const contentWidth = width - margin * 2;
  const stripHeight = 126;
  const stripGap = 18;
  const cardColumns = 4;
  const cardGap = 16;
  const cardHeight = 104;

  const cleanPageUrl = () => {
    try {
      const url = new URL(window.location.href);
      return `${url.origin}${url.pathname}`;
    } catch {
      return window.location.href.split(/[?#]/)[0];
    }
  };

  const renderStrip = (
    label: string,
    strip: TonalStep[],
    y: number,
    options: { contentX?: number; contentWidth?: number } = {},
  ) => {
    const stripX = options.contentX ?? margin;
    const stripWidth = options.contentWidth ?? contentWidth;
    const gap = strip.length > 30 ? 1 : 4;
    const swatchWidth = (stripWidth - gap * Math.max(strip.length - 1, 0)) / strip.length;
    const swatchY = y + 30;
    const swatchHeight = 58;
    const labelFontSize = strip.length > 30 ? 7 : 11;
    const swatches = strip
      .map((step, index) => {
        const x = stripX + index * (swatchWidth + gap);
        return `
            <rect x="${x}" y="${swatchY}" width="${swatchWidth}" height="${swatchHeight}" rx="3" fill="${step.hex}" />
            <text x="${x + swatchWidth / 2}" y="${swatchY + swatchHeight + 18}" text-anchor="middle" class="tone-label" font-size="${labelFontSize}">${step.index}</text>
          `;
      })
      .join('');

    return `
        <text x="${stripX}" y="${y + 14}" class="section-title">${escapeXml(label)}</text>
        ${swatches}
      `;
  };

  const renderSurfaceCards = (
    surfaceCards: TonalExportSurfaceCard[],
    y: number,
    options: { contentX?: number; contentWidth?: number } = {},
  ) => {
    const cardsX = options.contentX ?? margin;
    const cardsWidth = options.contentWidth ?? contentWidth;
    const cardWidth = (cardsWidth - cardGap * (cardColumns - 1)) / cardColumns;

    return surfaceCards
      .map((card, index) => {
        const column = index % cardColumns;
        const row = Math.floor(index / cardColumns);
        const x = cardsX + column * (cardWidth + cardGap);
        const cardY = y + row * (cardHeight + cardGap);
        const textColor = card.tone >= 60 ? '#171923' : '#ffffff';
        const secondaryColor = card.tone >= 60 ? '#4a5568' : '#e2e8f0';

        return `
          <g>
            <rect x="${x}" y="${cardY}" width="${cardWidth}" height="${cardHeight}" rx="8" fill="${card.hex}" stroke="#111827" stroke-opacity="0.14" />
            <text x="${x + 18}" y="${cardY + 32}" font-family="Inter, Arial, sans-serif" font-size="16" font-weight="700" fill="${textColor}">${escapeXml(card.label)}</text>
            <text x="${x + 18}" y="${cardY + 62}" font-family="Inter, Arial, sans-serif" font-size="13" font-weight="600" fill="${secondaryColor}">Tone ${card.tone}</text>
            <text x="${x + cardWidth - 18}" y="${cardY + 62}" text-anchor="end" font-family="ui-monospace, SFMono-Regular, Consolas, monospace" font-size="13" fill="${secondaryColor}">${card.hex}</text>
          </g>
        `;
      })
      .join('');
  };

  const generateScaleSvg = (input: TonalExportInput): string => {
    const {
      params,
      fullStrip,
      extendedStrip,
      keyStrip,
      surfaceCards = [],
      roleLabel = 'Color',
      exportedColorLabel = 'Exported color',
      surfaceCardsLabel = 'Surface roles',
      stripLabels = {
        full: 'Full tonal scale',
        extended: 'Extended key scale',
        key: 'Key scale',
      },
    } = input;
    const headerHeight = 132;
    const cardRows = Math.ceil(surfaceCards.length / cardColumns);
    const cardsHeight = surfaceCards.length
      ? 48 + cardRows * cardHeight + Math.max(cardRows - 1, 0) * cardGap
      : 0;
    const stripsHeight = stripHeight * 3 + stripGap * 2;
    const metadata = input.metadata ?? JSON.stringify(params);
    const sourceUrl = input.sourceUrl ?? cleanPageUrl();
    const footerTextWidth = contentWidth;
    const cardToDividerGap = 42;
    const footerTextBaselineOffset = 12;
    const linkTextOffset = cardToDividerGap + footerTextBaselineOffset;
    const importTextGap = 34;
    const footerHeight = linkTextOffset + importTextGap + cardToDividerGap;
    const cardsY = headerHeight + stripsHeight + 36;
    const footerY = cardsY + cardsHeight + cardToDividerGap;
    const height = footerY + footerHeight;

    const strips = [
      renderStrip(stripLabels.full, fullStrip, headerHeight),
      renderStrip(stripLabels.extended, extendedStrip, headerHeight + stripHeight + stripGap),
      renderStrip(stripLabels.key, keyStrip, headerHeight + (stripHeight + stripGap) * 2),
    ].join('');

    const cards = renderSurfaceCards(surfaceCards, cardsY + 48);

    const sourceUrlText = escapeXml(sourceUrl);
    const metadataText = escapeXml(metadata);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <title>${escapeXml(roleLabel)} tonal scale</title>
        <desc>${escapeXml(metadata)}</desc>
        <metadata>
          <tonal-scale-export>
            <source-url>${escapeXml(sourceUrl)}</source-url>
            <import-data>${escapeXml(metadata)}</import-data>
          </tonal-scale-export>
        </metadata>
        <style>
          .canvas { fill: #f7f8fa; }
          .eyebrow { fill: #667085; font: 700 13px Inter, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
          .title { fill: #101828; font: 700 30px Inter, Arial, sans-serif; }
          .base-color { fill: #344054; font: 600 14px Inter, Arial, sans-serif; }
          .section-title { fill: #344054; font: 700 15px Inter, Arial, sans-serif; }
          .tone-label { fill: #667085; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-weight: 600; }
          .footer-text { fill: #667085; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
        </style>
        <rect class="canvas" width="${width}" height="${height}" />
        <text x="${margin}" y="42" class="eyebrow">${escapeXml(exportedColorLabel)}</text>
        <text x="${margin}" y="82" class="title">${escapeXml(roleLabel)}</text>
        <rect x="${width - margin - 210}" y="34" width="210" height="58" rx="8" fill="#ffffff" stroke="#d0d5dd" />
        <rect x="${width - margin - 194}" y="47" width="32" height="32" rx="6" fill="${params.colorHex}" />
        <text x="${width - margin - 148}" y="67" class="base-color">${params.colorHex}</text>
        ${strips}
        ${
          surfaceCards.length
            ? `<text x="${margin}" y="${cardsY + 16}" class="section-title">${escapeXml(surfaceCardsLabel)}</text>${cards}`
            : ''
        }
        <line x1="${margin}" y1="${footerY}" x2="${width - margin}" y2="${footerY}" stroke="#d0d5dd" />
        <text x="${margin}" y="${footerY + linkTextOffset}" class="footer-text" style="inline-size: ${footerTextWidth}px;">${sourceUrlText}</text>
        <text x="${margin}" y="${footerY + linkTextOffset + importTextGap}" class="footer-text" style="inline-size: ${footerTextWidth}px;">${metadataText}</text>
      </svg>
    `.trim();
  };

  const generateMultiRoleScaleSvg = (input: TonalMultiRoleExportInput): string => {
    const {
      roles,
      titleLabel = 'All color roles',
      exportedColorLabel = 'Exported colors',
      surfaceCardsLabel = 'Surface roles',
      stripLabels = {
        full: 'Full tonal scale',
        extended: 'Extended key scale',
        key: 'Key scale',
      },
    } = input;
    const metadata = input.metadata ?? JSON.stringify(roles.map((role) => role.params));
    const sourceUrl = input.sourceUrl ?? cleanPageUrl();
    const footerTextWidth = contentWidth;
    const roleHeaderHeight = 92;
    const cardsTopGap = 46;
    const roleGap = 58;
    const roleSections = roles.map((role) => {
      const cardRows = Math.ceil((role.surfaceCards?.length ?? 0) / cardColumns);
      const cardsHeight = role.surfaceCards?.length
        ? cardsTopGap + cardRows * cardHeight + Math.max(cardRows - 1, 0) * cardGap
        : 0;
      const sectionHeight = roleHeaderHeight + stripHeight * 3 + stripGap * 2 + cardsHeight;
      return { role, sectionHeight };
    });
    const headerHeight = 118;
    const footerGap = 42;
    const footerTextBaselineOffset = 12;
    const importTextGap = 34;
    const footerHeight = footerTextBaselineOffset + importTextGap + footerGap;
    const sectionsHeight =
      roleSections.reduce((total, section) => total + section.sectionHeight, 0) +
      roleGap * Math.max(roleSections.length - 1, 0);
    const footerY = headerHeight + sectionsHeight + footerGap;
    const height = footerY + footerHeight;

    let y = headerHeight;
    const sections = roleSections
      .map(({ role, sectionHeight }) => {
        const sectionY = y;
        const stripY = sectionY + roleHeaderHeight;
        const cardsY = stripY + stripHeight * 3 + stripGap * 2 + cardsTopGap;
        y += sectionHeight + roleGap;

        return `
          <g>
            <text x="${margin}" y="${sectionY + 22}" class="title">${escapeXml(role.roleLabel)}</text>
            <rect x="${width - margin - 210}" y="${sectionY}" width="210" height="58" rx="8" fill="#ffffff" stroke="#d0d5dd" />
            <rect x="${width - margin - 194}" y="${sectionY + 13}" width="32" height="32" rx="6" fill="${role.params.colorHex}" />
            <text x="${width - margin - 148}" y="${sectionY + 33}" class="base-color">${role.params.colorHex}</text>
            ${renderStrip(stripLabels.full, role.fullStrip, stripY)}
            ${renderStrip(stripLabels.extended, role.extendedStrip, stripY + stripHeight + stripGap)}
            ${renderStrip(stripLabels.key, role.keyStrip, stripY + (stripHeight + stripGap) * 2)}
            ${
              role.surfaceCards?.length
                ? `<text x="${margin}" y="${cardsY - 32}" class="section-title">${escapeXml(surfaceCardsLabel)}</text>${renderSurfaceCards(role.surfaceCards, cardsY)}`
                : ''
            }
          </g>
        `;
      })
      .join('');

    const sourceUrlText = escapeXml(sourceUrl);
    const metadataText = escapeXml(metadata);

    return `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
        <title>${escapeXml(titleLabel)} tonal scales</title>
        <desc>${escapeXml(metadata)}</desc>
        <metadata>
          <tonal-scale-export>
            <source-url>${escapeXml(sourceUrl)}</source-url>
            <import-data>${escapeXml(metadata)}</import-data>
          </tonal-scale-export>
        </metadata>
        <style>
          .canvas { fill: #f7f8fa; }
          .eyebrow { fill: #667085; font: 700 13px Inter, Arial, sans-serif; letter-spacing: 0.08em; text-transform: uppercase; }
          .title { fill: #101828; font: 700 30px Inter, Arial, sans-serif; }
          .base-color { fill: #344054; font: 600 14px Inter, Arial, sans-serif; }
          .section-title { fill: #344054; font: 700 15px Inter, Arial, sans-serif; }
          .tone-label { fill: #667085; font-family: ui-monospace, SFMono-Regular, Consolas, monospace; font-weight: 600; }
          .footer-text { fill: #667085; font: 11px ui-monospace, SFMono-Regular, Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; }
        </style>
        <rect class="canvas" width="${width}" height="${height}" />
        <text x="${margin}" y="42" class="eyebrow">${escapeXml(exportedColorLabel)}</text>
        <text x="${margin}" y="82" class="title">${escapeXml(titleLabel)}</text>
        ${sections}
        <line x1="${margin}" y1="${footerY}" x2="${width - margin}" y2="${footerY}" stroke="#d0d5dd" />
        <text x="${margin}" y="${footerY + footerTextBaselineOffset}" class="footer-text" style="inline-size: ${footerTextWidth}px;">${sourceUrlText}</text>
        <text x="${margin}" y="${footerY + footerTextBaselineOffset + importTextGap}" class="footer-text" style="inline-size: ${footerTextWidth}px;">${metadataText}</text>
      </svg>
    `.trim();
  };

  return { generateScaleSvg, generateMultiRoleScaleSvg };
};
