import { toRustf64Str } from "@/core/utils";

/// Type matching the JSON representation of a cavalier contours polyline.
export type Pline = {
  isClosed: boolean;
  vertexes: number[][];
};

export function plineToRustCode(pline: Pline): string {
  let vertexes: string[] = [];
  pline.vertexes.forEach((v) => {
    const s = "(" + v.map(toRustf64Str).join(", ") + ")";
    vertexes.push(s);
  });

  let start = pline.isClosed ? "pline_closed![" : "pline_open![";
  return start + vertexes.join(", ") + "]";
}
