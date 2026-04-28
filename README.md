# @itsmemyk/react-mask-input

A lightweight React masked input component with static & dynamic mask support, guide mode, caret management, and a headless `useMaskInput` hook. Zero runtime dependencies.

## Installation

```bash
npm install @itsmemyk/react-mask-input
```

Import the default styles (optional — skip if you supply your own):

```ts
import "@itsmemyk/react-mask-input/style";
```

## Quick Start

```tsx
import { useMemo, useState } from "react";
import { MaskedInput } from "@itsmemyk/react-mask-input";
import "@itsmemyk/react-mask-input/style";

function PhoneInput() {
  const [value, setValue] = useState("");

  const phoneMask = useMemo(
    () => ["(", /[1-9]/, /\d/, /\d/, ")", " ", /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/, /\d/],
    [],
  );

  return (
    <MaskedInput
      mask={phoneMask}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder="(555) 000-0000"
    />
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `mask` | `MaskPattern \| MaskFactory \| false` | — | **Required.** The mask pattern (see below). |
| `guide` | `boolean` | `true` | Show placeholder characters for unfilled slots. |
| `placeholderChar` | `string` | `"_"` | Character for unfilled positions. Must not appear as a literal in the mask. |
| `keepCharPositions` | `boolean` | `true` | Keep existing characters in place on insert/delete instead of shifting. |
| `showMask` | `boolean \| undefined` | `undefined` | `true` = always show mask, `false` = always hide, `undefined` = show on focus / hide on blur. |
| `inputComponent` | `InputComponent` | — | Custom input component (MUI, shadcn/ui, etc.). Must forward a ref and accept standard HTML input attributes. |

All standard HTML `<input>` attributes (`className`, `style`, `disabled`, `placeholder`, etc.) are forwarded.

## Mask Formats

### Static array

Each element is either a **string literal** (fixed character) or a **RegExp** (user-fillable slot):

```tsx
// Date: DD/MM/YYYY
const dateMask = useMemo(
  () => [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/],
  [],
);
```

> **Tip:** Memoize the array to avoid re-processing on every render.

### Dynamic function

Return a different mask array based on the current value:

```tsx
import { MaskFactory } from "@itsmemyk/react-mask-input";

const cardMask: MaskFactory = (rawValue) => {
  const digits = rawValue.replace(/\D/g, "");
  const isAmex = digits.startsWith("34") || digits.startsWith("37");
  if (isAmex) {
    // Amex: XXXX XXXXXX XXXXX
    return [/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/,/\d/];
  }
  // Standard: XXXX XXXX XXXX XXXX
  return [/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/," ",/\d/,/\d/,/\d/,/\d/];
};
```

### Disable masking

Pass `false` to render a plain unmasked input:

```tsx
<MaskedInput mask={false} value={value} onChange={...} />
```

## Custom Input Component

The `inputComponent` prop works with thin `<input>` wrappers (e.g. shadcn/ui):

```tsx
import { Input } from "@/components/ui/input"; // shadcn/ui
import { MaskedInput } from "@itsmemyk/react-mask-input";

<MaskedInput
  mask={phoneMask}
  value={value}
  onChange={(e) => setValue(e.target.value)}
  inputComponent={Input}
/>
```

For complex component libraries like **MUI** that have their own internal input model, use the `useMaskInput` hook directly:

```tsx
import { useMaskInput } from "@itsmemyk/react-mask-input";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

const { inputRef, maskedValue, onChange } = useMaskInput(value, { mask: phoneMask });

<OutlinedInput
  inputRef={inputRef}
  value={maskedValue}
  onChange={(e) => {
    onChange(e);
    setValue(e.target.value);
  }}
  startAdornment={<InputAdornment position="start">📞</InputAdornment>}
/>
```

## Headless Hook

Use `useMaskInput` to attach masking to any custom input element:

```tsx
import { useMaskInput } from "@itsmemyk/react-mask-input";

function MyInput({ mask, value, onChange }) {
  const { inputRef, maskedValue, onChange: handleChange } = useMaskInput(value, {
    mask,
    guide: true,
  });

  return (
    <input
      ref={inputRef}
      value={maskedValue}
      onChange={(e) => {
        handleChange(e);
        onChange(e);
      }}
    />
  );
}
```

### `useMaskInput(value, config)`

| Config | Type | Default | Description |
|--------|------|---------|-------------|
| `mask` | `Mask` | — | The mask (same as `MaskedInput`). |
| `guide` | `boolean` | `true` | Show placeholder characters. |
| `placeholderChar` | `string` | `"_"` | Character for unfilled positions. |
| `keepCharPositions` | `boolean` | `undefined` | Keep character positions on edit. |
| `showMask` | `boolean` | `undefined` | Show the full mask when the field is empty. |

Returns `{ inputRef, maskedValue, onChange }`.

## Styling

### Default styles

Import once in your app entry:

```ts
import "@itsmemyk/react-mask-input/style";
```

The default styles are scoped to the `.rmi-input` class (applied only on the built-in `<input>`, not when using `inputComponent`).

### Override with className / style

```tsx
<MaskedInput
  mask={phoneMask}
  className="my-custom-input"
  style={{ fontSize: "1.2rem" }}
  value={value}
  onChange={...}
/>
```

### No styles

Simply skip the import and style the component yourself.

## TypeScript

All types are exported:

```ts
import type {
  Mask,
  MaskArray,
  MaskPattern,
  MaskFactory,
  MaskFunction,
  MaskFactoryContext,
  MaskInputConfig,
  MaskedInputProps,
  InputComponent,
} from "@itsmemyk/react-mask-input";
```

## License

MIT © [Mayank Mahadevwala](https://github.com/itsmemyk)
