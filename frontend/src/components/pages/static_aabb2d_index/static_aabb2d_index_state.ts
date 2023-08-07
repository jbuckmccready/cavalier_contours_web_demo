import { reactive } from "vue";
import {
  StaticAABB2DIndexDemoState,
  StaticAABBIndexDemoMode,
} from "@/components/pages/static_aabb2d_index/static_aabb2d_index";

const state: StaticAABB2DIndexDemoState = {
  currentDemoMode: StaticAABBIndexDemoMode.None,
  vertexCount: 100,
  indexNodeSize: 16,
  editShape: false,
  neighborDistance: 100,
  neighborsQueryCenter: [0, 0],
  queryBox: [300, 40, 500, 500],
  splitterModel: 75,
};

export default reactive(state);
