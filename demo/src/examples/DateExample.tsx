import { useMemo, useState } from "react";
import { MaskedInput } from "react-mask-input";

export function DateExample() {
  const [value, setValue] = useState("");

  const dateMask = useMemo(
    () => [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/],
    [],
  );

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
