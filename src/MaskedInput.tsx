import React, {
  ChangeEvent,
  FocusEvent,
  InputHTMLAttributes,
  KeyboardEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import "./masked-input.css";
import { useMaskInput } from "./use-mask-input";
import { Mask, PLACEHOLDER } from "./types";

export type InputComponentProps = InputHTMLAttributes<HTMLInputElement> & {
  ref?: React.Ref<HTMLInputElement | null>;
};

export type InputComponent = React.ComponentType<InputComponentProps>;

export interface MaskedInputOwnProps {
  /**
   * The mask pattern. Each element is either:
   * - A **string** — a literal fixed character (e.g. `"/"`, `"-"`)
   * - A **RegExp** — a user-fillable slot; the typed character must match
   *
   * Can also be a **function** `(rawValue, config?) => MaskArray | false`
   * for dynamic masks that change based on input (e.g. credit card types).
   *
   * Set to `false` to disable masking entirely.
   */
  mask: Mask;

  /**
   * Show placeholder characters for unfilled positions.
   * @default true
   */
  guide?: boolean;

  /**
   * Character used for unfilled positions. Must not appear as a literal in the mask.
   * @default "_"
   */
  placeholderChar?: string;

  /**
   * Keep existing characters in place when inserting or deleting,
   * rather than shifting left/right.
   * @default true
   */
  keepCharPositions?: boolean;

  /**
   * Whether to show the full mask when the field is empty.
   * - `true` — always show
   * - `false` — always hide
   * - `undefined` — show on focus, hide on blur
   */
  showMask?: boolean;

  /**
   * Custom input component to render instead of the built-in `<input>`.
   * Must accept standard HTML input attributes and forward a ref to an
   * `HTMLInputElement`. Use this to integrate with MUI, shadcn/ui, etc.
   *
   * @example
   * // MUI
   * <MaskedInput mask={phoneMask} inputComponent={OutlinedInput} />
   *
   * @example
   * // shadcn/ui
   * <MaskedInput mask={phoneMask} inputComponent={Input} />
   */
  inputComponent?: InputComponent;

  ref?: React.Ref<HTMLInputElement | null>;
}

export type MaskedInputProps = MaskedInputOwnProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, "ref">;

function moveCaretToStart(el: HTMLInputElement, placeholderChar: string) {
  if (document.activeElement !== el) return;
  const { value } = el;
  if (typeof el.selectionStart === "number") {
    const ind = value.indexOf(placeholderChar);
    if (ind > -1) {
      el.selectionStart = el.selectionEnd = ind;
    }
  }
}

export const MaskedInput = React.forwardRef<
  HTMLInputElement | null,
  MaskedInputProps
>(function MaskedInput(props, ref) {
  const {
    mask,
    guide = true,
    placeholderChar = PLACEHOLDER,
    keepCharPositions = true,
    showMask: showMaskProp,
    inputComponent: InputComponent,
    value,
    onBlur,
    onChange,
    onFocus,
    onKeyDown,
    className,
    style,
    ...rest
  } = props;

  const frameRef = useRef<number>(0);
  const mountedRef = useRef(true);
  const [showMaskState, setShowMaskState] = useState(false);
  const isShowMaskControlled = showMaskProp !== undefined;
  const showMask = isShowMaskControlled ? !!showMaskProp : showMaskState;

  const {
    inputRef,
    maskedValue,
    onChange: handleMaskedChange,
  } = useMaskInput(value as string | number | null | undefined, {
    mask,
    guide,
    placeholderChar,
    keepCharPositions,
    showMask,
  });

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  const composedRef = useCallback(
    (node: HTMLInputElement | null) => {
      inputRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
      }
    },
    [inputRef, ref],
  );

  function handleMaskedChangeWithEvent(event: ChangeEvent<HTMLInputElement>) {
    handleMaskedChange(event);
    onChange?.(event);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (["Delete", "Backspace"].includes(event.key)) {
      const el = event.target as HTMLInputElement;
      if (
        el &&
        el.selectionStart === 0 &&
        el.selectionEnd === (el.value || "").length
      ) {
        el.value = "";
        handleMaskedChangeWithEvent({
          ...event,
          target: el,
          currentTarget: el,
        } as unknown as ChangeEvent<HTMLInputElement>);
      }
    }
    onKeyDown?.(event);
  }

  function handleFocus(event: FocusEvent<HTMLInputElement>) {
    if (!isShowMaskControlled) {
      queueMicrotask(() => {
        if (mountedRef.current) setShowMaskState(true);
      });
    }
    const inputEl = event.currentTarget;
    frameRef.current = requestAnimationFrame(() =>
      moveCaretToStart(inputEl, placeholderChar),
    );
    onFocus?.(event);
  }

  function handleBlur(event: FocusEvent<HTMLInputElement>) {
    cancelAnimationFrame(frameRef.current);
    if (!isShowMaskControlled) {
      queueMicrotask(() => {
        if (mountedRef.current) setShowMaskState(false);
      });
    }
    onBlur?.(event);
  }

  const sharedProps = {
    ...rest,
    ref: composedRef,
    value: maskedValue,
    style,
    onKeyDown: handleKeyDown,
    onFocus: handleFocus,
    onBlur: handleBlur,
    onChange: handleMaskedChangeWithEvent,
  };

  if (InputComponent) {
    return <InputComponent {...sharedProps} className={className} />;
  }

  return (
    <input
      {...sharedProps}
      className={`rmi-input${className ? ` ${className}` : ""}`}
    />
  );
});
