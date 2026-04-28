import { useState } from "react";
import { MaskedInput, MaskFactory } from "@itsmemyk/react-mask-input";

// HH: 00–23  MM: 00–59
const timeMask: MaskFactory = (value) => {
  const digits = value.replace(/\D/g, "");
  const h1 = Number(digits[0] ?? 0);

  return [
    /[0-2]/,                      // H1: 0–2
    h1 === 2 ? /[0-3]/ : /\d/,   // H2: 0–3 when H1=2, else 0–9
    ":",
    /[0-5]/,                      // M1: 0–5
    /\d/,                         // M2: 0–9
  ];
};

export function TimeExample() {
  const [value, setValue] = useState("");

  return (
    <div>
      <MaskedInput
        mask={timeMask}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="HH:MM"
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
