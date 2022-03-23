import { reactive } from "vue";
import { OffsetDemoMode, OffsetDemoState } from "@/components/pages/pline_offset/pline_offset";
import * as shapes from "@/core/shapes";
import * as utils from "@/core/utils";

const state: OffsetDemoState = {
  type: OffsetDemoMode.Offset,
  offset: 3.0,
  repeatOffsetCount: 50,
  handleSelfIntersects: true,
  showDualRawOffset: false,
  showRawOffsetIntersects: false,
  plineJsonStr: utils.plineArrayToJsonStr(shapes.createExample1PlineVertexes(10), true),
};
export default reactive(state);
