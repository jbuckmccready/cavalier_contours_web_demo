import { reactive } from "vue";
import {
  OffsetDemoMode,
  OffsetDemoState,
} from "@/components/pages/multi_pline_offset/multi_pline_offset";
import * as shapes from "@/core/shapes";

const state: OffsetDemoState = {
  type: OffsetDemoMode.Offset,
  offset: 3.0,
  repeatOffsetCount: 50,
  showRawOffsetIntersects: false,
  plineJsonStr: shapes.multiPlineExample1JsonStr(),
  splitterModel: 75,
};
export default reactive(state);
