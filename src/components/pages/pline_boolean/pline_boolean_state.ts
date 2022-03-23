import { reactive } from "vue";
import { BooleanOp, BooleanDemoState } from "@/components/pages/pline_boolean/pline_boolean";
import * as shapes from "@/core/shapes";
import * as utils from "@/core/utils";

const init = () => {
  const pline1Array = shapes.createExample1PlineVertexes(10);
  pline1Array[3] = 3;
  pline1Array[4] = 10;
  const pline1JsonStr = utils.plineArrayToJsonStr(pline1Array, true);
  const pline2Array = shapes.createExample1PlineVertexes(10);
  const pline2JsonStr = utils.plineArrayToJsonStr(pline2Array, true);
  return {
    booleanOp: BooleanOp.None,
    pline1JsonStr,
    pline2JsonStr,
    fillPolylines: true,
  };
};
const state: BooleanDemoState = init();

export default reactive(state);
