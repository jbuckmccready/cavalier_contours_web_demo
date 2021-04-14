import { InjectionKey } from "vue";

export type CavcModule = typeof import("@/../wasm/cavalier_contours_web_ffi/pkg");
export type {
  Polyline,
  StaticAABB2DIndex,
} from "@/../wasm/cavalier_contours_web_ffi/pkg";

export const CavcModuleKey: InjectionKey<CavcModule> = Symbol("CavcModule");
