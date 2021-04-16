export enum DemoMode {
  Offset = "Offset",
  RawOffset = "Raw Offset",
}
export function allDemoModes(): DemoMode[] {
  return [DemoMode.Offset, DemoMode.RawOffset];
}

export function allDemoModesAsStrings(): string[] {
  return Object.values(DemoMode);
}
