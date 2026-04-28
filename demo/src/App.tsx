import { useState } from "react";
import { PhoneExample } from "./examples/PhoneExample";
import { DateExample } from "./examples/DateExample";
import { CreditCardExample } from "./examples/CreditCardExample";
import { DynamicMaskExample } from "./examples/DynamicMaskExample";
import { MuiExample } from "./examples/MuiExample";
import "./App.css";

const TABS = [
  {
    id: "phone",
    label: "Phone",
    description: "Static mask — US phone number",
    code: `const phoneMask = useMemo(() => [
  "(", /[1-9]/, /\\d/, /\\d/, ")", " ",
  /\\d/, /\\d/, /\\d/, "-",
  /\\d/, /\\d/, /\\d/, /\\d/,
], []);

<MaskedInput
  mask={phoneMask}
  guide={guide}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`,
    component: <PhoneExample />,
  },
  {
    id: "date",
    label: "Date",
    description: "Static mask — DD/MM/YYYY with keepCharPositions",
    code: `const dateMask = useMemo(() => [
  /\\d/, /\\d/, "/", /\\d/, /\\d/, "/",
  /\\d/, /\\d/, /\\d/, /\\d/,
], []);

<MaskedInput
  mask={dateMask}
  keepCharPositions
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`,
    component: <DateExample />,
  },
  {
    id: "creditcard",
    label: "Credit Card",
    description: "16-digit card with showMask control",
    code: `const cardMask = useMemo(() => [
  /\\d/, /\\d/, /\\d/, /\\d/, " ",
  /\\d/, /\\d/, /\\d/, /\\d/, " ",
  /\\d/, /\\d/, /\\d/, /\\d/, " ",
  /\\d/, /\\d/, /\\d/, /\\d/,
], []);

<MaskedInput
  mask={cardMask}
  showMask={showMask}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`,
    component: <CreditCardExample />,
  },
  {
    id: "dynamic",
    label: "Dynamic Mask",
    description: "Function mask — Amex vs standard card",
    code: `const cardMask: MaskFunction = (rawValue) => {
  const digits = rawValue.replace(/\\D/g, "");
  const isAmex = digits.startsWith("34")
               || digits.startsWith("37");
  if (isAmex) {
    return [/\\d/,/\\d/,/\\d/,/\\d/," ",
            /\\d/,/\\d/,/\\d/,/\\d/,/\\d/,/\\d/," ",
            /\\d/,/\\d/,/\\d/,/\\d/,/\\d/];
  }
  return [/\\d/,/\\d/,/\\d/,/\\d/," ",
          /\\d/,/\\d/,/\\d/,/\\d/," ",
          /\\d/,/\\d/,/\\d/,/\\d/," ",
          /\\d/,/\\d/,/\\d/,/\\d/];
};

<MaskedInput mask={cardMask} value={value}
  onChange={(e) => setValue(e.target.value)} />`,
    component: <DynamicMaskExample />,
  },
  {
    id: "mui",
    label: "MUI",
    description: "Headless hook — MUI OutlinedInput",
    code: `import { useMaskInput } from "@itsmemyk/react-mask-input";
import OutlinedInput from "@mui/material/OutlinedInput";

const { inputRef, maskedValue, onChange } = useMaskInput(
  value, { mask: phoneMask }
);

<OutlinedInput
  inputRef={inputRef}
  value={maskedValue}
  onChange={(e) => {
    onChange(e);
    setValue(e.target.value);
  }}
  startAdornment={
    <InputAdornment position="start">📞</InputAdornment>
  }
/>`,
    component: <MuiExample />,
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("phone");
  const active = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="app">
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-logo">🎭</div>
          <div>
            <h1>@itsmemyk/react-mask-input</h1>
            <p>A lightweight React masked input component with static &amp; dynamic mask support</p>
          </div>
          <div className="app-badges">
            <a
              href="https://www.npmjs.com/package/@itsmemyk/react-mask-input"
              target="_blank"
              rel="noopener noreferrer"
              className="badge"
            >
              npm
            </a>
            <a
              href="https://github.com/itsmemyk/react-mask-input"
              target="_blank"
              rel="noopener noreferrer"
              className="badge badge-secondary"
            >
              GitHub
            </a>
          </div>
        </div>
      </header>

      <main className="app-main">
        <section className="install-section">
          <code className="install-cmd">npm install @itsmemyk/react-mask-input</code>
        </section>

        <section className="demo-section">
          <div className="tabs">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                className={`tab-btn${activeTab === tab.id ? " active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="demo-panel">
            <div className="demo-left">
              <p className="demo-description">{active.description}</p>
              <div className="demo-input-area">{active.component}</div>
            </div>
            <div className="demo-right">
              <pre className="code-block"><code>{active.code}</code></pre>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2>Features</h2>
          <div className="features-grid">
            {[
              { icon: "🎯", title: "Static masks", desc: "Array of string literals and RegExp slots" },
              { icon: "🔄", title: "Dynamic masks", desc: "Function form — mask changes based on input value" },
              { icon: "🪝", title: "useMaskInput hook", desc: "Headless hook to attach masking to any input" },
              { icon: "🔌", title: "Custom input", desc: "inputComponent prop for MUI, shadcn/ui, and more" },
              { icon: "📍", title: "Caret management", desc: "Precise caret positioning including Android support" },
              { icon: "0️⃣", title: "Zero dependencies", desc: "No runtime deps — just React as a peer dep" },
            ].map((f) => (
              <div key={f.title} className="feature-card">
                <span className="feature-icon">{f.icon}</span>
                <strong>{f.title}</strong>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="app-footer">
        <p>MIT License · Built with ❤️ using React &amp; Vite</p>
      </footer>
    </div>
  );
}
