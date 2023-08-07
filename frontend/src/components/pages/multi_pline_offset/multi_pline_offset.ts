import { Point, SceneRenderer, SimpleColors } from "@/components/canvas_scene/scene_renderer";
import {
  Polyline,
  multiPlineParallelOffset,
  plineParallelOffset,
  plineFindIntersects,
} from "cavalier_contours_web_ffi";
import { HIT_DELTA } from "@/components/canvas_scene/scene_renderer";
import * as utils from "@/core/utils";
import { Pline } from "@/core/cavc_json_types";

export enum OffsetDemoMode {
  Offset = "Offset",
  RawOffset = "Raw Offset",
}
export function allDemoModes(): OffsetDemoMode[] {
  return [OffsetDemoMode.Offset, OffsetDemoMode.RawOffset];
}

export function allDemoModesAsStrings(): string[] {
  return Object.values(OffsetDemoMode);
}

export type BaseModelData = {
  offset: number;
  plineJsonStr: string;
  splitterModel: number;
};

export type OffsetModeData = BaseModelData & {
  repeatOffsetCount: number;
};

export type OffsetModeModel = OffsetModeData & {
  readonly type: OffsetDemoMode.Offset;
};

export type RawOffsetModeData = BaseModelData & {
  showRawOffsetIntersects: boolean;
};
export type RawOffsetModeModel = RawOffsetModeData & {
  readonly type: OffsetDemoMode.RawOffset;
};

export type RawOffsetSegsModeData = BaseModelData;

/// Union representing the different demo modes associated model data.
export type OffsetDemoModel = OffsetModeModel | RawOffsetModeModel;

/// Type that can hold all the properties for all the demo mode cases.
export type OffsetDemoState = OffsetModeData &
  RawOffsetModeData &
  RawOffsetSegsModeData & { type: OffsetDemoMode };

export function drawOffsetScene(scene: SceneRenderer, plines: Pline[], model: OffsetDemoModel) {
  for (let i = 0; i < plines.length; i++) {
    const pline = plines[i];
    const vertexes = pline.vertexes;
    for (let j = 0; j < vertexes.length; j++) {
      let vertex = vertexes[j];
      scene.drawScaledRect(vertex[0], vertex[1], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: SimpleColors.Black,
      });
    }

    // draw polyline
    scene.drawPline(pline, { color: SimpleColors.Black });
  }

  const m = model;
  switch (m.type) {
    case OffsetDemoMode.RawOffset:
      let offsetResults: Pline[] = [];
      plines.forEach((p) => {
        let results: Pline[] = plineParallelOffset(p, m.offset, false);
        results.forEach((r) => offsetResults.push(r));
        results.forEach((r) => {
          scene.drawPline(r, { color: SimpleColors.Blue });
        });
      });

      if (m.showRawOffsetIntersects) {
        for (let i = 0; i < offsetResults.length; i++) {
          for (let j = i + 1; j < offsetResults.length; j++) {
            let intersectPoints: Point[] = plineFindIntersects(offsetResults[i], offsetResults[j]);
            intersectPoints.forEach((p) => {
              scene.drawScaledRect(p.x, p.y, HIT_DELTA, HIT_DELTA, {
                fill: true,
                color: SimpleColors.Red,
              });
            });
          }
        }
      }

      break;
    case OffsetDemoMode.Offset:
      let result: { ccwPlines: Polyline[]; cwPlines: Polyline[] } = multiPlineParallelOffset(
        plines,
        model.offset
      );

      let offsetCount = 0;

      while (
        (result.ccwPlines.length !== 0 || result.cwPlines.length !== 0) &&
        offsetCount < m.repeatOffsetCount
      ) {
        let nextInput: Pline[] = [];
        result.ccwPlines.forEach((pl) => {
          scene.drawCavcPolyline(pl, {
            color: SimpleColors.Blue,
          });
          nextInput.push(utils.jsonPlineFromCavcPolyline(pl));
          pl.free();
        });

        result.cwPlines.forEach((pl) => {
          scene.drawCavcPolyline(pl, {
            color: SimpleColors.Red,
          });
          nextInput.push(utils.jsonPlineFromCavcPolyline(pl));
          pl.free();
        });

        result = multiPlineParallelOffset(nextInput, m.offset);
        offsetCount += 1;
      }

      result.ccwPlines.forEach((p) => p.free());
      result.cwPlines.forEach((p) => p.free());
      break;
    default:
      utils.assertExhaustive(m);
  }
}
