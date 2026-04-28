import { useMemo, useState } from "react";
import { MaskedInput } from "@itsmemyk/react-mask-input";

// HH:MM:SS  — hours 00–99, minutes 00–59, seconds 00–59
export function DurationExample() {
  const [value, setValue] = useState("");

  const durationMask = useMemo(
    () => [
      /\d/, /\d/,   // HH: 00–99
      ":",
      /[0-5]/, /\d/, // MM: 00–59
      ":",
      /[0-5]/, /\d/, // SS: 00–59
    ],
    [],
  );

  return (
    <div>
      <MaskedInput
        mask={durationMask}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="HH:MM:SS"
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
