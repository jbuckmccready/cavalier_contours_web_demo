import { Point, SceneRenderer, SimpleColors } from "@/components/canvas_scene/scene_renderer";
import { Polyline, multiPlineParallelOffset } from "cavalier_contours_web_ffi";
import { HIT_DELTA } from "@/components/canvas_scene/scene_renderer";
import * as utils from "@/core/utils";
import { Pline } from "@/core/cavc_types";

export enum OffsetDemoMode {
  Offset = "Offset",
  RawOffset = "Raw Offset",
  RawOffsetSegs = "Raw Offset Segments",
}
export function allDemoModes(): OffsetDemoMode[] {
  return [OffsetDemoMode.Offset, OffsetDemoMode.RawOffset, OffsetDemoMode.RawOffsetSegs];
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
  handleSelfIntersects: boolean;
};

export type OffsetModeModel = OffsetModeData & {
  readonly type: OffsetDemoMode.Offset;
};

export type RawOffsetModeData = BaseModelData & {
  showDualRawOffset: boolean;
  showRawOffsetIntersects: boolean;
};
export type RawOffsetModeModel = RawOffsetModeData & {
  readonly type: OffsetDemoMode.RawOffset;
};

export type RawOffsetSegsModeData = BaseModelData;
export type RawOffsetSegsModeModel = RawOffsetModeData & {
  readonly type: OffsetDemoMode.RawOffsetSegs;
};

/// Union representing the different demo modes associated model data.
export type OffsetDemoModel = OffsetModeModel | RawOffsetModeModel | RawOffsetSegsModeModel;

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

  let result: { ccwPlines: Polyline[]; cwPlines: Polyline[] } = multiPlineParallelOffset(
    plines,
    model.offset
  );

  result.ccwPlines.forEach((pl) => {
    scene.drawCavcPolyline(pl, {
      color: SimpleColors.Blue,
    });
    pl.free();
  });

  result.cwPlines.forEach((pl) => {
    scene.drawCavcPolyline(pl, {
      color: SimpleColors.Red,
    });
    pl.free();
  });
  //   const m = model;
  //   switch (m.type) {
  //     case OffsetDemoMode.Offset:
  //       // draw offsets
  //       if (m.repeatOffsetCount > 0) {
  //         const isCCWPline = pline.area() > 0;
  //         let offsetResults: Polyline[] = pline.parallelOffset(m.offset, m.handleSelfIntersects);
  //         let nextResults: Polyline[] = [];
  //         let offsetCount = 0;
  //         while (offsetResults.length !== 0 && offsetCount < m.repeatOffsetCount) {
  //           for (let i = 0; i < offsetResults.length; ++i) {
  //             if (pline1IsClosed) {
  //               const offsetIsCCW = offsetResults[i].area() > 0;
  //               if (isCCWPline !== offsetIsCCW) {
  //                 scene.drawCavcPolyline(offsetResults[i], {
  //                   color: SimpleColors.Red,
  //                 });
  //                 continue;
  //               }
  //             }
  //             scene.drawCavcPolyline(offsetResults[i], {
  //               color: SimpleColors.Blue,
  //             });
  //             offsetResults[i]
  //               .parallelOffset(m.offset, m.handleSelfIntersects)
  //               .forEach((o: Polyline) => nextResults.push(o));
  //           }
  //           offsetCount += 1;
  //           offsetResults.forEach((p) => p.free());
  //           offsetResults = nextResults;
  //           nextResults = [];
  //         }
  //         offsetResults.forEach((p) => p.free());
  //       }
  //       break;
  //     case OffsetDemoMode.RawOffset: {
  //       const drawRawOffset = (
  //         pline: Polyline,
  //         offset: number,
  //         drawIntersects: boolean,
  //         color: number
  //       ) => {
  //         const rawOffsetPline = pline.rawOffset(offset);
  //         scene.drawCavcPolyline(rawOffsetPline, { color: color });
  //         if (drawIntersects) {
  //           const selfIntrs: Point[] = rawOffsetPline.selfIntersects();
  //           for (let i = 0; i < selfIntrs.length; ++i) {
  //             const p = selfIntrs[i];
  //             scene.drawScaledRect(p.x, p.y, HIT_DELTA, HIT_DELTA, {
  //               fill: true,
  //               color: SimpleColors.Red,
  //             });
  //           }
  //         }
  //         rawOffsetPline.free();
  //       };
  //       drawRawOffset(pline, m.offset, m.showRawOffsetIntersects, SimpleColors.Green);
  //       if (m.showDualRawOffset) {
  //         drawRawOffset(pline, -m.offset, m.showRawOffsetIntersects, SimpleColors.Purple);
  //       }
  //       break;
  //     }
  //     case OffsetDemoMode.RawOffsetSegs: {
  //       scene.drawCavcRawOffsetSegs(pline, m.offset);
  //       break;
  //     }
  //     default:
  //       utils.assertExhaustive(m);
  //   }
  //   pline.free();
}
