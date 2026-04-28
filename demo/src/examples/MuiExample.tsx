import { useMemo, useState } from "react";
import { MaskedInput } from "react-mask-input";
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

  return (
    <div>
      <MaskedInput
        mask={phoneMask}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        inputComponent={OutlinedInput as React.ComponentType<React.InputHTMLAttributes<HTMLInputElement> & { ref?: React.Ref<HTMLInputElement | null> }>}
        startAdornment={<InputAdornment position="start">📞</InputAdornment>}
        placeholder="(555) 000-0000"
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
