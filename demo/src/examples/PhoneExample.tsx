import { useMemo, useState } from "react";
import { MaskedInput } from "react-mask-input";

export function PhoneExample() {
  const [value, setValue] = useState("");
  const [guide, setGuide] = useState(true);

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
      <div className="example-controls">
        <label>
          <input
            type="checkbox"
            checked={guide}
            onChange={(e) => setGuide(e.target.checked)}
          />
          {" "}Guide mode
        </label>
      </div>
      <MaskedInput
        mask={phoneMask}
        guide={guide}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="(555) 000-0000"
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
