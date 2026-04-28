import { useState } from "react";
import { MaskedInput, MaskFunction } from "@itsmemyk/react-mask-input";

// Amex starts with 34 or 37 → 15 digits formatted as XXXX XXXXXX XXXXX
// All others → 16 digits formatted as XXXX XXXX XXXX XXXX
const cardMask: MaskFunction = (rawValue) => {
  const digits = rawValue.replace(/\D/g, "");
  const isAmex = digits.startsWith("34") || digits.startsWith("37");

  if (isAmex) {
    return [
      /\d/, /\d/, /\d/, /\d/, " ",
      /\d/, /\d/, /\d/, /\d/, /\d/, /\d/, " ",
      /\d/, /\d/, /\d/, /\d/, /\d/,
    ];
  }

  return [
    /\d/, /\d/, /\d/, /\d/, " ",
    /\d/, /\d/, /\d/, /\d/, " ",
    /\d/, /\d/, /\d/, /\d/, " ",
    /\d/, /\d/, /\d/, /\d/,
  ];
};

export function DynamicMaskExample() {
  const [value, setValue] = useState("");

  const digits = value.replace(/\D/g, "");
  const isAmex = digits.startsWith("34") || digits.startsWith("37");

  return (
    <div>
      <MaskedInput
        mask={cardMask}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Card number"
      />
      <p className="example-value">
        Detected: <code>{isAmex && digits.length >= 2 ? "Amex (15 digits)" : "Standard (16 digits)"}</code>
      </p>
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
