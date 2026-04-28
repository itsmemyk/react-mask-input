export const DEFAULT_PLACEHOLDER_CHAR = "_";

export type MaskSegment = string | RegExp;
export type MaskPattern = MaskSegment[];

export type MaskFactory = (
  value: string,
  ctx?: MaskFactoryContext,
) => MaskPattern | false;

export type Mask = MaskPattern | MaskFactory | false;

// Convenience aliases for consumers
export type MaskArray = MaskPattern;
export type MaskFunction = MaskFactory;

export interface MaskFactoryContext {
  previousConformedValue?: string;
  currentCaretPosition?: number | null;
  placeholderChar?: string;
}

export interface ApplyMaskOptions {
  previousConformedValue?: string;
  guide?: boolean;
  placeholderChar?: string;
  placeholder?: string;
  currentCaretPosition?: number | null;
  keepCharPositions?: boolean;
}

export interface CaretAdjustConfig {
  previousConformedValue: string;
  previousPlaceholder: string;
  currentCaretPosition: number;
  conformedValue: string;
  rawValue: string;
  placeholderChar: string;
  placeholder: string;
}
