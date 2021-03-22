
export function createCirclePts(centerX, centerY, radius, count) {
    let result = new Float64Array(count * 2);
    for (let i = 0; i < result.length; i += 2) {
        let angle = Math.PI * i / count;
        let x = centerX + radius * Math.cos(angle);
        let y = centerY + radius * Math.sin(angle);
        result[i] = x;
        result[i + 1] = y;
    }

    return result;
}

export function createSegAABB(segPoints) {
    let boxes = new Float64Array(segPoints.length * 2);
    function fillBox(i, x1, y1, x2, y2) {
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
        let x1 = segPoints[i];
        let y1 = segPoints[i + 1];
        let x2 = segPoints[i + 2];
        let y2 = segPoints[i + 3];
        fillBox(i, x1, y1, x2, y2);
    }

    fillBox(segPoints.length - 2,
        segPoints[segPoints.length - 2],
        segPoints[segPoints.length - 1],
        segPoints[0],
        segPoints[1]);

    return boxes;
}