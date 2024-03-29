import type { Polyline } from "cavalier_contours_web_ffi";
import { inject, InjectionKey } from "vue";
import { Pline } from "./cavc_json_types";

/// Strict type checked injection.
export function injectStrict<T>(key: InjectionKey<T>, fallback?: T): T {
  const resolved = inject(key, fallback);
  if (!resolved) {
    throw new Error(`Could not resolve ${key.description}`);
  }

  return resolved;
}

export function valueOrThrow<T>(value: T | null | undefined, msg?: string): T {
  if (value === null || value === undefined) {
    throw new Error(msg ?? "value cannot be null");
  }
  return value;
}

export function assertExhaustive(
  _value: never,
  message = "Reached unexpected case in exhaustive switch"
): never {
  throw new Error(message);
}

/// Print number to Rust f64 string, e.g. 0 -> "0.0", 88.87654 -> "88.87654"
export function toRustf64Str(number: number): string {
  return number.toFixed(Math.max(((number + "").split(".")[1] || "").length, 1));
}

/// Copy str to clip board
export function copyToClipboard(str: string): void {
  const el = document.createElement("textarea");
  el.value = str;
  el.setAttribute("readonly", "");
  el.style.position = "absolute";
  el.style.left = "-9999px";
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);
}

/// Print pline array and is closed to json string
export function plineArrayToJsonStr(array: Float64Array, isClosed: boolean): string {
  const obj = {
    isClosed: isClosed,
    vertexes: new Array<Array<number>>(),
  };
  for (let i = 0; i < array.length; i += 3) {
    const v = [array[i], array[i + 1], array[i + 2]];
    obj.vertexes.push(v);
  }

  const f = (k: string, v: { isClosed: boolean; vertexes: number[][] }) => {
    if (k !== "vertexes" && v instanceof Array) {
      return JSON.stringify(v);
    }
    return v;
  };
  return JSON.stringify(obj, f, 2).replace(/"\[/g, "[").replace(/]"/g, "]").replace(/,/g, ", ");
}

/// Parse json string into { array, isClosed }
export function jsonStrToPlineArray(jsonStr: string): {
  array: Float64Array;
  isClosed: boolean;
} {
  try {
    const obj = JSON.parse(jsonStr);
    const array = new Float64Array(obj.vertexes.length * 3);
    obj.vertexes.forEach((v: number[], i: number) => {
      const offset = i * 3;
      array[offset] = v[0];
      array[offset + 1] = v[1];
      array[offset + 2] = v[2];
    });

    return { array: array, isClosed: obj.isClosed };
  } catch {
    return { array: new Float64Array(), isClosed: false };
  }
}

export function plineToJsonStr(pline: Pline): string {
  const f = (k: string, v: Pline) => {
    if (k !== "vertexes" && v instanceof Array) {
      return JSON.stringify(v);
    }
    return v;
  };
  return JSON.stringify(pline, f, 2).replace(/"\[/g, "[").replace(/]"/g, "]").replace(/,/g, ", ");
}

export function plinesToJsonStr(plines: Pline[]): string {
  let root = true;
  const f = (k: string, v: Pline) => {
    if (root) {
      root = false;
      return v;
    }
    if (k !== "vertexes" && v instanceof Array) {
      return JSON.stringify(v);
    }
    return v;
  };
  return JSON.stringify(plines, f, 2).replace(/"\[/g, "[").replace(/]"/g, "]").replace(/,/g, ", ");
}

/// Create rust code string for declaring pline
export function createPlineRustCodeStr(pline: Polyline): string {
  const vertexData = pline.vertexData();
  let result = pline.isClosed ? "pline_closed![" : "pline_open![";
  for (let i = 0; i < vertexData.length; i += 3) {
    const values = [vertexData[i], vertexData[i + 1], vertexData[i + 2]];
    result += "(" + values.map(toRustf64Str).join(", ") + "),\n";
  }
  result = result.slice(0, -2) + "]";
  return result;
}

/// Create rust code string for constructing PlineProperties for pline
export function createPlineTestPropertiesRustCodeStr(pline: Polyline): string {
  const p = pline.testProperties();
  const f64Props = [p.area, p.pathLength, p.minX, p.minY, p.maxX, p.maxY];
  return (
    "PlineProperties::new(" +
    p.vertexCount.toString() +
    ", " +
    f64Props.map(toRustf64Str).join(", ") +
    ")"
  );
}

export function createPlinePropertiesSetRustCodeStr(plines: Polyline[]): string {
  return "[" + plines.map((pline) => createPlineTestPropertiesRustCodeStr(pline)).join(", ") + "]";
}

export function jsonPlineFromCavcPolyline(polyline: Polyline): Pline {
  let result: Pline = { isClosed: polyline.isClosed, vertexes: [] };
  const vertexData = polyline.vertexData();
  for (let i = 0; i < vertexData.length; i += 3) {
    result.vertexes.push([vertexData[i], vertexData[i + 1], vertexData[i + 2]]);
  }
  return result;
}
