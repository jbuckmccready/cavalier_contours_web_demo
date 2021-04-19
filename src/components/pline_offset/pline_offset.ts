export enum DemoMode {
  Offset = "Offset",
  RawOffset = "Raw Offset",
  RawOffsetSegs = "Raw Offset Segments",
}
export function allDemoModes(): DemoMode[] {
  return [DemoMode.Offset, DemoMode.RawOffset, DemoMode.RawOffsetSegs];
}

export function allDemoModesAsStrings(): string[] {
  return Object.values(DemoMode);
}

export type BaseModelData = {
  offset: number;
};

export type OffsetModeData = BaseModelData & {
  repeatOffsetCount: number;
  handleSelfIntersects: boolean;
};

export type OffsetModeModel = OffsetModeData & {
  readonly type: DemoMode.Offset;
};

export type RawOffsetModeData = BaseModelData & {
  showDualRawOffset: boolean;
  showRawOffsetIntersects: boolean;
};
export type RawOffsetModeModel = RawOffsetModeData & {
  readonly type: DemoMode.RawOffset;
};

export type RawOffsetSegsModeData = BaseModelData;
export type RawOffsetSegsModeModel = RawOffsetModeData & {
  readonly type: DemoMode.RawOffsetSegs;
};

/// Union representing the different demo modes associated model data.
export type OffsetDemoModel =
  | OffsetModeModel
  | RawOffsetModeModel
  | RawOffsetSegsModeModel;

/// Type that can hold all the properties for all the demo mode cases.
export type DemoModelStorage = OffsetModeData &
  RawOffsetModeData &
  RawOffsetSegsModeData & { type: DemoMode };
