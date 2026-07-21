import type { GridColsToken, GridGapToken, StackGapToken } from "./tokens";
import { gridCols, gridGap, stackGap } from "./tokens";

export type StackGap = StackGapToken;
export type GridGap = GridGapToken;
export type GridCols = GridColsToken;

export const stackGapClass = stackGap;
export const gridGapClass = gridGap;
export const gridColsClass = gridCols;
