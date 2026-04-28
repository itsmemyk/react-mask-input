import {
  ChangeEvent,
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import {
  applyMask,
  buildPlaceholder,
  computeCaretPosition,
  resolveMaskPattern,
  toInputString,
} from "./mask-engine";
import { DEFAULT_PLACEHOLDER_CHAR, Mask } from "./types";

export interface MaskInputConfig {
  mask: Mask;
  guide?: boolean;
  placeholderChar?: string;
  keepCharPositions?: boolean;
  showMask?: boolean;
}

const isAndroid =
  typeof navigator !== "undefined" && /Android/i.test(navigator.userAgent);

const scheduleFrame: (fn: () => void) => void =
  typeof requestAnimationFrame !== "undefined"
    ? (fn) => requestAnimationFrame(fn)
    : (fn) => setTimeout(fn, 0);

function setCaret(el: HTMLInputElement, pos: number) {
  if (
    typeof document === "undefined" ||
    document.activeElement !== el ||
    typeof el.setSelectionRange !== "function"
  ) {
    return;
  }
  const apply = () => el.setSelectionRange(pos, pos, "none");
  isAndroid ? scheduleFrame(apply) : apply();
}

interface MaskState {
  lastConformedValue: string;
  lastPlaceholder: string;
  lastShowMask: boolean | undefined;
}

export function useMaskInput(
  value: string | number | null | undefined,
  config: MaskInputConfig,
) {
  const { mask, guide = true, placeholderChar = DEFAULT_PLACEHOLDER_CHAR, keepCharPositions, showMask } = config;

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [displayValue, setDisplayValue] = useState("");
  const [syncToken, setSyncToken] = useState(0);
  const pendingCaret = useRef(0);

  const stateRef = useRef<MaskState>({
    lastConformedValue: "",
    lastPlaceholder: "",
    lastShowMask: showMask,
  });

  const processValue = useCallback(
    (incoming?: string | number | null) => {
      const el = inputRef.current;
      const raw = incoming === undefined ? (el?.value ?? "") : incoming;
      const state = stateRef.current;

      const showMaskChanged = showMask !== state.lastShowMask;
      if (raw === state.lastConformedValue && !showMaskChanged) return;
      state.lastShowMask = showMask;

      const rawStr = toInputString(raw);
      const selectionPos = el?.selectionEnd ?? rawStr.length;

      const resolvedPattern = resolveMaskPattern(mask, rawStr, {
        currentCaretPosition: selectionPos,
        previousConformedValue: state.lastConformedValue,
        placeholderChar,
      });

      if (resolvedPattern === false) {
        state.lastConformedValue = rawStr;
        setDisplayValue(rawStr);
        return;
      }

      const placeholder = buildPlaceholder(resolvedPattern, placeholderChar);

      const conformed = applyMask(rawStr, resolvedPattern, {
        previousConformedValue: state.lastConformedValue,
        guide,
        placeholderChar,
        placeholder,
        currentCaretPosition: selectionPos,
        keepCharPositions,
      });

      const nextCaret = computeCaretPosition({
        previousConformedValue: state.lastConformedValue,
        previousPlaceholder: state.lastPlaceholder,
        conformedValue: conformed,
        placeholder,
        rawValue: rawStr,
        currentCaretPosition: selectionPos,
        placeholderChar,
      });

      const isEmpty = conformed === placeholder && nextCaret === 0;
      const shown = isEmpty ? (showMask ? placeholder : "") : conformed;

      state.lastConformedValue = shown;
      state.lastPlaceholder = placeholder;

      setDisplayValue(shown);
      pendingCaret.current = nextCaret;
      setSyncToken((t) => t + 1);
    },
    [mask, guide, placeholderChar, keepCharPositions, showMask],
  );

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el) setCaret(el, pendingCaret.current);
  }, [syncToken]);

  useLayoutEffect(() => {
    processValue(value);
  }, [processValue, value]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      processValue(e.target.value);
      e.target.value = stateRef.current.lastConformedValue;
    },
    [processValue],
  );

  return { inputRef, maskedValue: displayValue, onChange };
}
