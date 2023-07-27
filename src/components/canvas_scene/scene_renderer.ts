import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Polyline, plineArcsToApproxLines } from "cavalier_contours_web_ffi";
import { Pline } from "@/core/cavc_json_types";

export enum SimpleColors {
  White = 0xffffff,
  Black = 0x000000,
  Gray = 0x808080,
  Red = 0xdc2626,
  Blue = 0x2563eb,
  Green = 0x059669,
  Orange = 0xd97706,
  Purple = 0x7c3aed,
  Magenta = 0xdb2777,
  BurntOrange = 0xea580c,
  Lime = 0x65a30d,
  Fuchsia = 0xc026d3,
}

export const VERTEX_DIM = 10;
export const HIT_DELTA = VERTEX_DIM / 2;
export const COLORS = [
  SimpleColors.Red,
  SimpleColors.Blue,
  SimpleColors.Green,
  SimpleColors.Orange,
  SimpleColors.Purple,
  SimpleColors.Magenta,
  SimpleColors.BurntOrange,
  SimpleColors.Lime,
  SimpleColors.Fuchsia,
];

export type Point = {
  x: number;
  y: number;
};
export type CavcRawOffsetSeg =
  | {
      isArc: false;
      startPoint: Point;
      endPoint: Point;
      collapsedArc: boolean;
    }
  | {
      isArc: true;
      startPoint: Point;
      endPoint: Point;
      arcRadius: number;
      arcCenter: Point;
      isCCW: boolean;
    };

export interface IRenderOptions {
  color?: number;
  fill?: boolean;
  alpha?: number;
}

export class SceneRenderer {
  private readonly _renderer: PIXI.Renderer;
  private readonly _stage: PIXI.Container;
  private _animation: number | null;
  private readonly _viewport: Viewport;
  private readonly _originContainer: PIXI.Container;
  private readonly _worldHitBox: PIXI.Sprite;
  private readonly _mainGraphics: PIXI.Graphics;
  private readonly _cursorPosText: PIXI.Text;
  private _drawToScene: (scene: SceneRenderer) => void;

  private _mouseDownPos: null | PIXI.Point;
  private _dragHandlersEngaged: boolean;
  blockEventHandling: boolean;

  dragBeginHandler: null | ((pt: { x: number; y: number }) => boolean);
  draggingHandler: null | ((pt: { x: number; y: number }) => void);
  dragReleaseHandler: null | (() => void);

  constructor(canvas: HTMLCanvasElement, onRender: (renderer: SceneRenderer) => void) {
    this._drawToScene = onRender;
    const worldWidth = canvas.width;
    const worldHeight = canvas.height;
    // not using PIXI.Application to control the rendering update loop using requestAnimationFrame
    // (default PIXI.Application uses high cpu/gpu constantly for maximum performance in games)
    this._renderer = new PIXI.Renderer({
      view: canvas,
      backgroundColor: SimpleColors.White,
      width: worldWidth,
      height: worldHeight,
      antialias: true,
    });

    // create viewport
    this._viewport = new Viewport({
      screenWidth: worldWidth,
      screenHeight: worldHeight,
      worldWidth: worldWidth,
      worldHeight: worldHeight,
      interaction: this._renderer.plugins.interaction,
    });
    // this._viewport.clamp({ direction: "all" });

    this._stage = new PIXI.Container();

    // add the viewport to the stage
    this._stage.addChild(this._viewport);

    // activate plugins
    this._viewport.drag().pinch().wheel();

    // root container with inverted y
    const rootContainer = new PIXI.Container();
    rootContainer.setTransform(
      worldWidth / 2,
      worldHeight / 2,
      1,
      -1,
      undefined,
      undefined,
      undefined,
      worldWidth / 2,
      worldHeight / 2
    );
    this._viewport.addChild(rootContainer);

    // const mask = new PIXI.Graphics();
    // mask.drawRect(0, 0, worldWidth, worldHeight);
    // mask.isMask = true;
    // this._viewport.addChild(mask);
    // this._viewport.mask = mask;

    // container positioned so (0, 0) origin is at the center
    this._originContainer = new PIXI.Container();
    this._originContainer.x = worldWidth / 2;
    this._originContainer.y = worldHeight / 2;

    // main graphics as child of the origin container (so everything drawn is with origin at center)
    this._mainGraphics = this._originContainer.addChild(new PIXI.Graphics());

    this._worldHitBox = this._originContainer.addChild(new PIXI.Sprite(PIXI.Texture.EMPTY));
    this._worldHitBox.x = -worldWidth / 2;
    this._worldHitBox.y = -worldHeight / 2;

    this._worldHitBox.interactive = true;
    this._worldHitBox.width = worldWidth;
    this._worldHitBox.height = worldHeight;

    this._dragHandlersEngaged = false;
    this._mouseDownPos = null;
    this._viewport
      .on("pointerdown", (event) => {
        if (this.blockEventHandling) {
          return;
        }

        const pos = event.data.getLocalPosition(this._originContainer);
        this._mouseDownPos = pos;
        if (this.dragBeginHandler && this.dragBeginHandler(pos)) {
          this._viewport.plugins.pause("drag");
          this._dragHandlersEngaged = true;
          event.stopPropagation();
        }
      })
      .on("pointermove", (event) => {
        const currPos = event.data.getLocalPosition(this._originContainer);
        this.updateCursorPosition(currPos);
        // only need to render the stage (not calling redrawScene which will invoke the
        // redrawCallBack)
        this._renderer.render(this._stage);

        if (
          this.blockEventHandling ||
          !this._mouseDownPos ||
          !this._dragHandlersEngaged ||
          !this.draggingHandler
        ) {
          return;
        }

        this.draggingHandler(currPos);
      })
      .on("pointerup", (event) => {
        if (this._dragHandlersEngaged) {
          this._mouseDownPos = null;
          this._dragHandlersEngaged = false;
          if (this.dragReleaseHandler) {
            this.dragReleaseHandler();
          }
          event.stopPropagation();
        }
        this._viewport.plugins.resume("drag");
      })
      .on("pointerupoutside", (event) => {
        if (this._dragHandlersEngaged) {
          this._mouseDownPos = null;
          this._dragHandlersEngaged = false;
          event.stopPropagation();
        }
        this._viewport.plugins.resume("drag");
      })
      .on("zoomed", () => {
        this.redrawScene();
      });

    rootContainer.addChild(this._originContainer);

    this._cursorPosText = this._stage.addChild(new PIXI.Text("(0.000, 0.000)"));

    const resetViewText = this._stage.addChild(new PIXI.Text("Reset View"));
    resetViewText.y = this._cursorPosText.height;
    resetViewText.interactive = true;
    resetViewText.on("pointerup", () => {
      this._viewport.scaled = 1.0;
      this._viewport.moveCenter(new PIXI.Point(worldWidth / 2, worldHeight / 2));
      this.redrawScene();
    });

    this._animation = null;
    this.blockEventHandling = false;
    this.dragBeginHandler = null;
    this.dragReleaseHandler = null;
    this.draggingHandler = null;
    this.redrawScene();
  }

  get currentScale(): number {
    return this._viewport.scale.x;
  }

  resize(width: number, height: number): void {
    this._renderer.resize(width, height);
    this._viewport.resize(width, height);
    this._renderer.render(this._stage);
  }

  center(): void {
    this._viewport.moveCenter(
      new PIXI.Point(this._worldHitBox.width / 2, this._worldHitBox.height / 2)
    );
  }

  scaledHitTest(
    pt1: { x: number; y: number },
    pt2: { x: number; y: number },
    hitDelta: number
  ): boolean {
    return ptFuzzyEqual(pt1, pt2, hitDelta / this.currentScale);
  }

  redrawScene(): void {
    if (this._animation) {
      return;
    }
    this._animation = requestAnimationFrame(() => {
      this._animation = null;
      this._mainGraphics.clear();
      this._mainGraphics.removeChildren(0, this._mainGraphics.children.length);
      this.drawAxesLines();
      this._drawToScene(this);
      this._renderer.render(this._stage);
    });
  }

  drawRect(x: number, y: number, width: number, height: number, options?: IRenderOptions): void {
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    const g = this.getDrawingGraphics(options);
    if (fill) {
      g.lineStyle(0);
      g.beginFill(color);
      g.drawRect(x - width / 2, y - height / 2, width, height);
      g.endFill();
    } else {
      g.lineStyle(1 / this.currentScale, color);
      g.drawRect(x - width / 2, y - height / 2, width, height);
    }
  }

  drawRectFromBounds(
    minX: number,
    minY: number,
    maxX: number,
    maxY: number,
    options?: IRenderOptions
  ): void {
    const width = maxX - minX;
    const height = maxY - minY;
    const x = minX + width / 2;
    const y = minY + height / 2;
    this.drawRect(x, y, width, height, options);
  }

  drawScaledRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options?: IRenderOptions
  ): void {
    const scale = this.currentScale;
    this.drawRect(x, y, width / scale, height / scale, options);
  }

  drawPline(pline: Pline, options?: IRenderOptions): void {
    const isClosed = pline.isClosed;
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    const g = this.getDrawingGraphics(options);

    const lineData: Pline = plineArcsToApproxLines(pline, 1e-2);
    const drawPath = () => {
      const firstVertex = lineData.vertexes[0];
      g.moveTo(firstVertex[0], firstVertex[1]);
      for (let i = 1; i < lineData.vertexes.length; i++) {
        const vertex = lineData.vertexes[i];
        g.lineTo(vertex[0], vertex[1]);
      }
      if (isClosed) {
        g.closePath();
      }
    };

    if (fill) {
      g.lineStyle(0);
      g.beginFill(color);
      drawPath();
      g.endFill();
    } else {
      g.lineStyle(1 / this.currentScale, color);
      drawPath();
    }
  }
  drawCavcPolyline(pline: Polyline, options?: IRenderOptions): void {
    const isClosed = pline.isClosed;
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    const g = this.getDrawingGraphics(options);

    const lineData = pline.arcsToApproxLinesData(1e-2);
    const drawPath = () => {
      g.moveTo(lineData[0], lineData[1]);
      for (let i = 2; i < lineData.length; i += 2) {
        g.lineTo(lineData[i], lineData[i + 1]);
      }
      if (isClosed) {
        g.closePath();
      }
    };

    if (fill) {
      g.lineStyle(0);
      g.beginFill(color);
      drawPath();
      g.endFill();
    } else {
      g.lineStyle(1 / this.currentScale, color);
      drawPath();
    }
  }

  drawCavcRawOffsetSegs(pline: Polyline, offset: number): void {
    const segs: CavcRawOffsetSeg[] = pline.rawOffsetSegs(offset);

    const g = this._mainGraphics;
    const getAngle = (center: Point, p: Point) => {
      return Math.atan2(p.y - center.y, p.x - center.x);
    };

    const lineWidth = 1 / this.currentScale;
    for (let i = 0; i < segs.length; ++i) {
      const seg = segs[i];
      g.moveTo(seg.startPoint.x, seg.startPoint.y);
      if (seg.isArc) {
        g.lineStyle(lineWidth, SimpleColors.Purple);
        const startAngle = getAngle(seg.arcCenter, seg.startPoint);
        const endAngle = getAngle(seg.arcCenter, seg.endPoint);
        g.arc(seg.arcCenter.x, seg.arcCenter.y, seg.arcRadius, startAngle, endAngle, !seg.isCCW);
      } else {
        if (seg.collapsedArc) {
          g.lineStyle(lineWidth, SimpleColors.Red);
        } else {
          g.lineStyle(lineWidth, SimpleColors.Purple);
        }
        g.lineTo(seg.endPoint.x, seg.endPoint.y);
      }
    }
  }

  drawPolygon(lineData: Float64Array, options?: IRenderOptions): void {
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    const g = this.getDrawingGraphics(options);

    const drawPath = () => {
      g.moveTo(lineData[0], lineData[1]);
      for (let i = 2; i < lineData.length; i += 2) {
        g.lineTo(lineData[i], lineData[i + 1]);
      }
      g.closePath();
    };

    if (fill) {
      g.lineStyle(0);
      g.beginFill(color);
      drawPath();
      g.endFill();
    } else {
      g.lineStyle(1 / this.currentScale, color);
      drawPath();
    }
  }

  drawCircle(x: number, y: number, radius: number, options?: IRenderOptions): void {
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;

    const g = this.getDrawingGraphics(options);

    if (fill) {
      g.lineStyle(0);
      g.beginFill(color);
      g.drawCircle(x, y, radius);
      g.endFill();
    } else {
      g.lineStyle(1 / this.currentScale, color);
      g.drawCircle(x, y, radius);
    }
  }

  private getDrawingGraphics(options?: IRenderOptions): PIXI.Graphics {
    // have to spawn child graphics object for alpha blending between graphics
    const alpha = Math.min(Math.max(options?.alpha ?? 1.0, 0.0), 1.0);
    const g = alpha !== 1.0 ? this._mainGraphics.addChild(new PIXI.Graphics()) : this._mainGraphics;
    g.alpha = alpha;
    return g;
  }

  private drawAxesLines() {
    // Coordinate axes and bounding box lines
    // const halfWidth = this._worldWidth / 2;
    // const halfHeight = this._worldHeight / 2;
    const halfWidth = 1e6;
    const halfHeight = 1e6;
    this._mainGraphics.lineStyle(1 / this.currentScale, SimpleColors.Black);
    // scene border
    this._mainGraphics.moveTo(-halfWidth, -halfHeight);
    this._mainGraphics.lineTo(-halfWidth, halfHeight);
    this._mainGraphics.lineTo(halfWidth, halfHeight);
    this._mainGraphics.lineTo(halfWidth, -halfHeight);
    this._mainGraphics.closePath();
    // axes lines
    // x axes
    this._mainGraphics.moveTo(-halfWidth, 0);
    this._mainGraphics.lineTo(halfWidth, 0);
    // y axes
    this._mainGraphics.moveTo(0, -halfHeight);
    this._mainGraphics.lineTo(0, halfHeight);
  }

  private updateCursorPosition(pos: { x: number; y: number }) {
    this._cursorPosText.text = `(${pos.x.toFixed(3)}, ${pos.y.toFixed(3)})`;
  }
}

function fuzzyEqual(a: number, b: number, delta = 1e-5) {
  return Math.abs(a - b) < delta;
}

function ptFuzzyEqual(ptA: { x: number; y: number }, ptB: { x: number; y: number }, delta = 1e-5) {
  return fuzzyEqual(ptA.x, ptB.x, delta) && fuzzyEqual(ptA.y, ptB.y, delta);
}
