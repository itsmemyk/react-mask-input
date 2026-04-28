import { useMemo, useState } from "react";
import { useMaskInput } from "@itsmemyk/react-mask-input";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";

export function MuiExample() {
  const [value, setValue] = useState("");

  const phoneMask = useMemo(
    () => [
      "(",
      /[1-9]/,
      /\d/,
      /\d/,
      ")",
      " ",
      /\d/,
      /\d/,
      /\d/,
      "-",
      /\d/,
      /\d/,
      /\d/,
      /\d/,
    ],
    [],
  );

  const { inputRef, maskedValue, onChange: handleMaskedChange } = useMaskInput(
    value,
    { mask: phoneMask },
  );

  return (
    <div>
      <OutlinedInput
        inputRef={inputRef}
        value={maskedValue}
        onChange={(e) => {
          handleMaskedChange(e);
          setValue(e.target.value);
        }}
        startAdornment={<InputAdornment position="start">📞</InputAdornment>}
        placeholder="(555) 000-0000"
        size="small"
        fullWidth
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
