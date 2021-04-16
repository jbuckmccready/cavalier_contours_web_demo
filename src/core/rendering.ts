import * as PIXI from "pixi.js";
import { Viewport } from "pixi-viewport";
import { Polyline } from "@/types";

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

export interface IRenderOptions {
  color?: number;
  fill?: boolean;
}

export class CanvasScene {
  private readonly _worldWidth: number;
  private readonly _worldHeight: number;
  private readonly _renderer: PIXI.Renderer;
  private readonly _stage: PIXI.Container;
  private _animation: number | null;
  private readonly _viewport: Viewport;
  private readonly _originContainer: PIXI.Container;
  private readonly _worldHitBox: PIXI.Sprite;
  private readonly _mainGraphics: PIXI.Graphics;
  private readonly _cursorPosText: PIXI.Text;
  private readonly _redrawCallBack: (scene: CanvasScene) => void;

  private _mouseDownPos: null | PIXI.Point;
  private _dragHandlersEngaged: boolean;
  blockEventHandling: boolean;

  dragBeginHandler: null | ((pt: { x: number; y: number }) => boolean);
  draggingHandler: null | ((pt: { x: number; y: number }) => void);
  dragReleaseHandler: null | (() => void);

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

    this._cursorPosText = this._stage.addChild(new PIXI.Text("(0.00, 0.00)"));

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
    options?: IRenderOptions
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
      this._mainGraphics.drawRect(x - width / 2, y - height / 2, width, height);
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
    options?: IRenderOptions,
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

  drawPolygon(lineData: Float64Array, options?: IRenderOptions): void {
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;
    const g = this._mainGraphics;

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

  drawCircle(
    x: number,
    y: number,
    radius: number,
    options?: IRenderOptions
  ): void {
    const color = options?.color ?? SimpleColors.Black;
    const fill = options?.fill ?? false;

    const g = this._mainGraphics;

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

  private updateCursorPosition(pos: { x: number; y: number }) {
    this._cursorPosText.text = `(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)})`;
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
