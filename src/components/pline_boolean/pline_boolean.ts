export enum BooleanOp {
  None = -1,
  Or = 0,
  And,
  Not,
  Xor,
}

export function allBooleanOps(): BooleanOp[] {
  return [
    BooleanOp.None,
    BooleanOp.Or,
    BooleanOp.And,
    BooleanOp.Not,
    BooleanOp.Xor,
  ];
}

export function allBooleanOpsAsStrings(): string[] {
  return Object.keys(BooleanOp).filter((k) => isNaN(Number(k)));
}
