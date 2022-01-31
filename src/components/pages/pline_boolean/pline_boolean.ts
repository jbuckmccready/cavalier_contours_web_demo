import {
  COLORS,
  HIT_DELTA,
  SceneRenderer,
  SimpleColors,
} from "@/components/canvas_scene/scene_renderer";
import { Polyline } from "cavalier_contours_web_ffi";
export enum BooleanOp {
  None = -1,
  Or = 0,
  And,
  Not,
  Xor,
}

export function allBooleanOps(): BooleanOp[] {
  return [BooleanOp.None, BooleanOp.Or, BooleanOp.And, BooleanOp.Not, BooleanOp.Xor];
}

export function allBooleanOpsAsStrings(): string[] {
  return Object.keys(BooleanOp).filter((k) => isNaN(Number(k)));
}

// helper function to perform boolean operation between two polylines, visit all results
// and free/clean up memory
export function visitBoolean(
  p1: Polyline,
  p2: Polyline,
  op: BooleanOp,
  posVisitor: (pline: Polyline, index: number) => void,
  negVisitor: (pline: Polyline, index: number) => void,
  free = true
) {
  const result = p1.boolean(p2, op);
  result.posPlines.forEach((pline: Polyline, i: number) => {
    posVisitor(pline, i);
    if (free) {
      pline.free();
    }
  });
  result.negPlines.forEach((pline: Polyline, i: number) => {
    negVisitor(pline, i);
    if (free) {
      pline.free();
    }
  });
}

export function drawBooleanScene(
  scene: SceneRenderer,
  pline1Array: Float64Array,
  pline2Array: Float64Array,
  op: BooleanOp,
  fill: boolean
) {
  const pline1 = new Polyline(pline1Array, true);
  const pline2 = new Polyline(pline2Array, true);
  pline2.cycleVertexes(2);
  const pline1Color = SimpleColors.Red;
  const pline2Color = SimpleColors.Blue;
  // draw vertexes
  const drawVertexes = (vertexes: Float64Array, color: SimpleColors) => {
    for (let i = 0; i < vertexes.length; i += 3) {
      scene.drawScaledRect(vertexes[i], vertexes[i + 1], HIT_DELTA, HIT_DELTA, {
        fill: true,
        color: color,
      });
    }
  };
  drawVertexes(pline1.vertexData(), pline1Color);
  drawVertexes(pline2.vertexData(), pline2Color);
  // draw polylines/boolean result
  const alpha = 0.7;
  if (op === BooleanOp.None) {
    scene.drawCavcPolyline(pline1, { color: pline1Color, fill, alpha });
    scene.drawCavcPolyline(pline2, { color: pline2Color, fill, alpha });
  } else {
    const processPosPline = (pline: Polyline, i: number) => {
      const color = COLORS[i % COLORS.length];
      scene.drawCavcPolyline(pline, { fill, color, alpha });
    };
    const processNegPline = (pline: Polyline) => {
      const color = fill ? SimpleColors.White : SimpleColors.Black;
      scene.drawCavcPolyline(pline, {
        fill,
        color,
        alpha,
      });
    };
    visitBoolean(pline1, pline2, op, processPosPline, processNegPline);
  }
  pline1.free();
  pline2.free();
}
