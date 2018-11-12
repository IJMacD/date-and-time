import { matrix_invert, matrix_mulitply } from './matrix';

const PATH_DETAIL = 1;

const m141 = generate141Matrix(25);
const m_inv = matrix_invert(m141);

/**
 * @param {number[][]} points
 * @returns {string}
 */
export function pointsToPath (points, detail = PATH_DETAIL) {
  switch (detail) {
    case 0:
      return pointsToPolyline(points);
    case 1:
      return controlPointsToBezier(getBSpline(points));
    case 2:
    default:
      return controlPointsToBezier(getBSpline(getReverseBSpline(points)));
  }
}

/**
 *
 * @param {number[][]} points
 */
export function pointsToPolyline (points) {
  const out = [`M ${points[0][0]} ${points[0][1]}`];

  let prevDelta = 0;

  for (let i = 1; i< points.length; i++) {
    const newDelta = Math.sqrt(
      Math.pow(points[i][0] - points[i-1][0], 2) +
      Math.pow(points[i][1] - points[i-1][1], 2)
    );
    const c = prevDelta && newDelta > 5 * prevDelta ? 'M' : 'L';
    out.push(`${c} ${points[i][0]} ${points[i][1]}`);
    prevDelta = newDelta;
  }

  return out.join(" ");
}

/**
 *
 * @param {number[][]} points
 */
export function controlPointsToBezier (points) {
  const out = [`M ${points[0][0]} ${points[0][1]}`];

  for (let i = 1; i< points.length; i++) {
    out.push(`C ${points[i][0]} ${points[i][1]} ${points[i][2]} ${points[i][3]} ${points[i][4]} ${points[i][5]}`);
  }

  return out.join(" ");
}

/**
 * Treats `points` argument as list of B control points
 * @see http://www.math.ucla.edu/~baker/149.1.02w/handouts/dd_splines.pdf
 * @param {number[][]} points
 * @returns {number[][]}
 */
export function getBSpline (points) {
  const out = [[points[0][0], points[0][1]]];

  for (let i = 1; i < points.length - 1; i++) {
    const B_1 = points[i-1];
    const B0 = points[i];
    const B1 = points[i+1];

    const B_1x = B_1[0];
    const B0x = B0[0];
    const B1x = B1[0];
    const B_1y = B_1[1];
    const B0y = B0[1];
    const B1y = B1[1];

    const S0x = B_1x / 6 + 2/3 * B0x + B1x / 6;
    const S0y = B_1y / 6 + 2/3 * B0y + B1y / 6;

    out.push([
      2/3 * B_1x + 1/3 * B0x,
      2/3 * B_1y + 1/3 * B0y,
      1/3 * B_1x + 2/3 * B0x,
      1/3 * B_1y + 2/3 * B0y,
      S0x,
      S0y,
    ]);
  }

  const Bn_1 = points[points.length - 2];
  const Bn = points[points.length - 1];

  const Bn_1x = Bn_1[0];
  const Bnx = Bn[0];
  const Bn_1y = Bn_1[1];
  const Bny = Bn[1];

  const Sn = Bn;

  out.push([
    2/3 * Bn_1x + 1/3 * Bnx,
    2/3 * Bn_1y + 1/3 * Bny,
    1/3 * Bn_1x + 2/3 * Bnx,
    1/3 * Bn_1y + 2/3 * Bny,
    Sn[0],
    Sn[1],
  ]);

  return out;
}

/**
 * Do inverse matrix calculation to solve linear equations to get S points
 * @see http://www.math.ucla.edu/~baker/149.1.02w/handouts/dd_splines.pdf
 * @param {number[][]} points
 * @returns {number[][]}
 */
export function getReverseBSpline (points) {

  const vec_x = [];
  const vec_y = [];

  vec_x.push(6 * points[1][0] - points[0][0]);
  vec_y.push(6 * points[1][1] - points[0][1]);

  const l = points.length;

  for (let i = 2; i < l - 2; i++) {
    vec_x.push(6 * points[i][0]);
    vec_y.push(6 * points[i][1]);
  }

  vec_x.push(6 * points[l-2][0] - points[l-1][0]);
  vec_y.push(6 * points[l-2][1] - points[l-1][1]);

  const Bx = matrix_mulitply(m_inv, vec_x);
  const By = matrix_mulitply(m_inv, vec_y);

  Bx.unshift(points[0][0]);
  By.unshift(points[0][1]);

  Bx.push(points[l-1][0]);
  By.push(points[l-1][1]);

  return zip(Bx, By);
}

function generate141Matrix (n) {
  const M = [];
  for (let i = 0; i < n - 2; i++) {
    const r = [];
    for (let j = 0; j < n - 2; j++) {
      if (j - i == -1) r.push(1);
      else if (j - i == 0) r.push(4);
      else if (j - i == 1) r.push(1);
      else r.push(0);
    }
    M.push(r);
  }
  return M;
}

function zip (...arrays) {
  const out = [];

  for (let i = 0; i < arrays[0].length; i++) {
    out.push(arrays.map(a => a[i]));
  }

  return out;
}