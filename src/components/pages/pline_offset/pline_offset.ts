import { Point, SceneRenderer, SimpleColors } from "@/components/canvas_scene/scene_renderer";
import { Polyline } from "cavalier_contours_web_ffi";
import { HIT_DELTA } from "@/components/canvas_scene/scene_renderer";
import * as utils from "@/core/utils";

export enum DemoMode {
  Offset = "Offset",
  RawOffset = "Raw Offset",
  RawOffsetSegs = "Raw Offset Segments",
}
export function allDemoModes(): DemoMode[] {
  return [DemoMode.Offset, DemoMode.RawOffset, DemoMode.RawOffsetSegs];
}

export function allDemoModesAsStrings(): string[] {
  return Object.values(DemoMode);
}

export type BaseModelData = {
  offset: number;
};

export type OffsetModeData = BaseModelData & {
  repeatOffsetCount: number;
  handleSelfIntersects: boolean;
};

export type OffsetModeModel = OffsetModeData & {
  readonly type: DemoMode.Offset;
};

export type RawOffsetModeData = BaseModelData & {
  showDualRawOffset: boolean;
  showRawOffsetIntersects: boolean;
};
export type RawOffsetModeModel = RawOffsetModeData & {
  readonly type: DemoMode.RawOffset;
};

export type RawOffsetSegsModeData = BaseModelData;
export type RawOffsetSegsModeModel = RawOffsetModeData & {
  readonly type: DemoMode.RawOffsetSegs;
};

/// Union representing the different demo modes associated model data.
export type OffsetDemoModel = OffsetModeModel | RawOffsetModeModel | RawOffsetSegsModeModel;

/// Type that can hold all the properties for all the demo mode cases.
export type DemoModelStorage = OffsetModeData &
  RawOffsetModeData &
  RawOffsetSegsModeData & { type: DemoMode };

export function drawOffsetScene(
  scene: SceneRenderer,
  pline1Array: Float64Array,
  pline1IsClosed: boolean,
  model: OffsetDemoModel
) {
  const pline1 = new Polyline(pline1Array, pline1IsClosed);
  // draw vertexes
  const vertexes = pline1.vertexData();
  for (let i = 0; i < vertexes.length; i += 3) {
    scene.drawScaledRect(vertexes[i], vertexes[i + 1], HIT_DELTA, HIT_DELTA, {
      fill: true,
      color: SimpleColors.Black,
    });
  }
  // draw polyline
  scene.drawCavcPolyline(pline1, { color: SimpleColors.Black });
  const m = model;
  switch (m.type) {
    case DemoMode.Offset:
      // draw offsets
      if (m.repeatOffsetCount > 0) {
        const isCCWPline = pline1.area() > 0;
        let offsetResults: Polyline[] = pline1.parallelOffset(m.offset, m.handleSelfIntersects);
        let nextResults: Polyline[] = [];
        let offsetCount = 0;
        while (offsetResults.length !== 0 && offsetCount < m.repeatOffsetCount) {
          for (let i = 0; i < offsetResults.length; ++i) {
            if (pline1IsClosed) {
              const offsetIsCCW = offsetResults[i].area() > 0;
              if (isCCWPline !== offsetIsCCW) {
                scene.drawCavcPolyline(offsetResults[i], {
                  color: SimpleColors.Red,
                });
                continue;
              }
            }
            scene.drawCavcPolyline(offsetResults[i], {
              color: SimpleColors.Blue,
            });
            offsetResults[i]
              .parallelOffset(m.offset, m.handleSelfIntersects)
              .forEach((o: Polyline) => nextResults.push(o));
          }
          offsetCount += 1;
          offsetResults.forEach((p) => p.free());
          offsetResults = nextResults;
          nextResults = [];
        }
        offsetResults.forEach((p) => p.free());
      }
      break;
    case DemoMode.RawOffset: {
      const drawRawOffset = (
        pline: Polyline,
        offset: number,
        drawIntersects: boolean,
        color: number
      ) => {
        const rawOffsetPline = pline.rawOffset(offset);
        scene.drawCavcPolyline(rawOffsetPline, { color: color });
        if (drawIntersects) {
          const selfIntrs: Point[] = rawOffsetPline.selfIntersects();
          for (let i = 0; i < selfIntrs.length; ++i) {
            const p = selfIntrs[i];
            scene.drawScaledRect(p.x, p.y, HIT_DELTA, HIT_DELTA, {
              fill: true,
              color: SimpleColors.Red,
            });
          }
        }
        rawOffsetPline.free();
      };
      drawRawOffset(pline1, m.offset, m.showRawOffsetIntersects, SimpleColors.Green);
      if (m.showDualRawOffset) {
        drawRawOffset(pline1, -m.offset, m.showRawOffsetIntersects, SimpleColors.Purple);
      }
      break;
    }
    case DemoMode.RawOffsetSegs: {
      scene.drawCavcRawOffsetSegs(pline1, m.offset);
      break;
    }
    default:
      utils.assertExhaustive(m);
  }
  pline1.free();
}
