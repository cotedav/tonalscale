//////////////////////////// ------ ////////////////////////////
//////////////////////////// EASING ////////////////////////////
////////////////////////////--------////////////////////////////

function easeInOutQuad(range, position) {
  let x = position / range;
  return 4 * x * (1 - x);
}

function easeInSine(t) {
  return 1 - Math.cos((t * Math.PI) / 2);
}

function cubicBezier(p1x, p1y, p2x, p2y) {
  return function (t) {
    const t1 = 1 - t;
    const t1_2 = t1 * t1;
    const t1_3 = t1_2 * t1;
    const t2 = t * t;
    const t3 = t2 * t;

    let x = t1_3 * 0 + 3 * t1_2 * t * p1x + 3 * t1 * t2 * p2x + t3 * 1;
    const y = t1_3 * 0 + 3 * t1_2 * t * p1y + 3 * t1 * t2 * p2y + t3 * 1;

    return { x, y };
  };
}
