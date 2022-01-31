export enum DemoMode {
  None = "None",
  QueryBox = "Query Box",
  IndexBoxes = "Index Boxes",
  Neighbors = "Nearest Neighbors",
}

export function allDemoModes(): DemoMode[] {
  return [DemoMode.None, DemoMode.QueryBox, DemoMode.IndexBoxes, DemoMode.Neighbors];
}

export function allDemoModesAsStrings(): string[] {
  return Object.values(DemoMode);
}
