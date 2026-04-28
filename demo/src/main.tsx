import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "react-mask-input/style";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
