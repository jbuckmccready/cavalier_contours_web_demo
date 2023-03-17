import { reactive } from "vue";
import {
  OffsetDemoMode,
  OffsetDemoState,
} from "@/components/pages/multi_pline_offset/multi_pline_offset";
import * as shapes from "@/core/shapes";
import * as utils from "@/core/utils";

const state: OffsetDemoState = {
  type: OffsetDemoMode.Offset,
  offset: 3.0,
  repeatOffsetCount: 50,
  handleSelfIntersects: true,
  showDualRawOffset: false,
  showRawOffsetIntersects: false,
  plineJsonStr: shapes.multiPlineExample1JsonStr(),
  splitterModel: 75,
};
export default reactive(state);
