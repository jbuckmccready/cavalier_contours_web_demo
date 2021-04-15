import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Polyline } from "@/types";

export const VERTEX_DIM = 10;
export const HIT_DELTA = VERTEX_DIM / 2;
export const COLORS = [
  0xdc2626,
  0x2563eb,
  0x059669,
  0xd97706,
  0x7c3aed,
  0xdb2777,
  0xea580c,
  0x65a30d,
  0xc026d3,
];

export enum SimpleColors {
  White = 0xffffff,
  Black = 0x000000,
  Red = 0xff0000,
  Blue = 0x0000ff,
}

export interface IRenderOptions {
  color?: number;
  fill?: boolean;
}

export class CanvasScene {
  private readonly _worldWidth: number;
  private readonly _worldHeight: number;
  private _renderer: PIXI.Renderer;
  private _stage: PIXI.Container;
  private _animation: number | null;
  private _viewport: Viewport;
  private _originContainer: PIXI.Container;
  private _worldHitBox: PIXI.Sprite;
  private _mainGraphics: PIXI.Graphics;
  private _redrawCallBack: (scene: CanvasScene) => void;

  private _mouseDownPos: null | PIXI.Point;
  private _dragHandlersEngaged: boolean;
  blockEventHandling: boolean;

  dragBeginHandler: null | ((pt: { x: number; y: number }) => boolean);
  draggingHandler: null | ((pt: { x: number; y: number }) => void);
  dragReleaseHandler: null | ((pt: { x: number; y: number }) => void);

  constructor(
    canvas: HTMLCanvasElement,
    redrawCallBack: (scene: CanvasScene) => void
  ) {
    this._redrawCallBack = redrawCallBack;
    const worldWidth = canvas.width;
    const worldHeight = canvas.height;
    this._worldWidth = worldWidth;
    this._worldHeight = worldHeight;
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
      // the interaction module is important for wheel to work properly when renderer.view is placed or scaled
      interaction: this._renderer.plugins.interaction,
    });
    this._viewport.clamp({ direction: "all" });

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

    // container positioned so (0, 0) origin is at the center
    this._originContainer = new PIXI.Container();
    this._originContainer.x = worldWidth / 2;
    this._originContainer.y = worldHeight / 2;

    // main graphics as child of the origin container (so everything drawn is with origin at center)
    this._mainGraphics = this._originContainer.addChild(new PIXI.Graphics());

    this._worldHitBox = this._originContainer.addChild(
      new PIXI.Sprite(PIXI.Texture.EMPTY)
    );
    this._worldHitBox.x = -worldWidth / 2;
    this._worldHitBox.y = -worldHeight / 2;

    this._worldHitBox.interactive = true;
    this._worldHitBox.width = worldWidth;
    this._worldHitBox.height = worldHeight;

    this._dragHandlersEngaged = false;
    this._mouseDownPos = null;
    this._worldHitBox
      .on("pointerdown", (event) => {
        if (this.blockEventHandling) {
          return;
        }

        const pos = event.data.getLocalPosition(this._originContainer);
        this._mouseDownPos = pos;
        if (this.dragBeginHandler && this.dragBeginHandler(pos)) {
          this._dragHandlersEngaged = true;
          event.stopPropagation();
        }
      })
      .on("pointermove", (event) => {
        if (
          this.blockEventHandling ||
          !this._mouseDownPos ||
          !this._dragHandlersEngaged ||
          !this.draggingHandler
        ) {
          return;
        }

        const currPos = event.data.getLocalPosition(this._originContainer);
        this.draggingHandler(currPos);
      })
      .on("pointerup", (event) => {
        if (this._dragHandlersEngaged) {
          this._mouseDownPos = null;
          this._dragHandlersEngaged = false;
          event.stopPropagation();
        }
      })
      .on("pointerupoutside", (event) => {
        if (this._dragHandlersEngaged) {
          this._mouseDownPos = null;
          this._dragHandlersEngaged = false;
          event.stopPropagation();
        }
      });

    rootContainer.addChild(this._originContainer);

    this._viewport.addListener("zoomed", () => {
      this.redrawScene();
    });
    this._viewport.addListener("moved", () => {
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

  scaledHitTest(
    pt1: { x: number; y: number },
    pt2: { x: number; y: number },
    hitDelta: number,
    minScale = 1.0
  ): boolean {
    const scale = Math.max(minScale, this.currentScale);
    return ptFuzzyEqual(pt1, pt2, hitDelta / scale);
  }

  redrawScene(): void {
    if (this._animation) {
      return;
    }
    this._animation = requestAnimationFrame(() => {
      this._animation = null;
      this._mainGraphics.clear();
      this.drawAxesLines();
      this._redrawCallBack(this);
      this._renderer.render(this._stage);
    });
  }

  drawRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options: IRenderOptions | undefined
  ): void {
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    if (fill) {
      this._mainGraphics.lineStyle(0);
      this._mainGraphics.beginFill(color);
      this._mainGraphics.drawRect(x - width / 2, y - height / 2, width, height);
      this._mainGraphics.endFill();
    } else {
      this._mainGraphics.lineStyle(1 / this.currentScale, color);
      this._mainGraphics.drawRect(x, y, width, height);
    }
  }

  drawScaledRect(
    x: number,
    y: number,
    width: number,
    height: number,
    options: IRenderOptions | undefined = undefined,
    minScale = 1.0
  ): void {
    const scale = Math.max(minScale, this.currentScale);
    this.drawRect(x, y, width / scale, height / scale, options);
  }

  drawCavcPolyline(pline: Polyline, options: IRenderOptions | undefined): void {
    const isClosed = pline.isClosed;
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    const g = this._mainGraphics;

    const radiusAndCenter = (
      x1: number,
      y1: number,
      bulge1: number,
      x2: number,
      y2: number
    ) => {
      const absBulge = Math.abs(bulge1);
      const chord = { x: x2 - x1, y: y2 - y1 };
      const chordLength = Math.sqrt(chord.x * chord.x + chord.y * chord.y);
      const radius = (chordLength * (absBulge * absBulge + 1)) / (4 * absBulge);

      const s = (absBulge * chordLength) / 2;
      const m = radius - s;
      let offsetX = (-m * chord.y) / chordLength;
      let offsetY = (m * chord.x) / chordLength;
      if (bulge1 < 0) {
        offsetX = -offsetX;
        offsetY = -offsetY;
      }

      const center = {
        x: x1 + chord.x / 2 + offsetX,
        y: y1 + chord.y / 2 + offsetY,
      };

      return { radius, center };
    };

    // const vertexData = pline.vertexData();
    // const drawSegment = (
    //   x1: number,
    //   y1: number,
    //   bulge1: number,
    //   x2: number,
    //   y2: number
    // ) => {
    //   if (Math.abs(bulge1) > 1e-4) {
    //     const { radius, center } = radiusAndCenter(x1, y1, bulge1, x2, y2);
    //     const startAngle = Math.atan2(y1 - center.y, x1 - center.x);
    //     const endAngle = Math.atan2(y2 - center.y, x2 - center.x);

    //     g.arc(center.x, center.y, radius, startAngle, endAngle, bulge1 < 0);
    //   } else {
    //     g.lineTo(x2, y2);
    //   }
    // };
    // const drawPath = () => {
    //   g.moveTo(vertexData[0], vertexData[1]);
    //   for (let i = 3; i < vertexData.length; i += 3) {
    //     const x1 = vertexData[i - 3];
    //     const y1 = vertexData[i - 2];
    //     const bulge1 = vertexData[i - 1];
    //     const x2 = vertexData[i];
    //     const y2 = vertexData[i + 1];
    //     drawSegment(x1, y1, bulge1, x2, y2);
    //   }

    //   if (isClosed) {
    //     const ln = vertexData.length;
    //     drawSegment(
    //       vertexData[ln - 3],
    //       vertexData[ln - 2],
    //       vertexData[ln - 1],
    //       vertexData[0],
    //       vertexData[1]
    //     );
    //   }
    // };

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

  private drawAxesLines() {
    // Coordinate axes and bounding box lines
    const halfWidth = this._worldWidth / 2;
    const halfHeight = this._worldHeight / 2;
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
}

function fuzzyEqual(a: number, b: number, delta = 1e-5) {
  return Math.abs(a - b) < delta;
}

function ptFuzzyEqual(
  ptA: { x: number; y: number },
  ptB: { x: number; y: number },
  delta = 1e-5
) {
  return fuzzyEqual(ptA.x, ptB.x, delta) && fuzzyEqual(ptA.y, ptB.y, delta);
}
