import {
  ApplyMaskOptions,
  CaretAdjustConfig,
  DEFAULT_PLACEHOLDER_CHAR,
  Mask,
  MaskFactory,
  MaskPattern,
  MaskSegment,
} from "./types";

type AnnotatedChar = { ch: string; fresh: boolean };

export function buildPlaceholder(
  pattern: MaskPattern = [],
  fillChar = DEFAULT_PLACEHOLDER_CHAR,
): string {
  return pattern
    .map((seg) => (seg instanceof RegExp ? fillChar : (seg as string)))
    .join("");
}

export function toInputString(value?: string | number | null): string {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (typeof value === "number" && isFinite(value)) return String(value);
  throw new Error(
    `MaskedInput: 'value' must be a string or finite number, got: ${JSON.stringify(value)}`,
  );
}

export function resolveMaskPattern(
  mask: Mask,
  value: string,
  ctx?: Parameters<MaskFactory>[1],
): MaskPattern | false {
  if (mask === false) return false;
  if (Array.isArray(mask)) return mask as MaskPattern;
  return (mask as MaskFactory)(value, ctx);
}

function padDeletedSlots(
  input: string,
  template: string,
  fillChar: string,
  editStart: number,
  editEnd: number,
): string {
  let padding = "";
  for (let i = editStart; i < editEnd; i++) {
    if (template[i] === fillChar) padding += fillChar;
  }
  return input.slice(0, editStart) + padding + input.slice(editStart);
}

function extractUserChars(
  input: string,
  template: string,
  fillChar: string,
  editStart: number,
  delta: number,
  prevLen: number,
  patternLen: number,
): AnnotatedChar[] {
  const chars: AnnotatedChar[] = input.split("").map((ch, i) => ({
    ch,
    fresh: i >= editStart && i < editStart + Math.abs(delta),
  }));

  for (let i = chars.length - 1; i >= 0; i--) {
    const { ch } = chars[i]!;
    if (ch === fillChar) continue;
    const useOffset = i >= editStart && prevLen === patternLen;
    const templatePos = useOffset ? i - delta : i;
    if (template[templatePos] === ch) chars.splice(i, 1);
  }

  return chars;
}

function nextFillSlotIndex(chars: AnnotatedChar[], fillChar: string): number {
  for (let i = 0; i < chars.length; i++) {
    const { ch, fresh } = chars[i]!;
    if (ch !== fillChar && !fresh) break;
    if (ch === fillChar) return i;
  }
  return -1;
}

export function applyMask(
  rawInput = "",
  pattern: MaskPattern,
  opts: ApplyMaskOptions = {},
): string {
  const fillChar = opts.placeholderChar ?? DEFAULT_PLACEHOLDER_CHAR;
  const prevValue = opts.previousConformedValue ?? "";
  const guide = opts.guide ?? true;
  const template = opts.placeholder ?? buildPlaceholder(pattern, fillChar);
  const caretPos = opts.currentCaretPosition ?? 0;
  const keepPositions = opts.keepCharPositions ?? false;

  const delta = rawInput.length - prevValue.length;
  const isAdding = delta > 0;
  const editStart = caretPos + (isAdding ? -delta : 0);
  const suppressGuide = !guide && prevValue !== "";

  let workingInput = rawInput;
  if (keepPositions && !isAdding) {
    workingInput = padDeletedSlots(
      rawInput,
      template,
      fillChar,
      editStart,
      editStart + Math.abs(delta),
    );
  }

  const chars = extractUserChars(
    workingInput,
    template,
    fillChar,
    editStart,
    delta,
    prevValue.length,
    pattern.length,
  );

  let output = "";

  outer: for (let slot = 0; slot < template.length; slot++) {
    const slotCh = template[slot];

    if (slotCh !== fillChar) {
      output += slotCh;
      continue;
    }

    while (chars.length > 0) {
      const { ch, fresh } = chars.shift()!;

      if (ch === fillChar && !suppressGuide) {
        output += fillChar;
        continue outer;
      }

      const rule = pattern[slot] as MaskSegment;
      if (rule instanceof RegExp && rule.test(ch)) {
        if (keepPositions && fresh && prevValue !== "" && guide && isAdding) {
          const fillIdx = nextFillSlotIndex(chars, fillChar);
          if (fillIdx !== -1) {
            output += ch;
            chars.splice(fillIdx, 1);
          } else {
            slot--;
          }
        } else {
          output += ch;
        }
        continue outer;
      }
    }

    if (!suppressGuide) {
      output += template.slice(slot);
      break;
    }
    break;
  }

  if (suppressGuide && !isAdding) {
    let lastUserIdx = -1;
    for (let i = 0; i < output.length; i++) {
      if (template[i] === fillChar) lastUserIdx = i;
    }
    output = lastUserIdx === -1 ? "" : output.slice(0, lastUserIdx + 1);
  }

  return output;
}

function locateTargetCaret(
  conformed: string,
  rawValue: string,
  template: string,
  prevTemplate: string,
  fillChar: string,
  caretPos: number,
  isAdding: boolean,
): number {
  const beforeCaret = rawValue.slice(0, caretPos).split("");
  const inConformed = beforeCaret.filter((ch) => conformed.includes(ch));
  let target = inConformed[inConformed.length - 1];

  const prevLiterals = prevTemplate
    .slice(0, inConformed.length)
    .split("")
    .filter((ch) => ch !== fillChar).length;
  const currLiterals = template
    .slice(0, inConformed.length)
    .split("")
    .filter((ch) => ch !== fillChar).length;

  const literalShifted = currLiterals !== prevLiterals;
  const prevCharReused =
    prevTemplate[inConformed.length - 1] !== undefined &&
    template[inConformed.length - 2] !== undefined &&
    prevTemplate[inConformed.length - 1] !== fillChar &&
    prevTemplate[inConformed.length - 1] !== template[inConformed.length - 1] &&
    prevTemplate[inConformed.length - 1] === template[inConformed.length - 2];

  if (
    !isAdding &&
    (literalShifted || prevCharReused) &&
    prevLiterals > 0 &&
    template.includes(target ?? "") &&
    rawValue[caretPos] !== undefined
  ) {
    target = rawValue[caretPos];
  }

  const occurrencesBeforeCaret = inConformed.filter((ch) => ch === target).length;
  const literalOccurrences = template
    .slice(0, template.indexOf(fillChar))
    .split("")
    .filter((ch, i) => ch === target && rawValue[i] !== ch).length;

  const required = literalOccurrences + occurrencesBeforeCaret;
  let found = 0;
  let pos = 0;

  for (let i = 0; i < conformed.length; i++) {
    pos = i + 1;
    if (conformed[i] === target && ++found >= required) break;
  }

  return pos;
}

export function computeCaretPosition({
  previousConformedValue: prevValue = "",
  previousPlaceholder: prevTemplate = "",
  currentCaretPosition: caretPos = 0,
  conformedValue: conformed,
  rawValue,
  placeholderChar: fillChar,
  placeholder: template,
}: CaretAdjustConfig): number {
  if (caretPos === 0 || !rawValue.length) return 0;

  const delta = rawValue.length - prevValue.length;
  const isAdding = delta > 0;
  const isMultiDelete =
    !isAdding && Math.abs(delta) > 1 && prevValue.length > 0;

  if (isMultiDelete) return caretPos;

  const shouldAnchor =
    isAdding && (prevValue === conformed || conformed === template);

  const rawCaretPos = shouldAnchor
    ? caretPos - delta
    : locateTargetCaret(
        conformed,
        rawValue,
        template,
        prevTemplate,
        fillChar,
        caretPos,
        isAdding,
      );

  if (isAdding) {
    for (let i = rawCaretPos; i <= template.length; i++) {
      if (template[i] === fillChar) return i;
      if (i === template.length) return rawCaretPos;
    }
  } else {
    for (let i = rawCaretPos; i >= 0; i--) {
      if (template[i - 1] === fillChar || i === 0) return i;
    }
  }

  return rawCaretPos;
}
