export const VERTEX_DIM = 10;
export const HIT_DELTA = VERTEX_DIM / 2;
export const COLORS = [
  "#DC2626",
  "#2563EB",
  "#059669",
  "#D97706",
  "#7C3AED",
  "#DB2777",
  "#EA580C",
  "#65A30D",
  "#C026D3",
];

export class CanvasScene {
  // canvas: HTMLCanvasElement;
  // ctx: CanvasRenderingContext2D;
  // redrawCallBack: (scene: CanvasScene) => void;
  // _animation: number;
  // blockEventHandling: boolean;
  constructor(canvas, redrawCallBack) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.redrawCallBack = redrawCallBack;
    this._animation = null;
    this.blockEventHandling = false;
    this.dragBeginHandler = null;
    this.draggingHandler = null;
    this.dragReleaseHandler = null;
    this.cursorPosCallBack = null;
    trackTransforms(this.ctx);
    this.ctx.translate(canvas.width / 2, canvas.height / 2);
    this.ctx.scale(1, -1);
  }

  get currentScale() {
    return this.ctx.getTransform().a;
  }

  scaledHitTest(pt1, pt2, hitDelta, minScale = 1.0) {
    const scale = Math.max(minScale, this.currentScale);
    return ptFuzzyEqual(pt1, pt2, hitDelta / scale);
  }

  drawRect(minX, minY, maxX, maxY, options = {}) {
    const color = options?.color === undefined ? "black" : options.color;
    if (options.fill) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(minX, minY, maxX - minX, maxY - minY);
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.strokeRect(minX, minY, maxX - minX, maxY - minY);
    }
  }

  drawScaledRectAtPoint(centerX, centerY, dim, options = {}, minScale = 1.0) {
    let scaledDim = dim / this.currentScale;
    scaledDim = scaledDim > minScale * dim ? dim : scaledDim;
    const halfScaledDim = scaledDim / 2;
    this.drawRect(
      centerX - halfScaledDim,
      centerY - halfScaledDim,
      centerX + halfScaledDim,
      centerY + halfScaledDim,
      options
    );
  }

  drawPolyline(polyline, options = {}) {
    const isClosed = options?.isClosed === undefined ? true : options.isClosed;
    const color = options?.color === undefined ? "black" : options.color;
    this.ctx.beginPath();
    this.ctx.moveTo(polyline[0].x, polyline[0].y);
    for (let i = 1; i < polyline.length; ++i) {
      this.ctx.lineTo(polyline[i].x, polyline[i].y);
    }
    if (isClosed) {
      this.ctx.closePath();
    }
    if (isClosed && options?.fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  drawPolylineArray(polyline, options = {}) {
    const isClosed = options?.isClosed === undefined ? true : options.isClosed;
    const color = options?.color === undefined ? "black" : options.color;
    this.ctx.beginPath();
    this.ctx.moveTo(polyline[0], polyline[1]);
    for (let i = 2; i < polyline.length; i += 2) {
      this.ctx.lineTo(polyline[i], polyline[i + 1]);
    }
    if (isClosed) {
      this.ctx.closePath();
    }
    if (isClosed && options?.fill) {
      this.ctx.fillStyle = color;
      this.ctx.fill();
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  drawCavcPolyline(polyline, options = {}) {
    const isClosed = polyline.isClosed;
    const color = options?.color === undefined ? "black" : options.color;
    const noTransparency =
      options?.noTransparency === undefined ? false : options.noTransparency;
    const lineData = polyline.arcsToApproxLinesData(1e-2);
    this.ctx.beginPath();
    this.ctx.moveTo(lineData[0], lineData[1]);
    for (let i = 2; i < lineData.length; i += 2) {
      this.ctx.lineTo(lineData[i], lineData[i + 1]);
    }
    if (isClosed) {
      this.ctx.closePath();
    }
    if (isClosed && options?.fill) {
      this.ctx.strokeStyle = "black";
      this.ctx.stroke();
      if (!noTransparency) {
        this.ctx.globalAlpha = 0.7;
      }
      this.ctx.fillStyle = color;
      this.ctx.fill();
      this.ctx.globalAlpha = 1.0;
    } else {
      this.ctx.strokeStyle = color;
      this.ctx.stroke();
    }
  }

  drawText(text, x, y, options = {}) {
    const currentScale = this.currentScale;
    this.ctx.save();
    this.ctx.scale(1 / currentScale, -1 / currentScale);
    this.ctx.font = "30px Arial";
    const color = options?.color === undefined ? "black" : options.color;
    this.ctx.fillStyle = color;
    this.ctx.textAlign = "center";
    this.ctx.fillText(text, currentScale * x, currentScale * -y);
    this.ctx.restore();
  }

  redrawScene() {
    if (!this._animation) {
      this._animation = window.requestAnimationFrame(() => {
        this._animation = null;
        // Clear the entire canvas
        const p1 = this.ctx.transformedPoint(0, 0);
        const p2 = this.ctx.transformedPoint(
          this.canvas.width,
          this.canvas.height
        );
        this.ctx.clearRect(p1.x, p1.y, p2.x - p1.x, p2.y - p1.y);
        this.ctx.save();
        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.restore();
        // scale line width with the current zoom
        this.ctx.lineWidth = 1 / this.currentScale;
        this.ctx.strokeStyle = "black";
        this.ctx.beginPath();
        const halfWidth = this.canvas.width / 2;
        const halfHeight = this.canvas.height / 2;
        // y axis
        this.ctx.moveTo(0, -halfHeight);
        this.ctx.lineTo(0, halfHeight);
        // x axis
        this.ctx.moveTo(-halfWidth, 0);
        this.ctx.lineTo(halfWidth, 0);
        // border
        this.ctx.moveTo(-halfWidth, -halfHeight);
        this.ctx.lineTo(-halfWidth, halfHeight);
        this.ctx.lineTo(halfWidth, halfHeight);
        this.ctx.lineTo(halfWidth, -halfHeight);
        this.ctx.lineTo(-halfWidth, -halfHeight);
        this.ctx.stroke();
        this.redrawCallBack(this);
      });
    }
  }

  connectEvents() {
    let lastX = this.canvas.width / 2;
    let lastY = this.canvas.height / 2;
    const ctx = this.ctx;
    let dragStart;
    let dragHandlersEngaged = false;
    this.canvas.addEventListener("mousedown", (evt) => {
      if (this.blockEventHandling) {
        return;
      }
      if (evt.shiftKey) {
        zoom(-1);
        return;
      }
      if (evt.ctrlKey) {
        zoom(1);
        return;
      }
      document.body.style.mozUserSelect = document.body.style.userSelect =
        "none";
      lastX = evt.pageX - this.canvas.offsetLeft;
      lastY = evt.pageY - this.canvas.offsetTop;
      dragStart = ctx.transformedPoint(lastX, lastY);
      if (this.dragBeginHandler && this.dragBeginHandler(dragStart)) {
        dragHandlersEngaged = true;
        const mouseUpHandler = (evt) => {
          dragHandlersEngaged = false;
          dragStart = null;
          if (this.dragReleaseHandler) {
            const x = evt.pageX - this.canvas.offsetLeft;
            const y = evt.pageY - this.canvas.offsetTop;
            this.dragReleaseHandler(ctx.transformedPoint(x, y));
          }
        };
        document.addEventListener("mouseup", mouseUpHandler, {
          capture: true,
          once: true,
        });
        return;
      }
      document.addEventListener("mouseup", () => (dragStart = null), {
        capture: true,
        once: true,
      });
    });
    document.addEventListener("mousemove", (evt) => {
      if (this.blockEventHandling) {
        return;
      }
      lastX = evt.pageX - this.canvas.offsetLeft;
      lastY = evt.pageY - this.canvas.offsetTop;
      const pt = ctx.transformedPoint(lastX, lastY);
      if (this.cursorPosCallBack) {
        this.cursorPosCallBack(pt);
      }
      if (dragHandlersEngaged && this.draggingHandler) {
        this.draggingHandler(pt);
        return;
      }
      if (dragStart) {
        ctx.translate(pt.x - dragStart.x, pt.y - dragStart.y);
        this.redrawScene();
      }
    });
    const scaleFactor = 1.1;
    let zoom = (clicks) => {
      const pt = ctx.transformedPoint(lastX, lastY);
      ctx.translate(pt.x, pt.y);
      const factor = Math.pow(scaleFactor, clicks);
      ctx.scale(factor, factor);
      ctx.translate(-pt.x, -pt.y);
      this.redrawScene();
    };
    const handleScroll = (evt) => {
      if (this.blockEventHandling) {
        return;
      }
      const delta = evt.wheelDelta
        ? evt.wheelDelta / 40
        : evt.detail
        ? -evt.detail
        : 0;
      if (delta) zoom(delta);
      return evt.preventDefault() && false;
    };
    this.canvas.addEventListener("DOMMouseScroll", handleScroll);
    this.canvas.addEventListener("mousewheel", handleScroll);
  }
}

function fuzzyEqual(a, b, delta = 1e-5) {
  return Math.abs(a - b) < delta;
}

function ptFuzzyEqual(ptA, ptB, delta = 1e-5) {
  return fuzzyEqual(ptA.x, ptB.x, delta) && fuzzyEqual(ptA.y, ptB.y, delta);
}

function trackTransforms(ctx) {
  let xform = new DOMMatrix();
  ctx.getTransform = function () {
    return xform;
  };

  const savedTransforms = [];
  const save = ctx.save;
  ctx.save = function () {
    savedTransforms.push(xform.translate(0, 0));
    return save.call(ctx);
  };

  const restore = ctx.restore;
  ctx.restore = function () {
    xform = savedTransforms.pop();
    return restore.call(ctx);
  };

  const scale = ctx.scale;
  ctx.scale = function (sx, sy) {
    xform = xform.scaleSelf(sx, sy);
    return scale.call(ctx, sx, sy);
  };

  const rotate = ctx.rotate;
  ctx.rotate = function (radians) {
    xform = xform.rotate((radians * 180) / Math.PI);
    return rotate.call(ctx, radians);
  };

  const translate = ctx.translate;
  ctx.translate = function (dx, dy) {
    xform = xform.translate(dx, dy);
    return translate.call(ctx, dx, dy);
  };

  const transform = ctx.transform;
  ctx.transform = function (a, b, c, d, e, f) {
    const m2 = new DOMMatrix();
    m2.a = a;
    m2.b = b;
    m2.c = c;
    m2.d = d;
    m2.e = e;
    m2.f = f;
    xform = xform.multiply(m2);
    return transform.call(ctx, a, b, c, d, e, f);
  };

  const setTransform = ctx.setTransform;
  ctx.setTransform = function (a, b, c, d, e, f) {
    xform.a = a;
    xform.b = b;
    xform.c = c;
    xform.d = d;
    xform.e = e;
    xform.f = f;
    return setTransform.call(ctx, a, b, c, d, e, f);
  };

  const pt = new DOMPoint();
  ctx.transformedPoint = function (x, y) {
    pt.x = x;
    pt.y = y;
    return pt.matrixTransform(xform.inverse());
  };
}
