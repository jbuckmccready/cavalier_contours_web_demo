export function createCirclePts(
  centerX: number,
  centerY: number,
  radius: number,
  count: number
) {
  const result = new Float64Array(count * 2);
  for (let i = 0; i < result.length; i += 2) {
    const angle = (Math.PI * i) / count;
    const x = centerX + radius * Math.cos(angle);
    const y = centerY + radius * Math.sin(angle);
    result[i] = x;
    result[i + 1] = y;
  }

  return result;
}

export function createSegAABB(segPoints: any) {
  const boxes = new Float64Array(segPoints.length * 2);
  function fillBox(i: any, x1: any, y1: any, x2: any, y2: any) {
    let minX;
    let minY;
    let maxX;
    let maxY;
    if (x1 < x2) {
      minX = x1;
      maxX = x2;
    } else {
      minX = x2;
      maxX = x1;
    }

    if (y1 < y2) {
      minY = y1;
      maxY = y2;
    } else {
      minY = y2;
      maxY = y1;
    }
    boxes[2 * i] = minX;
    boxes[2 * i + 1] = minY;
    boxes[2 * i + 2] = maxX;
    boxes[2 * i + 3] = maxY;
  }

  for (let i = 0; i < segPoints.length - 2; i += 2) {
    const x1 = segPoints[i];
    const y1 = segPoints[i + 1];
    const x2 = segPoints[i + 2];
    const y2 = segPoints[i + 3];
    fillBox(i, x1, y1, x2, y2);
  }

  fillBox(
    segPoints.length - 2,
    segPoints[segPoints.length - 2],
    segPoints[segPoints.length - 1],
    segPoints[0],
    segPoints[1]
  );

  return boxes;
}

export function createRectanglePlineVertexes(
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
) {
  return new Float64Array([
    minX,
    minY,
    0,
    maxX,
    minY,
    0,
    maxX,
    maxY,
    0,
    minX,
    maxY,
    0,
  ]);
}

export function createCirclePlineVertexes(
  centerX: number,
  centerY: number,
  radius: number
) {
  return new Float64Array([
    centerX - radius,
    centerY,
    1,
    centerX + radius,
    centerY,
    1,
  ]);
}

export function createExample1PlineVertexes(scale: number | undefined) {
  const scaleToApply = scale ?? 1.0;
  const result = new Float64Array([
    10,
    10,
    -0.5,
    8,
    9,
    0.374794619217547,
    21,
    0,
    0,
    23,
    0,
    1,
    32,
    0,
    -0.5,
    28,
    0,
    0.5,
    39,
    21,
    0,
    28,
    12,
    0.5,
  ]);

  for (let i = 0; i < result.length; i += 3) {
    result[i] = result[i] * scaleToApply;
    result[i + 1] = result[i + 1] * scaleToApply;
  }

  return result;
}
