export const easeInOutQuad = (range: number, position: number): number => {
  if (range === 0) return 0;
  const x = position / range;
  return 4 * x * (1 - x);
};

export const easeInSine = (t: number): number => 1 - Math.cos((t * Math.PI) / 2);

export const cubicBezier =
  (p1x: number, p1y: number, p2x: number, p2y: number) =>
  (t: number): { x: number; y: number } => {
    const t1 = 1 - t;
    const t1Squared = t1 * t1;
    const t1Cubed = t1Squared * t1;
    const t2 = t * t;
    const t3 = t2 * t;

    const x = t1Cubed * 0 + 3 * t1Squared * t * p1x + 3 * t1 * t2 * p2x + t3 * 1;
    const y = t1Cubed * 0 + 3 * t1Squared * t * p1y + 3 * t1 * t2 * p2y + t3 * 1;

    return { x, y };
  };

export const getIntensityCurve = (middle: number, spread: number) => {
  let p1x = 0.42;
  let p2x = 0.58;
  const factor = Math.abs(middle / 0.5 - 1);
  let effectiveSpread = spread;

  if (middle <= 0.5) {
    p1x += (1 - p1x) * factor;
    effectiveSpread = (1 - p1x) * spread;
  } else {
    p2x -= p2x * factor;
    effectiveSpread = p2x * spread;
  }

  p1x += effectiveSpread;
  p2x -= effectiveSpread;

  return cubicBezier(p1x, 0, p2x, 1);
};

export const getIntensity = (
  curve: (t: number) => { x: number; y: number },
  i: number,
  luminance: number,
): number => {
  if (i === 0 || i === luminance) return 0;

  const positionOnCurve = curve(i / luminance);
  const halfpoint = curve(0.5);
  const progress = positionOnCurve.x;

  let progressN = progress / halfpoint.y;
  progressN = progress < halfpoint.y ? progressN : 1 - (progressN - 1);

  return progressN;
};
