import { useMemo, useState } from "react";
import { MaskedInput } from "react-mask-input";

export function CreditCardExample() {
  const [value, setValue] = useState("");
  const [showMask, setShowMask] = useState<boolean | undefined>(undefined);

  const cardMask = useMemo(
    () => [
      /\d/, /\d/, /\d/, /\d/, " ",
      /\d/, /\d/, /\d/, /\d/, " ",
      /\d/, /\d/, /\d/, /\d/, " ",
      /\d/, /\d/, /\d/, /\d/,
    ],
    [],
  );

  return (
    <div>
      <div className="example-controls">
        <label>
          <input
            type="radio"
            name="showMask"
            checked={showMask === undefined}
            onChange={() => setShowMask(undefined)}
          />
          {" "}Auto (focus/blur)
        </label>
        <label>
          <input
            type="radio"
            name="showMask"
            checked={showMask === true}
            onChange={() => setShowMask(true)}
          />
          {" "}Always show
        </label>
        <label>
          <input
            type="radio"
            name="showMask"
            checked={showMask === false}
            onChange={() => setShowMask(false)}
          />
          {" "}Always hide
        </label>
      </div>
      <MaskedInput
        mask={cardMask}
        showMask={showMask}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="____ ____ ____ ____"
      />
      <p className="example-value">Value: <code>{JSON.stringify(value)}</code></p>
    </div>
  );
}
