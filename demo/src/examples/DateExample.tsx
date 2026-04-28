import { useState } from "react";
import { MaskedInput, MaskFactory } from "@itsmemyk/react-mask-input";

// DD: 01–31  MM: 01–12  YYYY: any 4 digits
const dateMask: MaskFactory = (value) => {
  const digits = value.replace(/\D/g, "");
  const d1 = Number(digits[0] ?? 0);
  const m1 = Number(digits[2] ?? 0);

  return [
    /[0-3]/,                      // D1: 0–3
    d1 === 3 ? /[0-1]/ : /\d/,   // D2: 0–1 when D1=3, else 0–9
    "/",
    /[0-1]/,                      // M1: 0–1
    m1 === 1 ? /[0-2]/ : /[1-9]/, // M2: 0–2 when M1=1, else 1–9
    "/",
    /\d/, /\d/, /\d/, /\d/,       // YYYY
  ];
};

export function DateExample() {
  const [value, setValue] = useState("");

  return (
    <div>
      <MaskedInput
        mask={dateMask}
        keepCharPositions
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="DD/MM/YYYY"
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
