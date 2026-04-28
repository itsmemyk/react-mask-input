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
  controlled?: boolean;
  initialValue?: string | number | null;
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

function resolveMaskedState(
  incoming: string | number | null | undefined,
  previousState: MaskState,
  config: MaskInputConfig,
  selectionPos?: number,
) {
  const {
    mask,
    guide = true,
    placeholderChar = DEFAULT_PLACEHOLDER_CHAR,
    keepCharPositions,
    showMask,
  } = config;

  const rawStr = toInputString(incoming);
  const caretPos = selectionPos ?? rawStr.length;
  const resolvedPattern = resolveMaskPattern(mask, rawStr, {
    currentCaretPosition: caretPos,
    previousConformedValue: previousState.lastConformedValue,
    placeholderChar,
  });

  if (resolvedPattern === false) {
    return {
      displayValue: rawStr,
      placeholder: "",
      nextCaret: caretPos,
    };
  }

  const placeholder = buildPlaceholder(resolvedPattern, placeholderChar);
  const conformed = applyMask(rawStr, resolvedPattern, {
    previousConformedValue: previousState.lastConformedValue,
    guide,
    placeholderChar,
    placeholder,
    currentCaretPosition: caretPos,
    keepCharPositions,
  });

  const nextCaret = computeCaretPosition({
    previousConformedValue: previousState.lastConformedValue,
    previousPlaceholder: previousState.lastPlaceholder,
    conformedValue: conformed,
    placeholder,
    rawValue: rawStr,
    currentCaretPosition: caretPos,
    placeholderChar,
  });

  const isEmpty = conformed === placeholder && nextCaret === 0;

  return {
    displayValue: isEmpty ? (showMask ? placeholder : "") : conformed,
    placeholder,
    nextCaret,
  };
}

export function useMaskInput(
  value: string | number | null | undefined,
  config: MaskInputConfig,
) {
  const {
    mask,
    guide = true,
    placeholderChar = DEFAULT_PLACEHOLDER_CHAR,
    keepCharPositions,
    showMask,
    controlled = true,
    initialValue,
  } = config;

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [displayValue, setDisplayValue] = useState(() => {
    const s: MaskState = { lastConformedValue: "", lastPlaceholder: "", lastShowMask: showMask };
    return resolveMaskedState(value ?? initialValue, s, config).displayValue;
  });
  const [syncToken, setSyncToken] = useState(0);
  const pendingCaret = useRef(0);

  const stateRef = useRef<MaskState | null>(null);
  if (stateRef.current === null) {
    const s: MaskState = { lastConformedValue: "", lastPlaceholder: "", lastShowMask: showMask };
    const init = resolveMaskedState(value ?? initialValue, s, config);
    stateRef.current = { lastConformedValue: init.displayValue, lastPlaceholder: init.placeholder, lastShowMask: showMask };
  }

  const processValue = useCallback(
    (incoming?: string | number | null) => {
      const el = inputRef.current;
      const raw = incoming === undefined ? (el?.value ?? "") : incoming;
      const state = stateRef.current!;

      const showMaskChanged = showMask !== state.lastShowMask;
      if (raw === state.lastConformedValue && !showMaskChanged) return;
      state.lastShowMask = showMask;

      const rawStr = toInputString(raw);
      const selectionPos = el?.selectionEnd ?? rawStr.length;
      const nextState = resolveMaskedState(
        rawStr,
        state,
        {
          mask,
          guide,
          placeholderChar,
          keepCharPositions,
          showMask,
        },
        selectionPos,
      );

      state.lastConformedValue = nextState.displayValue;
      state.lastPlaceholder = nextState.placeholder;

      setDisplayValue(nextState.displayValue);
      pendingCaret.current = nextState.nextCaret;
      setSyncToken((t) => t + 1);
    },
    [mask, guide, placeholderChar, keepCharPositions, showMask],
  );

  useLayoutEffect(() => {
    const el = inputRef.current;
    if (el) setCaret(el, pendingCaret.current);
  }, [syncToken]);

  useLayoutEffect(() => {
    if (controlled) return;
    const el = inputRef.current;
    if (el && el.value !== displayValue) {
      el.value = displayValue;
    }
  }, [controlled, displayValue]);

  useLayoutEffect(() => {
    processValue(value);
  }, [processValue, value]);

  const onChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      processValue(e.target.value);
      e.target.value = stateRef.current!.lastConformedValue;
    },
    [processValue],
  );

  return { inputRef, maskedValue: displayValue, onChange };
}
