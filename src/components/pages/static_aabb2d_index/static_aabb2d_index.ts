export enum StaticAABBIndexDemoMode {
  None = "None",
  QueryBox = "Query Box",
  IndexBoxes = "Index Boxes",
  Neighbors = "Nearest Neighbors",
}

export function allDemoModes(): StaticAABBIndexDemoMode[] {
  return [
    StaticAABBIndexDemoMode.None,
    StaticAABBIndexDemoMode.QueryBox,
    StaticAABBIndexDemoMode.IndexBoxes,
    StaticAABBIndexDemoMode.Neighbors,
  ];
}

export function allDemoModesAsStrings(): string[] {
  return Object.values(StaticAABBIndexDemoMode);
}

export type StaticAABB2DIndexDemoState = {
  currentDemoMode: StaticAABBIndexDemoMode;
  vertexCount: number;
  indexNodeSize: number;
  editShape: boolean;
  neighborDistance: number;
  neighborsQueryCenter: [number, number];
  queryBox: [number, number, number, number];
  splitterModel: number;
};
